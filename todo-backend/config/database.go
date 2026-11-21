package config

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"todo-backend/models"
)

// DB adalah instance global GORM database connection
var DB *gorm.DB

// ConnectDB menginisialisasi koneksi database (Mendukung Cloud MySQL Online maupun Lokal) dan Auto-Migration
func ConnectDB() {
	// 1. Muat file .env jika ada
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️  File .env tidak ditemukan, menggunakan variabel lingkungan sistem / default.")
	}

	var dsn string

	// 2. Cek apakah ada DB_DSN lengkap (sering diberikan langsung oleh cloud provider seperti TiDB / Railway / Aiven)
	envDSN := strings.TrimSpace(os.Getenv("DB_DSN"))
	if envDSN != "" {
		dsn = envDSN
	} else {
		user := getEnv("DB_USER", "root")
		password := getEnv("DB_PASSWORD", "")
		host := getEnv("DB_HOST", "127.0.0.1")
		port := getEnv("DB_PORT", "3306")
		dbName := getEnv("DB_NAME", "todo_db")
		sslMode := getEnv("DB_SSL", "false") // Set "true" untuk Cloud MySQL (TiDB, Aiven, PlanetScale, dll)

		// Jika host lokal, coba buat database otomatis jika belum ada di server MySQL lokal
		if host == "127.0.0.1" || host == "localhost" {
			rootDSN := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
				user, password, host, port)

			serverDB, err := gorm.Open(mysql.Open(rootDSN), &gorm.Config{
				Logger: logger.Default.LogMode(logger.Silent),
			})
			if err == nil {
				serverDB.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", dbName))
				if sqlDB, err := serverDB.DB(); err == nil {
					_ = sqlDB.Close()
				}
			}
		}

		// Buat DSN dengan opsi TLS/SSL jika menggunakan Cloud Database
		tlsParam := ""
		if strings.ToLower(sslMode) == "true" {
			tlsParam = "&tls=true"
		} else if strings.ToLower(sslMode) == "preferred" {
			tlsParam = "&tls=preferred"
		}

		dsn = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local%s",
			user, password, host, port, dbName, tlsParam)
	}

	// 3. Hubungkan ke database (Cloud / Lokal)
	log.Println("🔌 Menghubungkan ke database...")
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ Gagal terhubung ke database: %v\nTips: Periksa kredensial di file .env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL).", err)
	}

	// 4. Auto Migration skema tabel Todo
	log.Println("🔄 Menjalankan Auto Migration skema tabel...")
	if err := db.AutoMigrate(&models.Todo{}); err != nil {
		log.Fatalf("❌ Gagal migrasi skema tabel Todo: %v", err)
	}

	DB = db
	log.Println("✅ Berhasil terhubung ke database & skema tabel siap digunakan!")
}

// getEnv mengambil nilai dari environment variable dengan nilai cadangan (fallback)
func getEnv(key, fallback string) string {
	if val := os.Getenv(key); strings.TrimSpace(val) != "" {
		return strings.TrimSpace(val)
	}
	return fallback
}
