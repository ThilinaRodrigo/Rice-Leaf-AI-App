package scan

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
)

type Repository interface {
	SaveScan(ctx context.Context, scan *Scan) error
	GetHistoryByUserID(ctx context.Context, userID uuid.UUID) ([]Scan, error)
	GetScanByID(ctx context.Context, scanID uuid.UUID) (*Scan, error)
	GetAllScans(ctx context.Context) ([]Scan, error)
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) SaveScan(ctx context.Context, s *Scan) error {
	if r.db == nil {
		s.ID = uuid.New()
		return nil
	}
	query := `
		INSERT INTO scans (user_id, image_url, class_id, label, confidence, notes)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`
	err := r.db.QueryRowContext(ctx, query, s.UserID, s.ImageURL, s.ClassID, s.Label, s.Confidence, s.Notes).
		Scan(&s.ID, &s.CreatedAt)
	if err != nil {
		return fmt.Errorf("error saving scan record: %w", err)
	}
	return nil
}

func (r *repository) GetHistoryByUserID(ctx context.Context, userID uuid.UUID) ([]Scan, error) {
	if r.db == nil {
		return []Scan{}, nil
	}
	query := `
		SELECT id, user_id, image_url, class_id, label, confidence, COALESCE(notes, ''), created_at
		FROM scans
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("error querying user scan history: %w", err)
	}
	defer rows.Close()

	var scans []Scan
	for rows.Next() {
		var s Scan
		if err := rows.Scan(&s.ID, &s.UserID, &s.ImageURL, &s.ClassID, &s.Label, &s.Confidence, &s.Notes, &s.CreatedAt); err != nil {
			return nil, err
		}
		scans = append(scans, s)
	}

	return scans, nil
}

func (r *repository) GetScanByID(ctx context.Context, scanID uuid.UUID) (*Scan, error) {
	if r.db == nil {
		return nil, fmt.Errorf("scan not found")
	}
	query := `
		SELECT id, user_id, image_url, class_id, label, confidence, COALESCE(notes, ''), created_at
		FROM scans
		WHERE id = $1
	`
	s := &Scan{}
	err := r.db.QueryRowContext(ctx, query, scanID).
		Scan(&s.ID, &s.UserID, &s.ImageURL, &s.ClassID, &s.Label, &s.Confidence, &s.Notes, &s.CreatedAt)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (r *repository) GetAllScans(ctx context.Context) ([]Scan, error) {
	if r.db == nil {
		return []Scan{}, nil
	}
	query := `
		SELECT id, user_id, image_url, class_id, label, confidence, COALESCE(notes, ''), created_at
		FROM scans ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var scans []Scan
	for rows.Next() {
		var s Scan
		if err := rows.Scan(&s.ID, &s.UserID, &s.ImageURL, &s.ClassID, &s.Label, &s.Confidence, &s.Notes, &s.CreatedAt); err == nil {
			scans = append(scans, s)
		}
	}
	return scans, nil
}
