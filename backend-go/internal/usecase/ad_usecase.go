package usecase

import (
	"context"

	"backend-go/internal/domain"
	"backend-go/internal/repository"
)

type AdUseCase interface {
	CreateAd(ctx context.Context, ad *domain.Ad) error
	GetByID(ctx context.Context, id string) (*domain.Ad, error)
	GetByShopOwner(ctx context.Context, shopOwnerID string) ([]domain.Ad, error)
	GetApprovedAds(ctx context.Context, diseaseTag string) ([]domain.Ad, error)
	GetAllAdsForAdmin(ctx context.Context, status string) ([]domain.Ad, error)
	UpdateAd(ctx context.Context, ad *domain.Ad) error
	UpdateAdStatus(ctx context.Context, id string, status domain.AdStatus, reason string) error
	DeleteAd(ctx context.Context, id string, shopOwnerID string) error
}

type adUseCase struct {
	adRepo repository.AdRepository
}

func NewAdUseCase(adRepo repository.AdRepository) AdUseCase {
	return &adUseCase{adRepo: adRepo}
}

func (u *adUseCase) CreateAd(ctx context.Context, ad *domain.Ad) error {
	return u.adRepo.CreateAd(ctx, ad)
}

func (u *adUseCase) GetByID(ctx context.Context, id string) (*domain.Ad, error) {
	return u.adRepo.GetByID(ctx, id)
}

func (u *adUseCase) GetByShopOwner(ctx context.Context, shopOwnerID string) ([]domain.Ad, error) {
	return u.adRepo.GetByShopOwner(ctx, shopOwnerID)
}

func (u *adUseCase) GetApprovedAds(ctx context.Context, diseaseTag string) ([]domain.Ad, error) {
	return u.adRepo.GetApprovedAds(ctx, diseaseTag)
}

func (u *adUseCase) GetAllAdsForAdmin(ctx context.Context, status string) ([]domain.Ad, error) {
	return u.adRepo.GetAllAdsForAdmin(ctx, status)
}

func (u *adUseCase) UpdateAd(ctx context.Context, ad *domain.Ad) error {
	return u.adRepo.UpdateAd(ctx, ad)
}

func (u *adUseCase) UpdateAdStatus(ctx context.Context, id string, status domain.AdStatus, reason string) error {
	return u.adRepo.UpdateAdStatus(ctx, id, status, reason)
}

func (u *adUseCase) DeleteAd(ctx context.Context, id string, shopOwnerID string) error {
	return u.adRepo.DeleteAd(ctx, id, shopOwnerID)
}
