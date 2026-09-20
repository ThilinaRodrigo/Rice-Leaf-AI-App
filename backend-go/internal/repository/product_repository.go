package repository

import (
	"context"
	"database/sql"
	"fmt"

	"backend-go/internal/domain"

	"github.com/google/uuid"
)

type ProductRepository interface {
	GetProducts(ctx context.Context, category, search string) ([]domain.Product, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Product, error)
}

type productRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) GetProducts(ctx context.Context, category, search string) ([]domain.Product, error) {
	query := `
		SELECT id, name, category, price_cents, price_unit, image_url, stock, COALESCE(description, ''), is_active, created_at
		FROM products
		WHERE is_active = true
	`
	var args []interface{}
	argIdx := 1

	if category != "" && category != "All" {
		query += fmt.Sprintf(" AND category = $%d", argIdx)
		args = append(args, category)
		argIdx++
	}

	if search != "" {
		query += fmt.Sprintf(" AND LOWER(name) LIKE $%d", argIdx)
		args = append(args, "%"+search+"%")
		argIdx++
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying products: %w", err)
	}
	defer rows.Close()

	var products []domain.Product
	for rows.Next() {
		var p domain.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.PriceCents, &p.PriceUnit, &p.ImageURL, &p.Stock, &p.Description, &p.IsActive, &p.CreatedAt); err != nil {
			return nil, err
		}
		products = append(products, p)
	}

	return products, nil
}

func (r *productRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Product, error) {
	query := `
		SELECT id, name, category, price_cents, price_unit, image_url, stock, COALESCE(description, ''), is_active, created_at
		FROM products
		WHERE id = $1
	`
	p := &domain.Product{}
	err := r.db.QueryRowContext(ctx, query, id).
		Scan(&p.ID, &p.Name, &p.Category, &p.PriceCents, &p.PriceUnit, &p.ImageURL, &p.Stock, &p.Description, &p.IsActive, &p.CreatedAt)
	if err != nil {
		return nil, err
	}
	return p, nil
}
