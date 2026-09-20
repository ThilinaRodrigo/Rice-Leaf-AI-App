package usecase

import (
	"context"

	"backend-go/internal/domain"
	"backend-go/internal/repository"

	"github.com/google/uuid"
)

type ProductUseCase interface {
	GetProducts(ctx context.Context, category, search string) ([]domain.Product, error)
	GetProductByID(ctx context.Context, id uuid.UUID) (*domain.Product, error)
}

type productUseCase struct {
	productRepo repository.ProductRepository
}

func NewProductUseCase(productRepo repository.ProductRepository) ProductUseCase {
	return &productUseCase{productRepo: productRepo}
}

func (u *productUseCase) GetProducts(ctx context.Context, category, search string) ([]domain.Product, error) {
	return u.productRepo.GetProducts(ctx, category, search)
}

func (u *productUseCase) GetProductByID(ctx context.Context, id uuid.UUID) (*domain.Product, error) {
	return u.productRepo.GetByID(ctx, id)
}
