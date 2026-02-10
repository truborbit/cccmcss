## Packages
@tiptap/react | Rich text editor for articles
@tiptap/starter-kit | Basic extensions for Tiptap
@tiptap/extension-placeholder | Placeholder text for editor
recharts | For dashboard analytics
date-fns | For date formatting
framer-motion | Smooth page transitions and animations
react-hook-form | Form state management
@hookform/resolvers | Zod resolver for forms

## Notes
Authentication uses Replit Auth (OpenID Connect).
The backend provides /api/login and /api/logout endpoints.
Protected routes should check authentication state via useAuth.
Rich text content is stored as HTML string.
