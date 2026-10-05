package shop

type UpdateAdStatusDTO struct {
	Status          AdStatus `json:"status" binding:"required"`
	RejectionReason string   `json:"rejection_reason"`
}

type UploadAdImageResponse struct {
	ImageURL string `json:"image_url"`
	Filename string `json:"filename"`
}
