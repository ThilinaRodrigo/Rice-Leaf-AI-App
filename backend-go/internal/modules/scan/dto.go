package scan

import (
	"backend-go/internal/modules/disease"
	"backend-go/pkg/mlclient"
)

type ScanResultResponse struct {
	Scan    Scan             `json:"scan"`
	Disease *disease.Disease `json:"disease,omitempty"`
}

type RejectionResponse struct {
	Success    bool                     `json:"success"`
	Error      string                   `json:"error"`
	Message    string                   `json:"message"`
	Validation *mlclient.ValidationResult `json:"validation,omitempty"`
}

type ErrNotRiceLeaf struct {
	Validation *mlclient.ValidationResult
}

func (e *ErrNotRiceLeaf) Error() string {
	return "uploaded image is not identified as a rice leaf"
}
