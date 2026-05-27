// VITE_API_URL is set in .env and injected by CI at build time.
// Falls back to empty string so relative /api/... URLs work
// when the frontend and backend are on the same domain.
const API_BASE = 'https://shulecantine.babyeyi.rw/api';
const VITE_PLATFORM ='mobile';  

// For serving uploaded images/files from the backend
const IMAGE_BASE = 'https://shulecantine.babyeyi.rw' || '';

export { IMAGE_BASE , VITE_PLATFORM };
export default API_BASE;
