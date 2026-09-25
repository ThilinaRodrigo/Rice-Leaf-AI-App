package middleware

import (
	"net/http"
	"strings"

	"backend-go/pkg/token"

	"github.com/gin-gonic/gin"
)

const (
	AuthorizationHeaderKey = "authorization"
	AuthorizationTypeBearer = "bearer"
	AuthorizationPayloadKey = "authorization_payload"
)

func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader(AuthorizationHeaderKey)
		if len(authHeader) == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header is not provided"})
			return
		}

		fields := strings.Fields(authHeader)
		if len(fields) < 2 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
			return
		}

		authorizationType := strings.ToLower(fields[0])
		if authorizationType != AuthorizationTypeBearer {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unsupported authorization type"})
			return
		}

		accessToken := fields[1]
		claims, err := token.ValidateToken(accessToken, secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}

		c.Set(AuthorizationPayloadKey, claims)
		c.Set("userID", claims.UserID.String())
		c.Next()
	}
}

// OptionalAuthMiddleware parses JWT token if present, but doesn't abort if missing (for guest users)
func OptionalAuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader(AuthorizationHeaderKey)
		if len(authHeader) > 0 {
			fields := strings.Fields(authHeader)
			if len(fields) >= 2 && strings.ToLower(fields[0]) == AuthorizationTypeBearer {
				claims, err := token.ValidateToken(fields[1], secret)
				if err == nil {
					c.Set(AuthorizationPayloadKey, claims)
				}
			}
		}
		c.Next()
	}
}
