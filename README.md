# Notes API

A RESTful backend API for managing personal notes, built with Node.js, Express, MongoDB, and Redis.

## Tech Stack

- **Runtime:** Node.js + Express 5
- **Database:** MongoDB (Mongoose)
- **Cache:** Redis (cache-aside pattern with TTL)
- **Auth:** JWT (access + refresh tokens)
- **File Storage:** Cloudinary (avatar uploads via Multer)
- **Email:** Nodemailer (password reset)
- **Security:** Helmet, express-rate-limit, bcrypt
- **Logging:** Winston + Morgan

---

## Features

- User registration and login with hashed passwords
- JWT-based authentication with access & refresh token rotation
- Password reset via email (tokenized, one-time use)
- Notes CRUD with ownership enforcement
- Cursor-based pagination and search on notes
- Redis caching for `GET /notes` with automatic cache invalidation on writes
- Avatar upload to Cloudinary
- Role-based access control (`user` / `admin`)
- Admin stats endpoint
- Rate limiting on auth routes (100 req / 15 min)

---

## Project Structure

```
NOTES-API/
├── config/
│   ├── db.js               # MongoDB connection
│   ├── redisClient.js      # Redis client setup
│   ├── multerConfig.js     # Multer (file upload config)
│   └── emailClient.js      # Nodemailer transport
├── controller/
│   ├── authController.js   # register, login, refresh, logout, forgot/reset password
│   ├── notesController.js  # CRUD + admin stats
│   └── userController.js   # profile, avatar upload
├── middleware/
│   ├── protect.js          # JWT auth guard
│   ├── restrictTo.js       # Role-based access control
│   ├── checkOwnership.js   # Note ownership check
│   ├── noteValidation.js   # Request validation
│   ├── asyncHandler.js     # Async error wrapper
│   └── errorMiddleware.js  # Global error handler
├── models/
│   ├── User.js
│   ├── note.js
│   ├── RefreshToken.js
│   └── PasswordResetToken.js
├── routes/
│   ├── authRoutes.js
│   ├── notesRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── generateAccessToken.js
│   ├── generateRefreshToken.js
│   ├── hashToken.js
│   ├── sendEmail.js
│   ├── uploadToCloudinary.js
│   └── logger.js
└── server.js
```

---

## API Endpoints

### Auth — `/auth`

| Method | Endpoint           | Access  | Description                        |
|--------|--------------------|---------|------------------------------------|
| POST   | `/register`        | Public  | Create a new user account          |
| POST   | `/login`           | Public  | Login and receive tokens           |
| POST   | `/refresh`         | Public  | Get a new access token             |
| POST   | `/logout`          | Public  | Invalidate refresh token           |
| POST   | `/forgot-password` | Public  | Send password reset email          |
| POST   | `/reset-password`  | Public  | Reset password using token         |
| GET    | `/profile`         | Private | View authenticated user's profile  |

### Notes — `/notes`

| Method | Endpoint       | Access       | Description                              |
|--------|----------------|--------------|------------------------------------------|
| POST   | `/`            | Private      | Create a note                            |
| GET    | `/`            | Private      | Get all notes (paginated, searchable)    |
| GET    | `/:id`         | Private      | Get a single note (ownership enforced)   |
| PUT    | `/:id`         | Private      | Update a note (ownership enforced)       |
| DELETE | `/:id`         | Private      | Delete a note (ownership enforced)       |
| GET    | `/admin/stats` | Admin only   | Get total user and note counts           |

**Query params for `GET /notes`:** `limit`, `cursor`, `search`

### Users — `/users`

| Method | Endpoint    | Access  | Description             |
|--------|-------------|---------|-------------------------|
| GET    | `/profile`  | Private | Get user profile        |
| POST   | `/avatar`   | Private | Upload profile picture  |

---

## Environment Variables

Create a `.env` file in the root:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
CLIENT_URL=http://localhost:5173
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Server runs on `http://localhost:3000` by default.

---

## Caching Strategy

`GET /notes` uses a **cache-aside** pattern:

1. Check Redis for a cached response using a key based on `userId + query params`.
2. On a cache hit, return immediately.
3. On a miss, query MongoDB, store the result in Redis with a **60-second TTL**, then respond.
4. Any write operation (create, update, delete) **invalidates all cache keys** for that user.
