/**
 * Resolves media URLs for both local development and production EC2 environments.
 * 
 * - In production (behind Nginx reverse proxy): returns relative path '/uploads/...'
 *   which Nginx proxies directly to backend-go on the same host without CORS issues.
 * - In local development (Vite on localhost:5173): prepends local backend domain.
 * - External image URLs (e.g. Unsplash, CDNs) are preserved as-is.
 */
export const getFullMediaUrl = (url?: string): string => {
  if (!url) return '';

  // 1. Check if the URL points to an uploaded file on our server
  const uploadIndex = url.indexOf('/uploads/');
  if (uploadIndex !== -1) {
    const relPath = url.substring(uploadIndex); // extracts '/uploads/...'

    // When running locally with separate frontend (localhost:5173) and backend
    const apiEnv = import.meta.env.VITE_API_BASE_URL;
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost' &&
      apiEnv &&
      apiEnv.startsWith('http') &&
      !apiEnv.includes('localhost:5173')
    ) {
      const serverDomain = apiEnv.replace(/\/api\/v1\/?$/, '');
      return `${serverDomain}${relPath}`;
    }

    // Returning relative path '/uploads/...' allows Nginx on port 80/443
    // to reverse-proxy directly to backend-go without any CORS or mixed content issues.
    return relPath;
  }

  // 2. External CDN / Web URL (e.g. Unsplash)
  return url;
};
