# 🚀 Mehedi Hasan Rafi - Portfolio Server

A robust, scalable backend API server for managing a research portfolio website. Built with Node.js, Express, TypeScript, MongoDB, and Redis.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Docker](#-docker)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Features
- 🔐 **Authentication & Authorization** - JWT-based authentication with role-based access control (RBAC)
- 📝 **Content Management** - Manage projects, publications, news, and gallery items
- 📧 **Contact System** - Contact form with email notifications
- 🖼️ **File Upload** - Secure file upload with validation (images, PDFs, videos)
- 📊 **Admin Panel API** - Complete CRUD operations for all content types
- 🔍 **Public API** - Public endpoints for displaying portfolio content
- 💾 **Caching** - Redis integration for improved performance
- 🔌 **Real-time** - Socket.io for real-time notifications
- 📝 **Logging** - Comprehensive request/response logging

### Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation with Zod
- CORS protection
- Session management
- Secure file upload validation

### Technical Features
- TypeScript for type safety
- Cluster mode support for scalability
- Graceful shutdown handling
- Error handling middleware
- Request logging middleware
- Health check endpoint
- MongoDB with Mongoose ODM
- Redis caching support

## 🛠️ Tech Stack

### Core
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB with Mongoose
- **Cache**: Redis 7.x
- **Real-time**: Socket.io 4.x

### Key Dependencies
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `zod` - Schema validation
- `multer` - File upload handling
- `nodemailer` - Email sending
- `socket.io` - WebSocket support
- `redis` - Caching

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher) - Package manager
- **MongoDB** (v6 or higher) - Database
- **Redis** (v7 or higher) - Caching (optional but recommended)
- **Docker** (optional) - For containerized deployment

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/mehdihasanrafi-portfolio.git
cd mehdihasanrafi-portfolio/mehdihasanrafi-portfolio-server
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
URL=http://localhost:5000
CLUSTER_ENABLED=false

# Database
DATABASE_URL=mongodb://localhost:27017/portfolio

# Redis Configuration (Optional)
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_secure_password

# Frontend URL
FRONT_END_URL=http://localhost:8080

# Security
BCRYPT_SALT_ROUNDS=12
DEFAULT_PASSWORD=change_this_in_production
JWT_ACCESS_SECRET=generate_secure_random_string_here
JWT_ACCESS_SECRET_EXPIRES_IN=7d
JWT_REFRESH_SECRET=generate_secure_random_string_here
JWT_REFRESH_SECRET_EXPIRES_IN=30d
JWT_RESET_PASSWORD_SECRET=generate_secure_random_string_here
JWT_RESET_PASSWORD_SECRET_EXPIRES_IN=1h
JWT_EMAIL_VERIFICATION_SECRET=generate_secure_random_string_here
JWT_EMAIL_VERIFICATION_SECRET_EXPIRES_IN=24h
SESSION_SECRET=generate_secure_random_string_here

# Email Configuration
AUTH_USER_EMAIL=your_email@example.com
AUTH_USER_EMAIL_PASSWORD=your_email_app_password
RESET_PASSWORD_UI_LINK=http://localhost:8080/reset-password
EMAIL_VERIFICATION_UI_LINK=http://localhost:8080/verify-email
```

### 4. Generate Secrets

Generate secure random strings for JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this command multiple times to generate different secrets for each JWT secret field.

## 🎯 Usage

### Development

```bash
# Start development server with hot reload
pnpm run start:dev
```

The server will start on `http://localhost:5000`

### Production Build

```bash
# Build TypeScript to JavaScript
pnpm run build

# Start production server
pnpm start
```

### Linting & Formatting

```bash
# Run ESLint
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code with Prettier
pnpm run prettier:fix
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Public Endpoints (No Authentication)

#### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:slug` - Get project by slug

#### Publications
- `GET /api/publications` - Get all publications
- `GET /api/publications/:slug` - Get publication by slug

#### News
- `GET /api/news` - Get all news
- `GET /api/news/:slug` - Get news by slug

#### Gallery
- `GET /api/gallery` - Get all gallery items
- `GET /api/gallery/:id` - Get gallery item by ID

#### Contact
- `POST /api/contact` - Submit contact form

### Authentication Endpoints

