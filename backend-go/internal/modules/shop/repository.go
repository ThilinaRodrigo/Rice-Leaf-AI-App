package shop

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

type AdRepository interface {
	CreateAd(ctx context.Context, ad *Ad) error
	GetByID(ctx context.Context, id string) (*Ad, error)
	GetByShopOwner(ctx context.Context, shopOwnerID string) ([]Ad, error)
	GetApprovedAds(ctx context.Context, diseaseTag string) ([]Ad, error)
	GetAllAdsForAdmin(ctx context.Context, status string) ([]Ad, error)
	UpdateAd(ctx context.Context, ad *Ad) error
	UpdateAdStatus(ctx context.Context, id string, status AdStatus, reason string) error
	DeleteAd(ctx context.Context, id string, shopOwnerID string) error
}

type ProductRepository interface {
	GetProducts(ctx context.Context, category, search string) ([]Product, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Product, error)
	CreateProduct(ctx context.Context, p *Product) error
	UpdateProduct(ctx context.Context, p *Product) error
	DeleteProduct(ctx context.Context, id uuid.UUID) error
}

type adRepository struct {
	db     *sql.DB
	memAds []Ad
	mu     sync.RWMutex
}

func NewAdRepository(db *sql.DB) AdRepository {
	return &adRepository{
		db:     db,
		memAds: getFallbackAds(),
	}
}

