package controllers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"todo-backend/config"
	"todo-backend/models"
)

// GetTodos mengambil seluruh daftar tugas terurut dari ID terbesar/terbaru
// GET /api/todos
func GetTodos(c *gin.Context) {
	// Inisialisasi slice kosong agar menghasilkan JSON [] bukannya null saat data masih kosong
	todos := make([]models.Todo, 0)

	if err := config.DB.Order("id desc").Find(&todos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data to-do: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": todos,
	})
}

// CreateTodo menambahkan tugas baru ke database
// POST /api/todos
func CreateTodo(c *gin.Context) {
	var input models.CreateTodoInput

	// Validasi field title (wajib diisi via binding:"required")
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Field 'title' wajib diisi",
		})
		return
	}

	trimmedTitle := strings.TrimSpace(input.Title)
	if trimmedTitle == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Field 'title' tidak boleh hanya berisi spasi",
		})
		return
	}

	// Normalisasi priority (low, medium, high), default ke 'medium'
	priority := strings.ToLower(strings.TrimSpace(input.Priority))
	if priority != "low" && priority != "medium" && priority != "high" {
		priority = "medium"
	}

	reminder := strings.ToLower(strings.TrimSpace(input.Reminder))
	if reminder == "" {
		reminder = "30m"
	}

	todo := models.Todo{
		Title:       trimmedTitle,
		Priority:    priority,
		IsCompleted: false,
		DueDate:     strings.TrimSpace(input.DueDate),
		Reminder:    reminder,
	}

	if err := config.DB.Create(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal menyimpan to-do ke database: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": todo,
	})
}

// UpdateTodo mengupdate judul, prioritas, tanggal deadline, atau status penyelesaian (is_completed)
// PUT /api/todos/:id
func UpdateTodo(c *gin.Context) {
	id := c.Param("id")
	var todo models.Todo

	// Cek apakah data dengan ID tersebut ada di database
	if err := config.DB.First(&todo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "To-do dengan ID " + id + " tidak ditemukan",
		})
		return
	}

	var input models.UpdateTodoInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Format data JSON tidak valid: " + err.Error(),
		})
		return
	}

	// Kumpulkan field yang dikirim untuk diupdate
	updates := make(map[string]interface{})

	if input.Title != nil {
		trimmedTitle := strings.TrimSpace(*input.Title)
		if trimmedTitle != "" {
			updates["title"] = trimmedTitle
		}
	}

	if input.Priority != nil {
		p := strings.ToLower(strings.TrimSpace(*input.Priority))
		if p == "low" || p == "medium" || p == "high" {
			updates["priority"] = p
		}
	}

	if input.DueDate != nil {
		updates["due_date"] = strings.TrimSpace(*input.DueDate)
	}

	if input.IsCompleted != nil {
		updates["is_completed"] = *input.IsCompleted
	}

	if input.Reminder != nil {
		updates["reminder"] = strings.ToLower(strings.TrimSpace(*input.Reminder))
	}

	// Eksekusi update jika ada field yang dikirim
	if len(updates) > 0 {
		if err := config.DB.Model(&todo).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Gagal mengupdate to-do: " + err.Error(),
			})
			return
		}
	}

	// Ambil kembali data terbaru setelah diupdate
	config.DB.First(&todo, id)

	c.JSON(http.StatusOK, gin.H{
		"data": todo,
	})
}

// DeleteTodo menghapus tugas berdasarkan ID
// DELETE /api/todos/:id
func DeleteTodo(c *gin.Context) {
	id := c.Param("id")
	var todo models.Todo

	// Cek apakah to-do ada sebelum dihapus
	if err := config.DB.First(&todo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "To-do dengan ID " + id + " tidak ditemukan",
		})
		return
	}

	if err := config.DB.Delete(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal menghapus to-do: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "To-do berhasil dihapus",
	})
}

// ClearCompletedTodos menghapus semua tugas yang telah berstatus selesai (is_completed = true)
// DELETE /api/todos/completed
func ClearCompletedTodos(c *gin.Context) {
	result := config.DB.Where("is_completed = ?", true).Delete(&models.Todo{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal membersihkan tugas selesai: " + result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Semua tugas yang telah selesai berhasil dibersihkan",
		"deleted": result.RowsAffected,
	})
}