#### Public
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/forget-password` - Request password reset
- `PATCH /api/auth/reset-password` - Reset password
- `POST /api/auth/email-verification` - Verify email

#### Protected (Authenticated Users)
- `POST /api/auth/refresh-token` - Refresh access token
- `PATCH /api/auth/change-password` - Change password
- `POST /api/auth/email-verification-source` - Request email verification

### Admin Endpoints (Requires Admin Role)

#### Projects
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id/permanent` - Delete project permanently
- `PATCH /api/projects/bulk` - Bulk update projects
- `DELETE /api/projects/bulk/permanent` - Bulk delete projects

#### Publications
- `POST /api/publications` - Create publication
- `PATCH /api/publications/:id` - Update publication
- `DELETE /api/publications/:id/permanent` - Delete publication permanently
- `PATCH /api/publications/bulk` - Bulk update publications
- `DELETE /api/publications/bulk/permanent` - Bulk delete publications

#### News
- `POST /api/news` - Create news
- `PATCH /api/news/:id` - Update news
- `DELETE /api/news/:id/permanent` - Delete news permanently
- `PATCH /api/news/bulk` - Bulk update news
- `DELETE /api/news/bulk/permanent` - Bulk delete news

#### Gallery
- `POST /api/gallery` - Create gallery item
- `PATCH /api/gallery/:id` - Update gallery item
- `DELETE /api/gallery/:id` - Delete gallery item
- `DELETE /api/gallery/bulk` - Bulk delete gallery items

### User Roles

- `super-admin` - Full system access
- `admin` - Administrative access
- `editor` - Content editing capabilities
- `author` - Content creation and management
- `contributor` - Limited content contribution
- `subscriber` - Premium content access
- `user` - Basic user access

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "status": 200,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "status": 400,
  "message": "Error message",
  "sources": [
    {
      "path": "field_name",
      "message": "Error description"
    }
  ]
}
```

## 📁 Project Structure

```
mehdihasanrafi-portfolio-server/
├── src/
│   ├── app/
│   │   ├── builder/          # AppError, AppQuery classes
│   │   ├── config/           # Configuration management
│   │   ├── errors/           # Error handlers (Zod, Mongoose, etc.)
│   │   ├── middlewares/      # Express middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── file.middleware.ts
│   │   │   ├── log.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/
│   │   │   ├── contact/
│   │   │   ├── gallery/
│   │   │   ├── news/
│   │   │   ├── project/
│   │   │   ├── publication/
│   │   │   └── user/
│   │   ├── redis/            # Redis client setup
│   │   ├── routes/           # Route definitions
│   │   ├── socket/           # Socket.io setup
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   ├── app.ts               # Express app configuration
│   └── index.ts             # Server entry point
├── dist/                    # Compiled JavaScript (after build)
├── uploads/                 # Uploaded files
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose setup
├── vercel.json              # Vercel deployment config
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## 🐳 Docker

### Development with Docker

```bash
# Start all services (app, redis, mongo-express, mailhog)
pnpm run docker:dev

# View logs
pnpm run docker:dev:logs

# Access container shell
pnpm run docker:dev:shell

# Stop services
pnpm run docker:dev:stop

# Restart services
pnpm run docker:dev:restart
```

### Production with Docker

```bash
# Start production services
pnpm run docker:prod

# View logs
pnpm run docker:prod:logs

# Stop services
pnpm run docker:prod:stop
```

### Docker Compose Services

- **app** - Main application server
- **redis** - Redis cache server
- **mongo-express** - MongoDB admin UI (dev only)
- **mailhog** - Email testing server (dev only)

## 🚀 Deployment

### Vercel Deployment

The project includes `vercel.json` configuration for Vercel deployment.

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Manual Deployment

1. Build the project:
   ```bash
   pnpm run build
   ```

2. Set production environment variables

3. Start the server:
   ```bash
   pnpm start
   ```

### Environment Variables for Production

Make sure to set all required environment variables in your production environment. See the [Configuration](#-configuration) section for the complete list.

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use environment variables in production
2. **Use strong JWT secrets** - Generate secure random strings
3. **Enable HTTPS** - Use SSL/TLS in production
4. **Set secure cookies** - Already configured for production
5. **Validate all inputs** - Zod schemas are used for validation
6. **Use rate limiting** - Consider adding rate limiting middleware
7. **Regular security updates** - Keep dependencies updated

## 📊 Health Check

The server includes a health check endpoint:

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test
```

## 📝 Code Quality

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Mehedi Hasan Rafi**
- Portfolio: [https://mehdihasanrafi.com](https://mehdihasanrafi.com)
- Email: mehedi.rafi@university.edu

## 🙏 Acknowledgments

- Express.js team
- MongoDB team
- All open-source contributors

---

**Built with ❤️ for research portfolio management**

