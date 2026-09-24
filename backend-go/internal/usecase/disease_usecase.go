package usecase

import (
	"context"

	"backend-go/internal/domain"
	"backend-go/internal/repository"
)

type DiseaseUseCase interface {
	GetAllDiseases(ctx context.Context) ([]domain.Disease, error)
	GetDiseaseByClassID(ctx context.Context, classID int) (*domain.Disease, error)
	CreateDisease(ctx context.Context, disease *domain.Disease) error
	UpdateDisease(ctx context.Context, classID int, disease *domain.Disease) error
	DeleteDisease(ctx context.Context, classID int) error
}

type diseaseUseCase struct {
	diseaseRepo repository.DiseaseRepository
}

func NewDiseaseUseCase(diseaseRepo repository.DiseaseRepository) DiseaseUseCase {
	return &diseaseUseCase{diseaseRepo: diseaseRepo}
}

func (u *diseaseUseCase) GetAllDiseases(ctx context.Context) ([]domain.Disease, error) {
	return u.diseaseRepo.GetAll(ctx)
}

func (u *diseaseUseCase) GetDiseaseByClassID(ctx context.Context, classID int) (*domain.Disease, error) {
	return u.diseaseRepo.GetByClassID(ctx, classID)
}

func (u *diseaseUseCase) CreateDisease(ctx context.Context, disease *domain.Disease) error {
	return u.diseaseRepo.Create(ctx, disease)
}

func (u *diseaseUseCase) UpdateDisease(ctx context.Context, classID int, disease *domain.Disease) error {
	return u.diseaseRepo.Update(ctx, classID, disease)
}

func (u *diseaseUseCase) DeleteDisease(ctx context.Context, classID int) error {
	return u.diseaseRepo.Delete(ctx, classID)
}
