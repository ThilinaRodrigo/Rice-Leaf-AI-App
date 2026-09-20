package domain

import (
	"encoding/json"
	"time"
)

type Factor struct {
	Icon  string `json:"icon"`
	Label string `json:"label"`
	Value string `json:"value"`
	Color string `json:"color"`
}

type ActionItem struct {
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
}

type Disease struct {
	ClassID     int             `json:"class_id"`
	Key         string          `json:"key"`
	Name        string          `json:"name"`
	Category    string          `json:"category"`
	Description string          `json:"description"`
	Factors     json.RawMessage `json:"factors"`
	Actions     json.RawMessage `json:"actions"`
	CreatedAt   time.Time       `json:"created_at"`
}