func (r *adRepository) CreateAd(ctx context.Context, ad *Ad) error {
	if ad.ID == "" {
		ad.ID = uuid.New().String()
	}
	if ad.Status == "" {
		ad.Status = AdStatusPending
	}
	if ad.Category == "" {
		ad.Category = "Fungicides & Remedies"
	}
	if len(ad.DiseaseTags) == 0 {
		ad.DiseaseTags = []byte("[]")
	}
	ad.CreatedAt = time.Now()
	ad.UpdatedAt = time.Now()

	if r.db != nil {
		query := `
			INSERT INTO shop_ads (id, shop_owner_id, shop_name, contact_phone, title, category, description, price_unit, image_url, disease_tags, status, rejection_reason, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		`
		_, err := r.db.ExecContext(ctx, query,
			ad.ID, ad.ShopOwnerID, ad.ShopName, ad.ContactPhone, ad.Title, ad.Category, ad.Description,
			ad.PriceUnit, ad.ImageURL, ad.DiseaseTags, ad.Status, ad.RejectionReason, ad.CreatedAt, ad.UpdatedAt,
		)
		if err != nil {
			return fmt.Errorf("failed inserting shop ad: %w", err)
		}
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	r.memAds = append([]Ad{*ad}, r.memAds...)
	return nil
}

func (r *adRepository) GetByID(ctx context.Context, id string) (*Ad, error) {
	if r.db != nil {
		query := `
			SELECT id, shop_owner_id, shop_name, contact_phone, title, COALESCE(category, 'Fungicides & Remedies'), description, price_unit, image_url, disease_tags, status, COALESCE(rejection_reason, ''), created_at, updated_at
			FROM shop_ads WHERE id = $1
		`
		ad := &Ad{}
		err := r.db.QueryRowContext(ctx, query, id).Scan(
			&ad.ID, &ad.ShopOwnerID, &ad.ShopName, &ad.ContactPhone, &ad.Title, &ad.Category, &ad.Description,
			&ad.PriceUnit, &ad.ImageURL, &ad.DiseaseTags, &ad.Status, &ad.RejectionReason, &ad.CreatedAt, &ad.UpdatedAt,
		)
		if err == nil {
			return ad, nil
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, a := range r.memAds {
		if a.ID == id {
			return &a, nil
		}
	}
	return nil, errors.New("ad not found")
}

func (r *adRepository) GetByShopOwner(ctx context.Context, shopOwnerID string) ([]Ad, error) {
	if r.db != nil {
		query := `
			SELECT id, shop_owner_id, shop_name, contact_phone, title, COALESCE(category, 'Fungicides & Remedies'), description, price_unit, image_url, disease_tags, status, COALESCE(rejection_reason, ''), created_at, updated_at
			FROM shop_ads WHERE shop_owner_id = $1 ORDER BY created_at DESC
		`
		rows, err := r.db.QueryContext(ctx, query, shopOwnerID)
		if err == nil {
			defer rows.Close()
			var ads []Ad
			for rows.Next() {
				var a Ad
				if err := rows.Scan(
					&a.ID, &a.ShopOwnerID, &a.ShopName, &a.ContactPhone, &a.Title, &a.Category, &a.Description,
					&a.PriceUnit, &a.ImageURL, &a.DiseaseTags, &a.Status, &a.RejectionReason, &a.CreatedAt, &a.UpdatedAt,
				); err == nil {
					ads = append(ads, a)
				}
			}
			return ads, nil
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var result []Ad
	for _, a := range r.memAds {
		if a.ShopOwnerID == shopOwnerID {
			result = append(result, a)
		}
	}
	return result, nil
}

func (r *adRepository) GetApprovedAds(ctx context.Context, diseaseTag string) ([]Ad, error) {
	if r.db != nil {
		query := `
			SELECT id, shop_owner_id, shop_name, contact_phone, title, COALESCE(category, 'Fungicides & Remedies'), description, price_unit, image_url, disease_tags, status, COALESCE(rejection_reason, ''), created_at, updated_at
			FROM shop_ads WHERE status = 'approved'
		`
		args := []interface{}{}
		if diseaseTag != "" {
			query += ` AND disease_tags::text LIKE $1`
			args = append(args, "%"+diseaseTag+"%")
		}
		query += ` ORDER BY created_at DESC`

		rows, err := r.db.QueryContext(ctx, query, args...)
		if err == nil {
			defer rows.Close()
			var ads []Ad
			for rows.Next() {
				var a Ad
				if err := rows.Scan(
					&a.ID, &a.ShopOwnerID, &a.ShopName, &a.ContactPhone, &a.Title, &a.Category, &a.Description,
					&a.PriceUnit, &a.ImageURL, &a.DiseaseTags, &a.Status, &a.RejectionReason, &a.CreatedAt, &a.UpdatedAt,
				); err == nil {
					ads = append(ads, a)
				}
			}
			return ads, nil
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var result []Ad
	for _, a := range r.memAds {
		if a.Status != AdStatusApproved {
			continue
		}
		if diseaseTag != "" {
			tagsStr := string(a.DiseaseTags)
			if !strings.Contains(tagsStr, diseaseTag) {
				continue
			}
		}
		result = append(result, a)
	}
	return result, nil
}

func (r *adRepository) GetAllAdsForAdmin(ctx context.Context, status string) ([]Ad, error) {
	if r.db != nil {
		query := `
			SELECT id, shop_owner_id, shop_name, contact_phone, title, COALESCE(category, 'Fungicides & Remedies'), description, price_unit, image_url, disease_tags, status, COALESCE(rejection_reason, ''), created_at, updated_at
			FROM shop_ads
		`
		args := []interface{}{}
		if status != "" && status != "all" {
			query += ` WHERE status = $1`
			args = append(args, status)
		}
		query += ` ORDER BY created_at DESC`

		rows, err := r.db.QueryContext(ctx, query, args...)
		if err == nil {
			defer rows.Close()
			var ads []Ad
			for rows.Next() {
				var a Ad
				if err := rows.Scan(
					&a.ID, &a.ShopOwnerID, &a.ShopName, &a.ContactPhone, &a.Title, &a.Category, &a.Description,
					&a.PriceUnit, &a.ImageURL, &a.DiseaseTags, &a.Status, &a.RejectionReason, &a.CreatedAt, &a.UpdatedAt,
				); err == nil {
					ads = append(ads, a)
				}
			}
			return ads, nil
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var result []Ad
	for _, a := range r.memAds {
		if status != "" && status != "all" && string(a.Status) != status {
			continue
		}
		result = append(result, a)
	}
	return result, nil
}

func (r *adRepository) UpdateAd(ctx context.Context, ad *Ad) error {
	ad.UpdatedAt = time.Now()
	ad.Status = AdStatusPending
	ad.RejectionReason = ""
	if ad.Category == "" {
		ad.Category = "Fungicides & Remedies"
	}

	if r.db != nil {
		query := `
			UPDATE shop_ads 
			SET title = $1, category = $2, description = $3, price_unit = $4, contact_phone = $5, image_url = $6, disease_tags = $7, status = $8, rejection_reason = $9, updated_at = $10
			WHERE id = $11 AND shop_owner_id = $12
		`
		_, err := r.db.ExecContext(ctx, query,
			ad.Title, ad.Category, ad.Description, ad.PriceUnit, ad.ContactPhone, ad.ImageURL, ad.DiseaseTags,
			ad.Status, ad.RejectionReason, ad.UpdatedAt, ad.ID, ad.ShopOwnerID,
		)
		if err != nil {
			return fmt.Errorf("failed updating shop ad: %w", err)
		}
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	for i, a := range r.memAds {
		if a.ID == ad.ID && a.ShopOwnerID == ad.ShopOwnerID {
			r.memAds[i].Title = ad.Title
			r.memAds[i].Category = ad.Category
			r.memAds[i].Description = ad.Description
			r.memAds[i].PriceUnit = ad.PriceUnit
			r.memAds[i].ContactPhone = ad.ContactPhone
			r.memAds[i].ImageURL = ad.ImageURL
			r.memAds[i].DiseaseTags = ad.DiseaseTags
			r.memAds[i].Status = AdStatusPending
			r.memAds[i].RejectionReason = ""
			r.memAds[i].UpdatedAt = ad.UpdatedAt
			return nil
		}
	}
	return nil
}

func (r *adRepository) UpdateAdStatus(ctx context.Context, id string, status AdStatus, reason string) error {
	now := time.Now()
	if r.db != nil {
		query := `UPDATE shop_ads SET status = $1, rejection_reason = $2, updated_at = $3 WHERE id = $4`
		_, err := r.db.ExecContext(ctx, query, status, reason, now, id)
		if err != nil {
			return fmt.Errorf("failed updating ad status: %w", err)
		}
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	for i, a := range r.memAds {
		if a.ID == id {
			r.memAds[i].Status = status
			r.memAds[i].RejectionReason = reason
			r.memAds[i].UpdatedAt = now
			return nil
		}
	}
	return nil
}

func (r *adRepository) DeleteAd(ctx context.Context, id string, shopOwnerID string) error {
	if r.db != nil {
		query := `DELETE FROM shop_ads WHERE id = $1`
		args := []interface{}{id}
		if shopOwnerID != "" {
			query += ` AND shop_owner_id = $2`
			args = append(args, shopOwnerID)
		}
		_, err := r.db.ExecContext(ctx, query, args...)
		if err != nil {
			return fmt.Errorf("failed deleting ad: %w", err)
		}
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	var updated []Ad
	for _, a := range r.memAds {
		if a.ID == id {
			if shopOwnerID != "" && a.ShopOwnerID != shopOwnerID {
				updated = append(updated, a)
			}
			continue
		}
		updated = append(updated, a)
	}
	r.memAds = updated
	return nil
}

type productRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) CreateProduct(ctx context.Context, p *Product) error {
	if r.db == nil {
		p.ID = uuid.New()
		return nil
	}
	query := `
		INSERT INTO products (name, category, price_cents, price_unit, image_url, stock, description, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query, p.Name, p.Category, p.PriceCents, p.PriceUnit, p.ImageURL, p.Stock, p.Description, p.IsActive).
		Scan(&p.ID, &p.CreatedAt)
}

func (r *productRepository) UpdateProduct(ctx context.Context, p *Product) error {
	if r.db == nil {
		return nil
	}
	query := `
		UPDATE products
		SET name = $1, category = $2, price_cents = $3, price_unit = $4, image_url = $5, stock = $6, description = $7, is_active = $8
		WHERE id = $9
	`
	_, err := r.db.ExecContext(ctx, query, p.Name, p.Category, p.PriceCents, p.PriceUnit, p.ImageURL, p.Stock, p.Description, p.IsActive, p.ID)
	return err
}

func (r *productRepository) DeleteProduct(ctx context.Context, id uuid.UUID) error {
	if r.db == nil {
		return nil
	}
	_, err := r.db.ExecContext(ctx, "DELETE FROM products WHERE id = $1", id)
	return err
}

func (r *productRepository) GetProducts(ctx context.Context, category, search string) ([]Product, error) {
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

	var products []Product
	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.PriceCents, &p.PriceUnit, &p.ImageURL, &p.Stock, &p.Description, &p.IsActive, &p.CreatedAt); err != nil {
			return nil, err
		}
		products = append(products, p)
	}

	return products, nil
}

func (r *productRepository) GetByID(ctx context.Context, id uuid.UUID) (*Product, error) {
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
	p := &Product{}
	err := r.db.QueryRowContext(ctx, query, id).
		Scan(&p.ID, &p.Name, &p.Category, &p.PriceCents, &p.PriceUnit, &p.ImageURL, &p.Stock, &p.Description, &p.IsActive, &p.CreatedAt)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func getFallbackAds() []Ad {
	now := time.Now()
	return []Ad{
		{
			ID:           "ad-101",
			ShopOwnerID:  "so-001",
			ShopName:     "Polonnaruwa Agrarian Center",
			ContactPhone: "+94 77 123 4567",
			Title:        "Bactericide Copper Hydroxide (BLB Control)",
			Category:     "Fungicides & Remedies",
			Description:  "Effective bactericide recommended for early Bacterial Leaf Blight control in Rice fields.",
			PriceUnit:    "Rs.1,450 / 500g",
			ImageURL:     "https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=500&q=60",
			DiseaseTags:  json.RawMessage(`["bacterial_leaf_blight"]`),
			Status:       AdStatusApproved,
			CreatedAt:    now.Add(-48 * time.Hour),
			UpdatedAt:    now.Add(-48 * time.Hour),
		},
		{
			ID:           "ad-102",
			ShopOwnerID:  "so-002",
			ShopName:     "Kurunegala Paddy Supplies",
			ContactPhone: "+94 71 987 6543",
			Title:        "Potash & Organic Bio-Fertilizer",
			Category:     "Fertilizers",
			Description:  "High quality Potash mix to treat Brown Spot and nutrient deficiency in paddy soil.",
			PriceUnit:    "Rs.2,100 / 5kg",
			ImageURL:     "https://images.unsplash.com/photo-1587316745629-1a81c7b54e9b?auto=format&fit=crop&w=500&q=60",
			DiseaseTags:  json.RawMessage(`["brown_spot", "healthy"]`),
			Status:       AdStatusApproved,
			CreatedAt:    now.Add(-24 * time.Hour),
			UpdatedAt:    now.Add(-24 * time.Hour),
		},
	}
}

func getFallbackProducts(category, search string) []Product {
	all := []Product{
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
	}

	var filtered []Product
	for _, p := range all {
		if category != "" && category != "All" && p.Category != category {
			continue
		}
		filtered = append(filtered, p)
	}
	return filtered
}
