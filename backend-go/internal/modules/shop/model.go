package shop

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type AdStatus string

const (
	AdStatusPending  AdStatus = "pending"
	AdStatusApproved AdStatus = "approved"
	AdStatusRejected AdStatus = "rejected"
)

type Ad struct {
	ID              string          `json:"id"`
	ShopOwnerID     string          `json:"shop_owner_id"`
	ShopName        string          `json:"shop_name"`
	ContactPhone    string          `json:"contact_phone"`
	Title           string          `json:"title"`
	Category        string          `json:"category"`
	Description     string          `json:"description"`
	PriceUnit       string          `json:"price_unit"`
	ImageURL        string          `json:"image_url"`
	DiseaseTags     json.RawMessage `json:"disease_tags"`
	Status          AdStatus        `json:"status"`
	RejectionReason string          `json:"rejection_reason,omitempty"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}

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
