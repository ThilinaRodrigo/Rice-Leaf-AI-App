package handler

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"backend-go/config"
	"backend-go/internal/domain"
	"backend-go/internal/usecase"
	"backend-go/pkg/token"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PostHandler struct {
	postUC usecase.PostUsecase
	cfg    *config.Config
}

func NewPostHandler(postUC usecase.PostUsecase, cfg *config.Config) *PostHandler {
	return &PostHandler{postUC: postUC, cfg: cfg}
}

func (h *PostHandler) UploadPostImage(c *gin.Context) {
	postsDir := filepath.Join(h.cfg.UploadsDir, "posts")
	if err := os.MkdirAll(postsDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed creating upload directory"})
		return
	}

	// 1. Try multipart file
	file, err := c.FormFile("image")
	if err == nil {
		ext := filepath.Ext(file.Filename)
		if ext == "" {
			ext = ".jpg"
		}
		newFilename := fmt.Sprintf("post_%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
		dst := filepath.Join(postsDir, newFilename)

		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed saving image file"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"url": "/uploads/posts/" + newFilename})
		return
	}

	// 2. Try JSON Base64 payload
	var jsonReq struct {
		ImageBase64 string `json:"image_base64"`
	}
	if err := c.ShouldBindJSON(&jsonReq); err == nil && jsonReq.ImageBase64 != "" {
		b64Data := jsonReq.ImageBase64
		if idx := strings.Index(b64Data, ","); idx != -1 {
			b64Data = b64Data[idx+1:]
		}
		imgBytes, err := base64.StdEncoding.DecodeString(b64Data)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid base64 image encoding"})
			return
		}

		newFilename := fmt.Sprintf("post_%d_%s.jpg", time.Now().UnixNano(), uuid.New().String()[:8])
		dst := filepath.Join(postsDir, newFilename)

		if err := os.WriteFile(dst, imgBytes, 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed saving decoded image"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"url": "/uploads/posts/" + newFilename})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "no image file or base64 string provided"})
}

func (h *PostHandler) CreatePost(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID not found in context"})
		return
	}

	var dto domain.CreatePostDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post, err := h.postUC.CreatePost(userID, &dto)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, post)
}

func (h *PostHandler) GetPosts(c *gin.Context) {
	diseaseTag := c.Query("disease_tag")
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	currentUserID, _ := getUserIDFromContext(c)

	posts, err := h.postUC.GetPosts(diseaseTag, currentUserID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, posts)
}

func (h *PostHandler) GetSuggestedPosts(c *gin.Context) {
	diseaseTag := c.Query("disease_tag")
	limitStr := c.DefaultQuery("limit", "5")
	limit, _ := strconv.Atoi(limitStr)

	posts, err := h.postUC.GetSuggestedPosts(diseaseTag, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, posts)
}

func (h *PostHandler) GetPostByID(c *gin.Context) {
	id := c.Param("id")
	currentUserID, _ := getUserIDFromContext(c)

	post, err := h.postUC.GetPostByID(id, currentUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if post == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}

func (h *PostHandler) VotePost(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID not found in context"})
		return
	}

	postID := c.Param("id")
	var dto domain.VoteDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.postUC.VotePost(postID, userID, dto.VoteType)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "vote updated successfully"})
}

func (h *PostHandler) AddComment(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID not found in context"})
		return
	}

	postID := c.Param("id")
	var dto domain.CreateCommentDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment, err := h.postUC.AddComment(userID, postID, dto.Comment)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, comment)
}

func (h *PostHandler) GetComments(c *gin.Context) {
	postID := c.Param("id")
	comments, err := h.postUC.GetComments(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, comments)
}

func (h *PostHandler) DeletePost(c *gin.Context) {
	userID, _ := getUserIDFromContext(c)
	role := getRoleFromContext(c)
	isAdmin := role == "sys_admin"

	postID := c.Param("id")
	err := h.postUC.DeletePost(postID, userID, isAdmin)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "post deleted successfully"})
}

func (h *PostHandler) DeleteComment(c *gin.Context) {
	userID, _ := getUserIDFromContext(c)
	role := getRoleFromContext(c)
	isAdmin := role == "sys_admin"

	commentID := c.Param("comment_id")
	err := h.postUC.DeleteComment(commentID, userID, isAdmin)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "comment deleted successfully"})
}

func getRoleFromContext(c *gin.Context) string {
	if payload, exists := c.Get("authorization_payload"); exists {
		if claims, ok := payload.(*token.Claims); ok {
			return claims.Role
		}
	}
	return ""
}
