package domain

import (
	"time"

	"github.com/google/uuid"
)

type Scan struct {
	ID         uuid.UUID  `json:"id"`
	UserID     *uuid.UUID `json:"user_id,omitempty"`
	ImageURL   string     `json:"image_url"`
	ClassID    int        `json:"class_id"`
	Label      string     `json:"label"`
	Confidence float64    `json:"confidence"`
	Notes      string     `json:"notes,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
}

type ScanResultResponse struct {
	Scan    Scan     `json:"scan"`
	Disease *Disease `json:"disease,omitempty"`
}
