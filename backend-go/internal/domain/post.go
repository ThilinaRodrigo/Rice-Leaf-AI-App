package domain

import (
	"time"
)

type CommunityPost struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	AuthorName    string    `json:"author_name"`
	AuthorRole    string    `json:"author_role"`
	AuthorAvatar  string    `json:"author_avatar"`
	Title         string    `json:"title"`
	Content       string    `json:"content"`
	DiseaseTag    string    `json:"disease_tag"`
	ImageURL      string    `json:"image_url"`
	LikesCount    int       `json:"likes_count"`
	DislikesCount int       `json:"dislikes_count"`
	CommentsCount int       `json:"comments_count"`
	UserVote      string    `json:"user_vote"` // 'like', 'dislike', or ''
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type PostComment struct {
	ID           string    `json:"id"`
	PostID       string    `json:"post_id"`
	UserID       string    `json:"user_id"`
	AuthorName   string    `json:"author_name"`
	AuthorRole   string    `json:"author_role"`
	AuthorAvatar string    `json:"author_avatar"`
	Comment      string    `json:"comment"`
	CreatedAt    time.Time `json:"created_at"`
}

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
