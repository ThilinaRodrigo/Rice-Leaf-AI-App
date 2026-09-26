package usecase

import (
	"errors"
	"strings"

	"backend-go/internal/domain"
	"backend-go/internal/repository"
)

type PostUsecase interface {
	CreatePost(userID string, dto *domain.CreatePostDTO) (*domain.CommunityPost, error)
	GetPosts(diseaseTag string, currentUserID string, limit int, offset int) ([]domain.CommunityPost, error)
	GetSuggestedPosts(diseaseTag string, limit int) ([]domain.CommunityPost, error)
	GetPostByID(id string, currentUserID string) (*domain.CommunityPost, error)
	VotePost(postID string, userID string, voteType string) error
	AddComment(userID string, postID string, commentText string) (*domain.PostComment, error)
	GetComments(postID string) ([]domain.PostComment, error)
	DeletePost(id string, userID string, isAdmin bool) error
	DeleteComment(commentID string, userID string, isAdmin bool) error
}

type postUsecase struct {
	repo repository.PostRepository
}

func NewPostUsecase(repo repository.PostRepository) PostUsecase {
	return &postUsecase{repo: repo}
}

func (u *postUsecase) CreatePost(userID string, dto *domain.CreatePostDTO) (*domain.CommunityPost, error) {
	if strings.TrimSpace(dto.Title) == "" {
		return nil, errors.New("title is required")
	}
	if strings.TrimSpace(dto.Content) == "" {
		return nil, errors.New("content is required")
	}

	post := &domain.CommunityPost{
		UserID:     userID,
		Title:      strings.TrimSpace(dto.Title),
		Content:    strings.TrimSpace(dto.Content),
		DiseaseTag: strings.TrimSpace(dto.DiseaseTag),
		ImageURL:   dto.ImageURL,
	}

	err := u.repo.CreatePost(post)
	if err != nil {
		return nil, err
	}

	return post, nil
}

func (u *postUsecase) GetPosts(diseaseTag string, currentUserID string, limit int, offset int) ([]domain.CommunityPost, error) {
	return u.repo.GetPosts(diseaseTag, currentUserID, limit, offset)
}

func (u *postUsecase) GetSuggestedPosts(diseaseTag string, limit int) ([]domain.CommunityPost, error) {
	return u.repo.GetSuggestedPosts(diseaseTag, limit)
}

func (u *postUsecase) GetPostByID(id string, currentUserID string) (*domain.CommunityPost, error) {
	return u.repo.GetPostByID(id, currentUserID)
}

func (u *postUsecase) VotePost(postID string, userID string, voteType string) error {
	voteType = strings.ToLower(voteType)
	if voteType != "like" && voteType != "dislike" {
		return errors.New("vote_type must be 'like' or 'dislike'")
	}
	return u.repo.VotePost(postID, userID, voteType)
}

func (u *postUsecase) AddComment(userID string, postID string, commentText string) (*domain.PostComment, error) {
	commentText = strings.TrimSpace(commentText)
	if commentText == "" {
		return nil, errors.New("comment text cannot be empty")
	}

	comment := &domain.PostComment{
		PostID:  postID,
		UserID:  userID,
		Comment: commentText,
	}

	err := u.repo.AddComment(comment)
	if err != nil {
		return nil, err
	}

	return comment, nil
}

func (u *postUsecase) GetComments(postID string) ([]domain.PostComment, error) {
	return u.repo.GetComments(postID)
}

func (u *postUsecase) DeletePost(id string, userID string, isAdmin bool) error {
	return u.repo.DeletePost(id, userID, isAdmin)
}

func (u *postUsecase) DeleteComment(commentID string, userID string, isAdmin bool) error {
	return u.repo.DeleteComment(commentID, userID, isAdmin)
}
