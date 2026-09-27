package middleware

import (
	"net/http"

	"backend-go/pkg/token"

	"github.com/gin-gonic/gin"
)

func RequireSysAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		payload, ok := c.Get(AuthorizationPayloadKey)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized access"})
			return
		}

		claims, ok := payload.(*token.Claims)
		if !ok || claims.Role != "sys_admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden: system administrator privileges required"})
			return
		}

		c.Next()
	}
}
