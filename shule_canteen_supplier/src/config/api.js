// VITE_API_URL is set in .env and injected by CI at build time.
// Falls back to empty string so relative /api/... URLs work
// when the frontend and backend are on the same domain.
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

// For serving uploaded images/files from the backend
const IMAGE_BASE = import.meta.env.VITE_API_URL || '';

export { IMAGE_BASE };
export default API_BASE;
