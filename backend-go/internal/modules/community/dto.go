package community

type CreatePostDTO struct {
	Title      string `json:"title" binding:"required"`
	Content    string `json:"content" binding:"required"`
	DiseaseTag string `json:"disease_tag" binding:"required"`
	ImageURL   string `json:"image_url"`
}

type VoteDTO struct {
	VoteType string `json:"vote_type" binding:"required"` // 'like' or 'dislike'
}

type CreateCommentDTO struct {
	Comment string `json:"comment" binding:"required"`
}
