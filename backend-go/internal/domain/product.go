package domain

import (
	"time"

	"github.com/google/uuid"
)

type Product struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Category    string    `json:"category"`
	PriceCents  int       `json:"price_cents"`
	PriceUnit   string    `json:"price"`
	ImageURL    string    `json:"image"`
	Stock       int       `json:"stock"`
	Description string    `json:"description,omitempty"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
}
