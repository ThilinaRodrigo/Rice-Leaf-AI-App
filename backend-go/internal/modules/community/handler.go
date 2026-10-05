package community

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
	"backend-go/internal/shared/middleware"
	"backend-go/pkg/token"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	service Service
	cfg     *config.Config
}

func NewHandler(service Service, cfg *config.Config) *Handler {
	return &Handler{service: service, cfg: cfg}
}

func (h *Handler) UploadPostImage(c *gin.Context) {
	postsDir := filepath.Join(h.cfg.UploadsDir, "posts")
	if err := os.MkdirAll(postsDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed creating upload directory"})
		return
	}

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

func (h *Handler) CreatePost(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID not found in context"})
		return
	}

	var dto CreatePostDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post, err := h.service.CreatePost(userID, &dto)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, post)
}

func (h *Handler) GetPosts(c *gin.Context) {
	diseaseTag := c.Query("disease_tag")
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	currentUserID, _ := getUserIDFromContext(c)

	posts, err := h.service.GetPosts(diseaseTag, currentUserID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, posts)
}

func (h *Handler) GetSuggestedPosts(c *gin.Context) {
	diseaseTag := c.Query("disease_tag")
	limitStr := c.DefaultQuery("limit", "5")
	limit, _ := strconv.Atoi(limitStr)

	posts, err := h.service.GetSuggestedPosts(diseaseTag, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, posts)
}

func (h *Handler) GetPostByID(c *gin.Context) {
	id := c.Param("id")
	currentUserID, _ := getUserIDFromContext(c)

	post, err := h.service.GetPostByID(id, currentUserID)
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

func (h *Handler) VotePost(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID not found in context"})
		return
	}

	postID := c.Param("id")
	var dto VoteDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.VotePost(postID, userID, dto.VoteType)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "vote updated successfully"})
}

func (h *Handler) AddComment(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID not found in context"})
		return
	}

	postID := c.Param("id")
	var dto CreateCommentDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment, err := h.service.AddComment(userID, postID, dto.Comment)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, comment)
}

func (h *Handler) GetComments(c *gin.Context) {
	postID := c.Param("id")
	comments, err := h.service.GetComments(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, comments)
}

func (h *Handler) DeletePost(c *gin.Context) {
	userID, _ := getUserIDFromContext(c)
	role := getRoleFromContext(c)
	isAdmin := role == "sys_admin"

	postID := c.Param("id")
	err := h.service.DeletePost(postID, userID, isAdmin)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "post deleted successfully"})
}

func (h *Handler) DeleteComment(c *gin.Context) {
	userID, _ := getUserIDFromContext(c)
	role := getRoleFromContext(c)
	isAdmin := role == "sys_admin"

	commentID := c.Param("comment_id")
	err := h.service.DeleteComment(commentID, userID, isAdmin)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "comment deleted successfully"})
}

func getUserIDFromContext(c *gin.Context) (string, bool) {
	if payload, exists := c.Get(middleware.AuthorizationPayloadKey); exists {
		if claims, ok := payload.(*token.Claims); ok {
			return claims.UserID.String(), true
		}
	}
	return "", false
}

func getRoleFromContext(c *gin.Context) string {
	if payload, exists := c.Get(middleware.AuthorizationPayloadKey); exists {
		if claims, ok := payload.(*token.Claims); ok {
			return claims.Role
		}
	}
	return ""
}
