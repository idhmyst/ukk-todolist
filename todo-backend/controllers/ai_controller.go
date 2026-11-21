package controllers

import (
	"bytes"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// ProxyOllamaChat meneruskan request AI ke Ollama lokal (bebas CORS & mixed content)
// POST /api/ai/chat
func ProxyOllamaChat(c *gin.Context) {
	ollamaURL := strings.TrimSpace(os.Getenv("OLLAMA_URL"))
	if ollamaURL == "" {
		ollamaURL = "http://127.0.0.1:11434"
	}

	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membaca body request: " + err.Error()})
		return
	}

	client := &http.Client{
		Timeout: 90 * time.Second,
	}

	targetURL := strings.TrimRight(ollamaURL, "/") + "/api/chat"
	req, err := http.NewRequestWithContext(c.Request.Context(), "POST", targetURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat request ke Ollama: " + err.Error()})
		return
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "Tidak dapat terhubung ke Ollama di " + ollamaURL + ". Pastikan Ollama sedang berjalan di laptop Anda.",
		})
		return
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membaca balasan dari Ollama"})
		return
	}

	c.Data(resp.StatusCode, "application/json", respBytes)
}
