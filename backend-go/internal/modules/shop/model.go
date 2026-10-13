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
	PriceUnit   string    `json:"price_unit"`
	ImageURL    string    `json:"image_url"`
	Stock       int       `json:"stock"`
	Description string    `json:"description,omitempty"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`

	// Aliases for compatibility
	Price string `json:"price,omitempty"`
	Image string `json:"image,omitempty"`
}

func (p *Product) UnmarshalJSON(data []byte) error {
	type Alias Product
	aux := &struct {
		PriceAlt     string `json:"price"`
		ImageAlt     string `json:"image"`
		PriceUnitAlt string `json:"price_unit"`
		ImageURLAlt  string `json:"image_url"`
		*Alias
	}{
		Alias: (*Alias)(p),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}
	if p.PriceUnit == "" {
		if aux.PriceUnitAlt != "" {
			p.PriceUnit = aux.PriceUnitAlt
		} else if aux.PriceAlt != "" {
			p.PriceUnit = aux.PriceAlt
		}
	}
	if p.ImageURL == "" {
		if aux.ImageURLAlt != "" {
			p.ImageURL = aux.ImageURLAlt
		} else if aux.ImageAlt != "" {
			p.ImageURL = aux.ImageAlt
		}
	}
	p.Price = p.PriceUnit
	p.Image = p.ImageURL
	return nil
}

func (p Product) MarshalJSON() ([]byte, error) {
	type Alias Product
	price := p.PriceUnit
	if price == "" {
		price = p.Price
	}
	image := p.ImageURL
	if image == "" {
		image = p.Image
	}
	return json.Marshal(&struct {
		Alias
		PriceUnit string `json:"price_unit"`
		ImageURL  string `json:"image_url"`
		Price     string `json:"price"`
		Image     string `json:"image"`
	}{
		Alias:     (Alias)(p),
		PriceUnit: price,
		ImageURL:  image,
		Price:     price,
		Image:     image,
	})
}
