package usecase

import (
	"context"
	"fmt"
	"mime/multipart"

	"backend-go/internal/client"
	"backend-go/internal/domain"
	"backend-go/internal/repository"
	"backend-go/pkg/storage"

	"github.com/google/uuid"
)

type ScanUseCase interface {
	AnalyzeImage(ctx context.Context, userID *uuid.UUID, fileHeader *multipart.FileHeader) (*domain.ScanResultResponse, error)
	GetUserScanHistory(ctx context.Context, userID uuid.UUID) ([]domain.Scan, error)
	GetScanByID(ctx context.Context, scanID uuid.UUID) (*domain.ScanResultResponse, error)
}

type scanUseCase struct {
	scanRepo    repository.ScanRepository
	diseaseRepo repository.DiseaseRepository
	mlClient    client.MLClient
	localStorage *storage.LocalStorage
}

func NewScanUseCase(
	scanRepo repository.ScanRepository,
	diseaseRepo repository.DiseaseRepository,
	mlClient client.MLClient,
	localStorage *storage.LocalStorage,
) ScanUseCase {
	return &scanUseCase{
		scanRepo:     scanRepo,
		diseaseRepo:  diseaseRepo,
		mlClient:     mlClient,
		localStorage: localStorage,
	}
}

func (u *scanUseCase) AnalyzeImage(ctx context.Context, userID *uuid.UUID, fileHeader *multipart.FileHeader) (*domain.ScanResultResponse, error) {
	// 1. Save image locally
	_, publicURL, err := u.localStorage.SaveScanImage(fileHeader)
	if err != nil {
		return nil, fmt.Errorf("failed saving upload image: %w", err)
	}

	// 2. Call ML Service for AI inference
	pred, err := u.mlClient.PredictImage(fileHeader)
	if err != nil {
		return nil, fmt.Errorf("failed calling ML prediction: %w", err)
	}

	// 3. Retrieve Disease remedies info from PostgreSQL
	disease, err := u.diseaseRepo.GetByClassID(ctx, pred.ClassID)
	if err != nil {
		// Log warning if disease not found, but keep going with basic info
		disease = nil
	}

	// 4. Save scan record to PostgreSQL
	scan := &domain.Scan{
		UserID:     userID,
		ImageURL:   publicURL,
		ClassID:    pred.ClassID,
		Label:      pred.Label,
		Confidence: pred.Confidence,
	}

	if err := u.scanRepo.SaveScan(ctx, scan); err != nil {
		return nil, fmt.Errorf("failed saving scan record: %w", err)
	}

	return &domain.ScanResultResponse{
		Scan:    *scan,
		Disease: disease,
	}, nil
}

func (u *scanUseCase) GetUserScanHistory(ctx context.Context, userID uuid.UUID) ([]domain.Scan, error) {
	return u.scanRepo.GetHistoryByUserID(ctx, userID)
}

func (u *scanUseCase) GetScanByID(ctx context.Context, scanID uuid.UUID) (*domain.ScanResultResponse, error) {
	scan, err := u.scanRepo.GetScanByID(ctx, scanID)
	if err != nil {
		return nil, err
	}

	disease, _ := u.diseaseRepo.GetByClassID(ctx, scan.ClassID)

	return &domain.ScanResultResponse{
		Scan:    *scan,
		Disease: disease,
	}, nil
}
