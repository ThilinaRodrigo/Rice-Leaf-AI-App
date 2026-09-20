package usecase

import (
	"context"

	"backend-go/internal/domain"
	"backend-go/internal/repository"
)

type DiseaseUseCase interface {
	GetAllDiseases(ctx context.Context) ([]domain.Disease, error)
	GetDiseaseByClassID(ctx context.Context, classID int) (*domain.Disease, error)
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
