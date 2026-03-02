# Connect

Connect is a full‑stack, real‑time messaging application developed as a
technical evaluation project. It demonstrates modern web development practices
and focuses on secure, maintainable implementation of chat functionality.

## Key Features

- **User authentication** with JWT access and refresh tokens stored in
  HTTP‑only cookies.
- **User profiles and search** allowing discovery and interaction with other
  users.
- **One‑to‑one real‑time chat** powered by Socket.io for instant message
  delivery and presence updates.
- **Avatar uploads** via Cloudinary integration.
- **Robust validation and security** including input sanitization,
  XSS protection, rate limiting, and helmet headers.

## Architecture Overview

The repository is structured as a monorepo:

- `backend/` – Node.js (Express) API server with Socket.io and MongoDB
  (Mongoose) models. Controllers delegate business logic to service modules;
  middleware handles auth, validation, file uploads, and errors.
- `frontend/` – React application built with Vite. Utilizes React Context for
  authentication state and socket connection. Components are organized by
  feature, with routing managed by `react-router-dom`.

Both parts run independently, enabling separate development workflows and
future deployment flexibility.

## Technical Highlights

### Backend Details

- **Express.js** with ES module syntax and a layered design (routes →
  controllers → services).
- **Socket.io** integration for real-time communication, initialized in
  `server.js` and exposed via `app.set("io", io)` for route handlers.
- **Mongoose models** for users, conversations, and messages with appropriate
  relations and indexing for efficient querying.
- **JWT-based authentication** with access token expiry and refresh token
  rotation logic handled in `authService.js`.
- **Input validation** using Joi schemas defined alongside request handlers.
- **Security middleware**: `express-mongo-sanitize`, `xss-clean`, `helmet`, and
  `express-rate-limit` applied globally.
- **File uploads** with Multer and Cloudinary managed by `uploadService.js`.
- **Centralized error class** (`ApiError`) and error-handling middleware to
  ensure consistent API responses.
- **Config management** via environment variables read in
  `config/index.js`; server includes error notification when port is in use.

### Frontend Details

- **React + Vite** for fast rebuilds and optimized production bundles.
- **Context-based state** (`AuthContext`) providing authenticated user info and
  socket instance throughout the component tree.
- **Protected/guest route components** enforce auth requirements at the
  client-side routing level.
- **Socket client** setup in `lib/socket.js`; listeners update chat state in
  real time.
- **Axios API wrapper** (`lib/api.js`) handles base URL configuration and
  attaches JWT tokens automatically.
- **Component organization**: UI components under `components/`, pages under
  `pages/`, utility functions under `utils/`.
- **Styling** kept minimal using CSS, focusing on layout rather than design.

## Quality & Security Considerations

- **Separation of concerns** makes the codebase easy to navigate and extend.
- **Security-first approach**: every endpoint validates inputs and sanitizes
  outputs; JWTs are stored securely; CORS and rate limits are configured.
- **Error transparency** provides meaningful status codes and messages for
  clients and aids debugging during evaluation.
- **Dev tooling**: ESLint is configured for the frontend, and nodemon is used
  for backend development.
- **Real-time reliability**: socket events are namespaced, and the server
  handles SIGTERM gracefully for clean shutdowns.

## For Evaluators

I have deployed the backend and frontend on Render.
<div align="center">
  <h3> <a href="https://connect-1puf.onrender.com">Try the Live Demo</a></h3>
</div>

![UI](https://github.com/hardattmangrola/connect/blob/6fd5287f549bc198bed037db220cd608b2efbe5b/demo_photo.png)
