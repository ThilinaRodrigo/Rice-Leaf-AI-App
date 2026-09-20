package handler

import (
	"net/http"
	"strconv"

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
