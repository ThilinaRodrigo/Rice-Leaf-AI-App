package repository

import (
	"database/sql"
	"fmt"

	"backend-go/internal/domain"
)

type PostRepository interface {
	CreatePost(post *domain.CommunityPost) error
	GetPosts(diseaseTag string, currentUserID string, limit int, offset int) ([]domain.CommunityPost, error)
	GetSuggestedPosts(diseaseTag string, limit int) ([]domain.CommunityPost, error)
	GetPostByID(id string, currentUserID string) (*domain.CommunityPost, error)
	VotePost(postID string, userID string, voteType string) error
	AddComment(comment *domain.PostComment) error
	GetComments(postID string) ([]domain.PostComment, error)
	DeletePost(id string, userID string, isAdmin bool) error
	DeleteComment(commentID string, userID string, isAdmin bool) error
}

type postRepository struct {
	db *sql.DB
}

func NewPostRepository(db *sql.DB) PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) CreatePost(post *domain.CommunityPost) error {
	query := `
		INSERT INTO community_posts (user_id, title, content, disease_tag, image_url)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRow(
		query,
		post.UserID,
		post.Title,
		post.Content,
		post.DiseaseTag,
		post.ImageURL,
	).Scan(&post.ID, &post.CreatedAt, &post.UpdatedAt)
}

func (r *postRepository) GetPosts(diseaseTag string, currentUserID string, limit int, offset int) ([]domain.CommunityPost, error) {
	if limit <= 0 {
		limit = 20
	}

	query := `
		SELECT 
			p.id, p.user_id, COALESCE(u.full_name, 'Anonymous'), COALESCE(u.role, 'farmer'), COALESCE(u.avatar_url, ''),
			p.title, p.content, p.disease_tag, COALESCE(p.image_url, ''),
			p.likes_count, p.dislikes_count, p.comments_count,
			COALESCE(pv.vote_type, '') as user_vote,
			p.created_at, p.updated_at
		FROM community_posts p
		LEFT JOIN users u ON p.user_id = u.id
		LEFT JOIN post_votes pv ON p.id = pv.post_id AND pv.user_id = NULLIF($1, '')::uuid
		WHERE ($2 = '' OR p.disease_tag = $2)
		ORDER BY p.created_at DESC
		LIMIT $3 OFFSET $4
	`

	rows, err := r.db.Query(query, currentUserID, diseaseTag, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("error querying posts: %w", err)
	}
	defer rows.Close()

	posts := []domain.CommunityPost{}
	for rows.Next() {
		var p domain.CommunityPost
		err := rows.Scan(
			&p.ID, &p.UserID, &p.AuthorName, &p.AuthorRole, &p.AuthorAvatar,
			&p.Title, &p.Content, &p.DiseaseTag, &p.ImageURL,
			&p.LikesCount, &p.DislikesCount, &p.CommentsCount,
			&p.UserVote,
			&p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning post: %w", err)
		}
		posts = append(posts, p)
	}
	return posts, nil
}

func (r *postRepository) GetSuggestedPosts(diseaseTag string, limit int) ([]domain.CommunityPost, error) {
	if limit <= 0 {
		limit = 5
	}

	query := `
		SELECT 
			p.id, p.user_id, COALESCE(u.full_name, 'Anonymous'), COALESCE(u.role, 'farmer'), COALESCE(u.avatar_url, ''),
			p.title, p.content, p.disease_tag, COALESCE(p.image_url, ''),
			p.likes_count, p.dislikes_count, p.comments_count,
			'' as user_vote,
			p.created_at, p.updated_at
		FROM community_posts p
		LEFT JOIN users u ON p.user_id = u.id
		WHERE ($1 = '' OR p.disease_tag = $1)
		ORDER BY (p.likes_count - p.dislikes_count) DESC, p.created_at DESC
		LIMIT $2
	`

	rows, err := r.db.Query(query, diseaseTag, limit)
	if err != nil {
		return nil, fmt.Errorf("error querying suggested posts: %w", err)
	}
	defer rows.Close()

	posts := []domain.CommunityPost{}
	for rows.Next() {
		var p domain.CommunityPost
		err := rows.Scan(
			&p.ID, &p.UserID, &p.AuthorName, &p.AuthorRole, &p.AuthorAvatar,
			&p.Title, &p.Content, &p.DiseaseTag, &p.ImageURL,
			&p.LikesCount, &p.DislikesCount, &p.CommentsCount,
			&p.UserVote,
			&p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning suggested post: %w", err)
		}
		posts = append(posts, p)
	}
	return posts, nil
}

func (r *postRepository) GetPostByID(id string, currentUserID string) (*domain.CommunityPost, error) {
	query := `
		SELECT 
			p.id, p.user_id, COALESCE(u.full_name, 'Anonymous'), COALESCE(u.role, 'farmer'), COALESCE(u.avatar_url, ''),
			p.title, p.content, p.disease_tag, COALESCE(p.image_url, ''),
			p.likes_count, p.dislikes_count, p.comments_count,
			COALESCE(pv.vote_type, '') as user_vote,
			p.created_at, p.updated_at
		FROM community_posts p
		LEFT JOIN users u ON p.user_id = u.id
		LEFT JOIN post_votes pv ON p.id = pv.post_id AND pv.user_id = NULLIF($1, '')::uuid
		WHERE p.id = $2
	`

	var p domain.CommunityPost
	err := r.db.QueryRow(query, currentUserID, id).Scan(
		&p.ID, &p.UserID, &p.AuthorName, &p.AuthorRole, &p.AuthorAvatar,
		&p.Title, &p.Content, &p.DiseaseTag, &p.ImageURL,
		&p.LikesCount, &p.DislikesCount, &p.CommentsCount,
		&p.UserVote,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (r *postRepository) VotePost(postID string, userID string, voteType string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Check existing vote
	var existingVote string
	err = tx.QueryRow("SELECT vote_type FROM post_votes WHERE post_id = $1 AND user_id = $2", postID, userID).Scan(&existingVote)

	if err == sql.ErrNoRows {
		// Insert new vote
		_, err = tx.Exec("INSERT INTO post_votes (post_id, user_id, vote_type) VALUES ($1, $2, $3)", postID, userID, voteType)
		if err != nil {
			return err
		}

		if voteType == "like" {
			_, err = tx.Exec("UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = $1", postID)
		} else {
			_, err = tx.Exec("UPDATE community_posts SET dislikes_count = dislikes_count + 1 WHERE id = $1", postID)
		}
		if err != nil {
			return err
		}
	} else if err != nil {
		return err
	} else {
		if existingVote == voteType {
			// Toggle off vote
			_, err = tx.Exec("DELETE FROM post_votes WHERE post_id = $1 AND user_id = $2", postID, userID)
			if err != nil {
				return err
			}
			if voteType == "like" {
				_, err = tx.Exec("UPDATE community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1", postID)
			} else {
				_, err = tx.Exec("UPDATE community_posts SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = $1", postID)
			}
			if err != nil {
				return err
			}
		} else {
			// Change vote type
			_, err = tx.Exec("UPDATE post_votes SET vote_type = $3 WHERE post_id = $1 AND user_id = $2", postID, userID, voteType)
			if err != nil {
				return err
			}
			if voteType == "like" {
				_, err = tx.Exec("UPDATE community_posts SET likes_count = likes_count + 1, dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = $1", postID)
			} else {
				_, err = tx.Exec("UPDATE community_posts SET dislikes_count = dislikes_count + 1, likes_count = GREATEST(0, likes_count - 1) WHERE id = $1", postID)
			}
			if err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}

func (r *postRepository) AddComment(comment *domain.PostComment) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO post_comments (post_id, user_id, comment)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`
	err = tx.QueryRow(query, comment.PostID, comment.UserID, comment.Comment).Scan(&comment.ID, &comment.CreatedAt)
	if err != nil {
		return err
	}

	_, err = tx.Exec("UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = $1", comment.PostID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *postRepository) GetComments(postID string) ([]domain.PostComment, error) {
	query := `
		SELECT 
			c.id, c.post_id, c.user_id, COALESCE(u.full_name, 'Anonymous'), COALESCE(u.role, 'farmer'), COALESCE(u.avatar_url, ''),
			c.comment, c.created_at
		FROM post_comments c
		LEFT JOIN users u ON c.user_id = u.id
		WHERE c.post_id = $1
		ORDER BY c.created_at ASC
	`
	rows, err := r.db.Query(query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := []domain.PostComment{}
	for rows.Next() {
		var c domain.PostComment
		err := rows.Scan(
			&c.ID, &c.PostID, &c.UserID, &c.AuthorName, &c.AuthorRole, &c.AuthorAvatar,
			&c.Comment, &c.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		comments = append(comments, c)
	}
	return comments, nil
}

func (r *postRepository) DeletePost(id string, userID string, isAdmin bool) error {
	if isAdmin {
		_, err := r.db.Exec("DELETE FROM community_posts WHERE id = $1", id)
		return err
	}
	res, err := r.db.Exec("DELETE FROM community_posts WHERE id = $1 AND user_id = $2", id, userID)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("unauthorized or post not found")
	}
	return nil
}

func (r *postRepository) DeleteComment(commentID string, userID string, isAdmin bool) error {
	var postID string
	var commentUserID string
	err := r.db.QueryRow("SELECT post_id, user_id FROM post_comments WHERE id = $1", commentID).Scan(&postID, &commentUserID)
	if err != nil {
		return err
	}

	if !isAdmin && commentUserID != userID {
		return fmt.Errorf("unauthorized to delete comment")
	}

	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec("DELETE FROM post_comments WHERE id = $1", commentID)
	if err != nil {
		return err
	}

	_, err = tx.Exec("UPDATE community_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = $1", postID)
	if err != nil {
		return err
	}

	return tx.Commit()
}
