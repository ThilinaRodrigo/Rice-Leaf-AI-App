package scan

import "backend-go/internal/modules/disease"

type ScanResultResponse struct {
	Scan    Scan            `json:"scan"`
	Disease *disease.Disease `json:"disease,omitempty"`
}
