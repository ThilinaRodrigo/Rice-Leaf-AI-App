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
	if r.db == nil {
		return getFallbackProducts(category, search), nil
	}

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
	if r.db == nil {
		products := getFallbackProducts("", "")
		if len(products) > 0 {
			return &products[0], nil
		}
		return nil, fmt.Errorf("product not found")
	}

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

func getFallbackProducts(category, search string) []domain.Product {
	all := []domain.Product{
		{
			ID:          uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			Name:        "High-Quality Rice Seeds",
			Category:    "Seeds",
			PriceCents:  45000,
			PriceUnit:   "Rs.450 / kg",
			ImageURL:    "https://images.unsplash.com/photo-1607703700242-7a37b2fbb5bc?auto=format&fit=crop&w=500&q=60",
			Stock:       100,
			Description: "Certified high yield Bg 352 and At 362 rice seeds for Yala and Maha seasons.",
			IsActive:    true,
		},
		{
			ID:          uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			Name:        "Organic Fertilizer",
			Category:    "Fertilizers",
			PriceCents:  12000,
			PriceUnit:   "Rs.120 / kg",
			ImageURL:    "https://images.unsplash.com/photo-1587316745629-1a81c7b54e9b?auto=format&fit=crop&w=500&q=60",
			Stock:       250,
			Description: "100% natural compost and bio-fertilizer rich in nitrogen and organic carbon.",
			IsActive:    true,
		},
		{
			ID:          uuid.MustParse("33333333-3333-3333-3333-333333333333"),
			Name:        "Sprayer Tool",
			Category:    "Sprayers",
			PriceCents:  220000,
			PriceUnit:   "Rs.2,200",
			ImageURL:    "https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=500&q=60",
			Stock:       50,
			Description: "16L knapsack manual pressure sprayer ideal for pesticide and foliar application.",
			IsActive:    true,
		},
		{
			ID:          uuid.MustParse("44444444-4444-4444-4444-444444444444"),
			Name:        "Watering Can",
			Category:    "Tools",
			PriceCents:  75000,
			PriceUnit:   "Rs.750",
			ImageURL:    "https://images.unsplash.com/photo-1606312611231-1d6e0f51e3f1?auto=format&fit=crop&w=500&q=60",
			Stock:       75,
			Description: "Heavy-duty 10L ergonomic garden watering can for paddy nursery care.",
			IsActive:    true,
		},
	}

	var filtered []domain.Product
	for _, p := range all {
		if category != "" && category != "All" && p.Category != category {
			continue
		}
		filtered = append(filtered, p)
	}
	return filtered
}
