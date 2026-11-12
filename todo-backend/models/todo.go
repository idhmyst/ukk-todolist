package models

import "time"

// Todo merepresentasikan model tabel todos di database MySQL
type Todo struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title" binding:"required"`
	Priority    string    `gorm:"type:varchar(10);default:'medium'" json:"priority"`
	IsCompleted bool      `gorm:"default:false" json:"is_completed"`
	DueDate     string    `gorm:"type:varchar(50)" json:"due_date"`
	Reminder    string    `gorm:"type:varchar(20);default:'30m'" json:"reminder"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CreateTodoInput struct validasi payload request POST /api/todos
type CreateTodoInput struct {
	Title    string `json:"title" binding:"required"`
	Priority string `json:"priority"`
	DueDate  string `json:"due_date"`
	Reminder string `json:"reminder"`
}

// UpdateTodoInput struct validasi payload request PUT /api/todos/:id
// Menggunakan pointer agar nilai falsy (seperti false atau string kosong) tetap terdeteksi
type UpdateTodoInput struct {
	Title       *string `json:"title"`
	Priority    *string `json:"priority"`
	IsCompleted *bool   `json:"is_completed"`
	DueDate     *string `json:"due_date"`
	Reminder    *string `json:"reminder"`
}
