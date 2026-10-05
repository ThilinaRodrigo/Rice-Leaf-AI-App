package shop

import (
	"context"

	"github.com/google/uuid"
)

type AdService interface {
	CreateAd(ctx context.Context, ad *Ad) error
	GetByID(ctx context.Context, id string) (*Ad, error)
	GetByShopOwner(ctx context.Context, shopOwnerID string) ([]Ad, error)
	GetApprovedAds(ctx context.Context, diseaseTag, category, search string, page, limit int) ([]Ad, int, error)
	GetAllAdsForAdmin(ctx context.Context, status string) ([]Ad, error)
	UpdateAd(ctx context.Context, ad *Ad) error
	UpdateAdStatus(ctx context.Context, id string, status AdStatus, reason string) error
	DeleteAd(ctx context.Context, id string, shopOwnerID string) error
}

type ProductService interface {
	GetProducts(ctx context.Context, category, search string) ([]Product, error)
	GetProductByID(ctx context.Context, id uuid.UUID) (*Product, error)
}

type adService struct {
	adRepo AdRepository
}

func NewAdService(adRepo AdRepository) AdService {
	return &adService{adRepo: adRepo}
}

func (s *adService) CreateAd(ctx context.Context, ad *Ad) error {
	return s.adRepo.CreateAd(ctx, ad)
}

func (s *adService) GetByID(ctx context.Context, id string) (*Ad, error) {
	return s.adRepo.GetByID(ctx, id)
}

func (s *adService) GetByShopOwner(ctx context.Context, shopOwnerID string) ([]Ad, error) {
	return s.adRepo.GetByShopOwner(ctx, shopOwnerID)
}

func (s *adService) GetApprovedAds(ctx context.Context, diseaseTag, category, search string, page, limit int) ([]Ad, int, error) {
	return s.adRepo.GetApprovedAds(ctx, diseaseTag, category, search, page, limit)
}

func (s *adService) GetAllAdsForAdmin(ctx context.Context, status string) ([]Ad, error) {
	return s.adRepo.GetAllAdsForAdmin(ctx, status)
}

func (s *adService) UpdateAd(ctx context.Context, ad *Ad) error {
	return s.adRepo.UpdateAd(ctx, ad)
}

func (s *adService) UpdateAdStatus(ctx context.Context, id string, status AdStatus, reason string) error {
	return s.adRepo.UpdateAdStatus(ctx, id, status, reason)
}

func (s *adService) DeleteAd(ctx context.Context, id string, shopOwnerID string) error {
	return s.adRepo.DeleteAd(ctx, id, shopOwnerID)
}

type productService struct {
	productRepo ProductRepository
}

func NewProductService(productRepo ProductRepository) ProductService {
	return &productService{productRepo: productRepo}
}

func (s *productService) GetProducts(ctx context.Context, category, search string) ([]Product, error) {
	return s.productRepo.GetProducts(ctx, category, search)
}

func (s *productService) GetProductByID(ctx context.Context, id uuid.UUID) (*Product, error) {
	return s.productRepo.GetByID(ctx, id)
}
