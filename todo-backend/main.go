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
	// 1. Inisialisasi Koneksi Database MySQL & Auto Migration
	config.ConnectDB()

	// 2. Inisialisasi Gin Engine
	r := gin.Default()

	// 3. Konfigurasi Middleware CORS untuk Frontend React (http://localhost:5173 & http://localhost:5174)
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:5174",
			"http://127.0.0.1:5173",
			"http://127.0.0.1:5174",
			"https://kelarin-eight.vercel.app",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 4. Endpoint Root untuk verifikasi status API
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "REST API To-Do List (UKK PPLG) aktif",
			"status":  "healthy",
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

	// 6. Jalankan Server (Port dinamis dari environment variable atau default :8080)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if !strings.HasPrefix(port, ":") {
		port = ":" + port
	}

	log.Printf("🚀 Server To-Do REST API berjalan di http://localhost%s\n", port)
	if err := r.Run(port); err != nil {
		log.Fatalf("❌ Gagal menjalankan server: %v", err)
	}
}

