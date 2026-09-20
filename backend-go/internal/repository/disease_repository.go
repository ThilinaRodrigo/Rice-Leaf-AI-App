package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"backend-go/internal/domain"
)

type DiseaseRepository interface {
	GetAll(ctx context.Context) ([]domain.Disease, error)
	GetByClassID(ctx context.Context, classID int) (*domain.Disease, error)
}

type diseaseRepository struct {
	db *sql.DB
}

func NewDiseaseRepository(db *sql.DB) DiseaseRepository {
	return &diseaseRepository{db: db}
}

func (r *diseaseRepository) GetAll(ctx context.Context) ([]domain.Disease, error) {
	query := `
		SELECT class_id, key, name, category, description, factors, actions, created_at
		FROM diseases
		ORDER BY class_id ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error querying diseases: %w", err)
	}
	defer rows.Close()

	var diseases []domain.Disease
	for rows.Next() {
		var d domain.Disease
		if err := rows.Scan(&d.ClassID, &d.Key, &d.Name, &d.Category, &d.Description, &d.Factors, &d.Actions, &d.CreatedAt); err != nil {
			return nil, err
		}
		diseases = append(diseases, d)
	}

	return diseases, nil
}

func (r *diseaseRepository) GetByClassID(ctx context.Context, classID int) (*domain.Disease, error) {
	query := `
		SELECT class_id, key, name, category, description, factors, actions, created_at
		FROM diseases
		WHERE class_id = $1
	`
	d := &domain.Disease{}
	err := r.db.QueryRowContext(ctx, query, classID).
		Scan(&d.ClassID, &d.Key, &d.Name, &d.Category, &d.Description, &d.Factors, &d.Actions, &d.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("disease not found")
		}
		return nil, err
	}
	return d, nil
}
