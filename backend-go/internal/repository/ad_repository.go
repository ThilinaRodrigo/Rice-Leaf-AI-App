package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"backend-go/internal/domain"

	"github.com/google/uuid"
)

type AdRepository interface {
	CreateAd(ctx context.Context, ad *domain.Ad) error
	GetByID(ctx context.Context, id string) (*domain.Ad, error)
	GetByShopOwner(ctx context.Context, shopOwnerID string) ([]domain.Ad, error)
	GetApprovedAds(ctx context.Context, diseaseTag string) ([]domain.Ad, error)
	GetAllAdsForAdmin(ctx context.Context, status string) ([]domain.Ad, error)
	UpdateAd(ctx context.Context, ad *domain.Ad) error
	UpdateAdStatus(ctx context.Context, id string, status domain.AdStatus, reason string) error
	DeleteAd(ctx context.Context, id string, shopOwnerID string) error
}

type adRepository struct {
	db     *sql.DB
	memAds []domain.Ad
	mu     sync.RWMutex
}

func NewAdRepository(db *sql.DB) AdRepository {
	return &adRepository{
		db:     db,
		memAds: getFallbackAds(),
	}
}

func (r *adRepository) CreateAd(ctx context.Context, ad *domain.Ad) error {
	if ad.ID == "" {
		ad.ID = uuid.New().String()
	}
	if ad.Status == "" {
		ad.Status = domain.AdStatusPending
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
	r.memAds = append([]domain.Ad{*ad}, r.memAds...)
	return nil
}

func (r *adRepository) GetByID(ctx context.Context, id string) (*domain.Ad, error) {
	if r.db != nil {
		query := `
			SELECT id, shop_owner_id, shop_name, contact_phone, title, COALESCE(category, 'Fungicides & Remedies'), description, price_unit, image_url, disease_tags, status, COALESCE(rejection_reason, ''), created_at, updated_at
			FROM shop_ads WHERE id = $1
		`
		ad := &domain.Ad{}
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

func (r *adRepository) GetByShopOwner(ctx context.Context, shopOwnerID string) ([]domain.Ad, error) {
	if r.db != nil {
		query := `
			SELECT id, shop_owner_id, shop_name, contact_phone, title, COALESCE(category, 'Fungicides & Remedies'), description, price_unit, image_url, disease_tags, status, COALESCE(rejection_reason, ''), created_at, updated_at
			FROM shop_ads WHERE shop_owner_id = $1 ORDER BY created_at DESC
		`
		rows, err := r.db.QueryContext(ctx, query, shopOwnerID)
		if err == nil {
			defer rows.Close()
			var ads []domain.Ad
			for rows.Next() {
				var a domain.Ad
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
	var result []domain.Ad
	for _, a := range r.memAds {
		if a.ShopOwnerID == shopOwnerID {
			result = append(result, a)
		}
	}
	return result, nil
}

func (r *adRepository) GetApprovedAds(ctx context.Context, diseaseTag string) ([]domain.Ad, error) {
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
			var ads []domain.Ad
			for rows.Next() {
				var a domain.Ad
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
	var result []domain.Ad
	for _, a := range r.memAds {
		if a.Status != domain.AdStatusApproved {
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

func (r *adRepository) GetAllAdsForAdmin(ctx context.Context, status string) ([]domain.Ad, error) {
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
			var ads []domain.Ad
			for rows.Next() {
				var a domain.Ad
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
	var result []domain.Ad
	for _, a := range r.memAds {
		if status != "" && status != "all" && string(a.Status) != status {
			continue
		}
		result = append(result, a)
	}
	return result, nil
}

func (r *adRepository) UpdateAd(ctx context.Context, ad *domain.Ad) error {
	ad.UpdatedAt = time.Now()
	ad.Status = domain.AdStatusPending
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
			r.memAds[i].Status = domain.AdStatusPending
			r.memAds[i].RejectionReason = ""
			r.memAds[i].UpdatedAt = ad.UpdatedAt
			return nil
		}
	}
	return nil
}

func (r *adRepository) UpdateAdStatus(ctx context.Context, id string, status domain.AdStatus, reason string) error {
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
	var updated []domain.Ad
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

func getFallbackAds() []domain.Ad {
	now := time.Now()
	return []domain.Ad{
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
			Status:       domain.AdStatusApproved,
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
			Status:       domain.AdStatusApproved,
			CreatedAt:    now.Add(-24 * time.Hour),
			UpdatedAt:    now.Add(-24 * time.Hour),
		},
		{
			ID:           "ad-103",
			ShopOwnerID:  "so-001",
			ShopName:     "Polonnaruwa Agrarian Center",
			ContactPhone: "+94 77 123 4567",
			Title:        "Knapsack Battery Sprayer 16L",
			Category:     "Sprayers",
			Description:  "Rechargeable battery sprayer with 4 adjustable nozzles for quick foliar application.",
			PriceUnit:    "Rs.14,500",
			ImageURL:     "https://images.unsplash.com/photo-1606312611231-1d6e0f51e3f1?auto=format&fit=crop&w=500&q=60",
			DiseaseTags:  json.RawMessage(`["bacterial_leaf_blight", "brown_spot", "leaf_scald", "narrow_brown_spot"]`),
			Status:       domain.AdStatusPending,
			CreatedAt:    now.Add(-2 * time.Hour),
			UpdatedAt:    now.Add(-2 * time.Hour),
		},
	}
}
