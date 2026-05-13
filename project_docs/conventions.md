# Conventions

- **Stack**: Express 4.16 + EJS 2.6 + MongoDB 6 + Bootstrap 5.3 dark theme
- **Auth**: scrypt password hashing (crypto.randomBytes salt), cookie-parser for identity
- **API**: Groq Cloud (OpenAI-compatible) via Axios, JSON response format
- **CSS**: Bootstrap CDN, minimal custom CSS, dark theme (data-bs-theme="dark")
- **Naming**: camelCase for JS, kebab-case for files, descriptive route names
- **Error handling**: try/catch with redirects for auth, error messages for quiz
- **Nodemon**: available via `npm run dev` for development
