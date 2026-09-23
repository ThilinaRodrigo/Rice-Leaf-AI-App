package repository

import (
	"context"
	"database/sql"
	"fmt"

	"backend-go/internal/domain"

	"github.com/google/uuid"
)

type ScanRepository interface {
	SaveScan(ctx context.Context, scan *domain.Scan) error
	GetHistoryByUserID(ctx context.Context, userID uuid.UUID) ([]domain.Scan, error)
	GetScanByID(ctx context.Context, scanID uuid.UUID) (*domain.Scan, error)
}

type scanRepository struct {
	db *sql.DB
}

func NewScanRepository(db *sql.DB) ScanRepository {
	return &scanRepository{db: db}
}

func (r *scanRepository) SaveScan(ctx context.Context, s *domain.Scan) error {
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

func (r *scanRepository) GetHistoryByUserID(ctx context.Context, userID uuid.UUID) ([]domain.Scan, error) {
	if r.db == nil {
		return []domain.Scan{}, nil
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

	var scans []domain.Scan
	for rows.Next() {
		var s domain.Scan
		if err := rows.Scan(&s.ID, &s.UserID, &s.ImageURL, &s.ClassID, &s.Label, &s.Confidence, &s.Notes, &s.CreatedAt); err != nil {
			return nil, err
		}
		scans = append(scans, s)
	}

	return scans, nil
}

func (r *scanRepository) GetScanByID(ctx context.Context, scanID uuid.UUID) (*domain.Scan, error) {
	if r.db == nil {
		return nil, fmt.Errorf("scan not found")
	}
	query := `
		SELECT id, user_id, image_url, class_id, label, confidence, COALESCE(notes, ''), created_at
		FROM scans
		WHERE id = $1
	`
	s := &domain.Scan{}
	err := r.db.QueryRowContext(ctx, query, scanID).
		Scan(&s.ID, &s.UserID, &s.ImageURL, &s.ClassID, &s.Label, &s.Confidence, &s.Notes, &s.CreatedAt)
	if err != nil {
		return nil, err
	}
	return s, nil
}
