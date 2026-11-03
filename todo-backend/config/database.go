package config

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"todo-backend/models"
)

// DB adalah instance global GORM database connection
var DB *gorm.DB

// ConnectDB menginisialisasi koneksi MySQL (Laragon) dan menjalankan auto-migration tabel
func ConnectDB() {
	// Konfigurasi koneksi MySQL bawaan Laragon
	user := "root"
	password := ""
	host := "127.0.0.1"
	port := "3306"
	dbName := "todo_db"

	// 1. Koneksi awal ke server MySQL untuk memastikan database todo_db otomatis dibuat jika belum ada
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

	// 2. Hubungkan langsung ke database todo_db
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, password, host, port, dbName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ Gagal terhubung ke MySQL Laragon: %v\nCatatan: Pastikan MySQL di aplikasi Laragon sudah di-Start (Running).", err)
	}

	// 3. Auto Migration skema tabel Todo
	log.Println("🔄 Menjalankan Auto Migration...")
	if err := db.AutoMigrate(&models.Todo{}); err != nil {
		log.Fatalf("❌ Gagal migrasi skema tabel Todo: %v", err)
	}

	DB = db
	log.Println("✅ Koneksi database MySQL Laragon berhasil & skema tabel siap digunakan!")
}

