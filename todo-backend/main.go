package main

import (
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"todo-backend/config"
	"todo-backend/controllers"
)

func main() {
	// 1. Inisialisasi Koneksi Database PostgreSQL & Auto Migration
	config.ConnectDB()

	// 2. Inisialisasi Gin Engine
	r := gin.Default()

	// 3. Konfigurasi Middleware CORS untuk Frontend
	// Mendukung localhost, IP jaringan lokal (WiFi LAN), serta Cloud Frontend Vercel
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			if origin == "" ||
				strings.HasPrefix(origin, "http://localhost:") ||
				strings.HasPrefix(origin, "http://127.0.0.1:") ||
				strings.HasPrefix(origin, "http://192.168.") ||
				strings.HasPrefix(origin, "http://10.") ||
				strings.HasPrefix(origin, "http://172.") ||
				strings.Contains(origin, "vercel.app") ||
				origin == "https://kelarin-eight.vercel.app" {
				return true
			}
			return false
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 4. Endpoint Root untuk verifikasi status API (Health Check untuk Render / Railway)
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message":  "REST API To-Do List (UKK PPLG) aktif",
			"status":   "healthy",
			"database": "PostgreSQL",
		})
	})

	// 5. Registrasi Rute REST API
	api := r.Group("/api")
	{
		api.GET("/todos", controllers.GetTodos)
		api.POST("/todos", controllers.CreateTodo)
		api.PUT("/todos/:id", controllers.UpdateTodo)
		api.DELETE("/todos/completed", controllers.ClearCompletedTodos)
		api.DELETE("/todos/:id", controllers.DeleteTodo)
	}

	// 6. Jalankan Server (Port dinamis dari environment variable untuk Render/Railway/Heroku atau default :8080)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if !strings.HasPrefix(port, ":") {
		port = ":" + port
	}

	log.Printf("🚀 Server To-Do REST API berjalan di port %s\n", port)
	if err := r.Run(port); err != nil {
		log.Fatalf("❌ Gagal menjalankan server: %v", err)
	}
}
