package config

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"todo-backend/models"
)

// DB adalah instance global GORM database connection
var DB *gorm.DB

// ConnectDB menginisialisasi koneksi PostgreSQL (Mendukung Cloud Database seperti Neon, Supabase, Render, Railway, maupun Lokal) dan Auto-Migration
func ConnectDB() {
	// 1. Muat file .env jika ada (di cloud seperti Render/Railway, environment variable diinjeksi langsung oleh platform)
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️  File .env tidak ditemukan, menggunakan environment variable sistem / default.")
	}

	var dsn string

	// 2. Cek apakah ada DATABASE_URL atau DB_DSN lengkap (diberikan langsung oleh Cloud Provider: Neon, Supabase, Railway, Render)
	envURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if envURL == "" {
		envURL = strings.TrimSpace(os.Getenv("DB_DSN"))
	}
	if envURL == "" {
		envURL = strings.TrimSpace(os.Getenv("DB_URL"))
	}

	if envURL != "" {
		dsn = envURL
	} else {
		host := getEnv("DB_HOST", "localhost")
		port := getEnv("DB_PORT", "5432")
		user := getEnv("DB_USER", "postgres")
		password := getEnv("DB_PASSWORD", "postgres")
		dbName := getEnv("DB_NAME", "todo_db")

		// Tentukan sslmode: jika localhost default disable, jika cloud default require
		defaultSSL := "disable"
		if host != "localhost" && host != "127.0.0.1" {
			defaultSSL = "require"
		}
		sslMode := getEnv("DB_SSLMODE", defaultSSL)

		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
			host, user, password, dbName, port, sslMode)
	}

	// 3. Hubungkan ke database PostgreSQL
	log.Println("🔌 Menghubungkan ke database PostgreSQL (Cloud / Remote / Lokal)...")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("❌ Gagal terhubung ke database PostgreSQL: %v\nTips: Periksa DATABASE_URL atau kredensial DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSLMODE di file .env.", err)
	}

	// 4. Auto Migration skema tabel Todo
	log.Println("🔄 Menjalankan Auto Migration skema tabel di PostgreSQL...")
	if err := db.AutoMigrate(&models.Todo{}); err != nil {
		log.Fatalf("❌ Gagal migrasi skema tabel Todo di PostgreSQL: %v", err)
	}

	DB = db
	log.Println("✅ Berhasil terhubung ke database PostgreSQL & skema tabel siap digunakan!")
}

// getEnv mengambil nilai dari environment variable dengan nilai cadangan (fallback)
func getEnv(key, fallback string) string {
	if val := os.Getenv(key); strings.TrimSpace(val) != "" {
		return strings.TrimSpace(val)
	}
	return fallback
}
