package community

import (
	"errors"
	"strings"
)

type Service interface {
	CreatePost(userID string, dto *CreatePostDTO) (*CommunityPost, error)
	GetPosts(diseaseTag string, currentUserID string, limit int, offset int) ([]CommunityPost, error)
	GetSuggestedPosts(diseaseTag string, limit int) ([]CommunityPost, error)
	GetPostByID(id string, currentUserID string) (*CommunityPost, error)
	VotePost(postID string, userID string, voteType string) error
	AddComment(userID string, postID string, commentText string) (*PostComment, error)
	GetComments(postID string) ([]PostComment, error)
	DeletePost(id string, userID string, isAdmin bool) error
	DeleteComment(commentID string, userID string, isAdmin bool) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) CreatePost(userID string, dto *CreatePostDTO) (*CommunityPost, error) {
	if strings.TrimSpace(dto.Title) == "" {
		return nil, errors.New("title is required")
	}
	if strings.TrimSpace(dto.Content) == "" {
		return nil, errors.New("content is required")
	}

	post := &CommunityPost{
		UserID:     userID,
		Title:      strings.TrimSpace(dto.Title),
		Content:    strings.TrimSpace(dto.Content),
		DiseaseTag: strings.TrimSpace(dto.DiseaseTag),
		ImageURL:   dto.ImageURL,
	}

	err := s.repo.CreatePost(post)
	if err != nil {
		return nil, err
	}

	return post, nil
}

func (s *service) GetPosts(diseaseTag string, currentUserID string, limit int, offset int) ([]CommunityPost, error) {
	return s.repo.GetPosts(diseaseTag, currentUserID, limit, offset)
}

func (s *service) GetSuggestedPosts(diseaseTag string, limit int) ([]CommunityPost, error) {
	return s.repo.GetSuggestedPosts(diseaseTag, limit)
}

func (s *service) GetPostByID(id string, currentUserID string) (*CommunityPost, error) {
	return s.repo.GetPostByID(id, currentUserID)
}

func (s *service) VotePost(postID string, userID string, voteType string) error {
	voteType = strings.ToLower(voteType)
	if voteType != "like" && voteType != "dislike" {
		return errors.New("vote_type must be 'like' or 'dislike'")
	}
	return s.repo.VotePost(postID, userID, voteType)
}

func (s *service) AddComment(userID string, postID string, commentText string) (*PostComment, error) {
	commentText = strings.TrimSpace(commentText)
	if commentText == "" {
		return nil, errors.New("comment text cannot be empty")
	}

	comment := &PostComment{
		PostID:  postID,
		UserID:  userID,
		Comment: commentText,
	}

	err := s.repo.AddComment(comment)
	if err != nil {
		return nil, err
	}

	return comment, nil
}

func (s *service) GetComments(postID string) ([]PostComment, error) {
	return s.repo.GetComments(postID)
}

func (s *service) DeletePost(id string, userID string, isAdmin bool) error {
	return s.repo.DeletePost(id, userID, isAdmin)
}

func (s *service) DeleteComment(commentID string, userID string, isAdmin bool) error {
	return s.repo.DeleteComment(commentID, userID, isAdmin)
}
