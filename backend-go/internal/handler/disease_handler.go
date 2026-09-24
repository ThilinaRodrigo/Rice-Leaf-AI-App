package handler

import (
	"net/http"
	"strconv"

	"backend-go/internal/domain"
	"backend-go/internal/usecase"

	"github.com/gin-gonic/gin"
)

type DiseaseHandler struct {
	diseaseUC usecase.DiseaseUseCase
}

func NewDiseaseHandler(diseaseUC usecase.DiseaseUseCase) *DiseaseHandler {
	return &DiseaseHandler{diseaseUC: diseaseUC}
}

func (h *DiseaseHandler) GetAllDiseases(c *gin.Context) {
	diseases, err := h.diseaseUC.GetAllDiseases(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, diseases)
}

func (h *DiseaseHandler) GetDiseaseByClassID(c *gin.Context) {
	classIDStr := c.Param("class_id")
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid class_id"})
		return
	}

	disease, err := h.diseaseUC.GetDiseaseByClassID(c.Request.Context(), classID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, disease)
}

func (h *DiseaseHandler) CreateDisease(c *gin.Context) {
	var disease domain.Disease
	if err := c.ShouldBindJSON(&disease); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.diseaseUC.CreateDisease(c.Request.Context(), &disease); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, disease)
}

func (h *DiseaseHandler) UpdateDisease(c *gin.Context) {
	classIDStr := c.Param("class_id")
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid class_id"})
		return
	}

	var disease domain.Disease
	if err := c.ShouldBindJSON(&disease); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.diseaseUC.UpdateDisease(c.Request.Context(), classID, &disease); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, disease)
}

func (h *DiseaseHandler) DeleteDisease(c *gin.Context) {
	classIDStr := c.Param("class_id")
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid class_id"})
		return
	}

	if err := h.diseaseUC.DeleteDisease(c.Request.Context(), classID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Disease deleted successfully"})
}
