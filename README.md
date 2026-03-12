<div align="center">

# 🚀 TenantStack — Multi-Tenant SaaS Platform

**A production-ready MERN stack SaaS platform with enterprise-grade multi-tenancy, RBAC, JWT security, and a stunning dark UI.**

[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docker.com)

</div>

---

## 📖 Overview

TenantStack is a **complete SaaS boilerplate** similar to Slack or Notion where multiple companies can sign up and each gets a fully isolated workspace. Built for developers who want to ship a multi-tenant product fast without compromising on architecture quality.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  React + Vite (Port 5173)                                       │
│  TailwindCSS · Framer Motion · Recharts · React Router v7       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP / JWT Bearer
┌────────────────────────▼────────────────────────────────────────┐
│  Express.js API (Port 5000)                                     │
│  Helmet · CORS · Rate Limiting · Swagger Docs                   │
│                                                                 │
│  Middleware Pipeline:                                           │
│  Request → auth.js → rbac.js → tenantIsolation.js → Controller │
└────────────────────────┬────────────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────────────┐
│  MongoDB Atlas                                                  │
│  Users · Tenants · Subscriptions · AuditLogs                   │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ Features

| Feature | Description |
|---|---|
| 🏢 **Multi-Tenancy** | Every document scoped by `tenantId`. Cross-tenant access blocked at middleware level |
| 🔐 **JWT Auth** | Access token (15min) + refresh token rotation (7d), bcrypt hashing |
| 👥 **RBAC** | 3 roles: Super Admin · Tenant Admin · User with middleware enforcement |
| 📊 **Analytics** | Real-time Recharts dashboards for user growth, role distribution, activity |
| 👤 **User Management** | Invite users, change roles inline, deactivate accounts |
| 📋 **Audit Logs** | TTL-indexed audit trail of all actions (auto-expires after 90 days) |
| 📚 **Swagger Docs** | Auto-generated interactive API docs at `/api/docs` |
| 🐳 **Docker Ready** | Multi-stage builds for client (Nginx) and server (Node Alpine) |
| 📱 **Responsive** | Mobile-friendly with collapsible sidebar |

## 🛠️ Tech Stack

**Frontend:** React 19 · Vite 7 · TailwindCSS 4 · Framer Motion · React Router v7 · React Hook Form · Recharts · Lucide React · Axios · React Hot Toast

**Backend:** Node.js 20 · Express.js · JWT · bcryptjs · Helmet · express-rate-limit · express-validator · Swagger UI · Winston · Mongoose

**Database:** MongoDB Atlas · Mongoose ODM

**DevOps:** Docker · Docker Compose · Nginx · dotenv

## 📁 Folder Structure

```
saas-multi-tenant-platform/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── api/               # Axios client + endpoint modules
│       ├── components/        # Layout (Sidebar, Navbar) + UI
│       ├── context/           # AuthContext
│       ├── pages/             # 9 pages (Landing, Auth, Dashboards...)
│       └── routes/            # Protected + role-based routing
├── server/                    # Express.js backend
│   ├── config/                # Database, Swagger
│   ├── controllers/           # Auth, User, Tenant, Analytics, Admin
│   ├── middleware/            # auth, rbac, tenantIsolation, validate
│   ├── models/                # User, Tenant, Subscription, AuditLog
│   ├── routes/                # REST API routes
│   ├── services/              # jwtService
│   └── utils/                 # apiResponse, logger
├── docker/                    # Dockerfiles + nginx.conf
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# Copy and edit the server environment file
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/saas_platform
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
CLIENT_URL=http://localhost:5173
```

### 3. Start Development Servers

```bash
# Terminal 1 – Backend
cd server
npm run dev

# Terminal 2 – Frontend
cd client
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api/docs
- **Health Check:** http://localhost:5000/api/health

## 🐳 Docker Setup

```bash
# Build and run everything
docker-compose up --build

# Access
# Frontend: http://localhost
# API: http://localhost:5000
```

## 🔑 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | `random-256-bit-string` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `different-256-bit-string` |
| `JWT_ACCESS_EXPIRES` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES` | Refresh token expiry | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `PORT` | Server port | `5000` |

## 📚 API Documentation

Interactive Swagger docs are available at **`/api/docs`** when the server is running.

### Key Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | — | Register org + admin user |
| `POST` | `/api/auth/login` | ❌ | — | Login |
| `POST` | `/api/auth/refresh` | ❌ | — | Refresh access token |
| `GET` | `/api/auth/me` | ✅ | Any | Get current user |
| `GET` | `/api/users` | ✅ | Admin+ | List org users |
| `POST` | `/api/users/invite` | ✅ | Admin+ | Invite user |
| `GET` | `/api/tenant` | ✅ | Admin+ | Get tenant info |
| `GET` | `/api/analytics/tenant` | ✅ | Admin+ | Tenant analytics |
| `GET` | `/api/analytics/platform` | ✅ | Super Admin | Platform analytics |
| `GET` | `/api/admin/tenants` | ✅ | Super Admin | All tenants |

## 🔒 Security

- **JWT Middleware** – Every protected route verifies the access token
- **RBAC Middleware** – `authorize(...roles)` factory blocks unauthorized roles
- **Tenant Isolation** – `tenantIsolation.js` ensures cross-tenant access is impossible
- **Helmet** – Sets 14 security HTTP headers
- **Rate Limiting** – 100 req/15min globally, 20 req/15min on auth routes
- **bcrypt** – Passwords hashed with 12 salt rounds
- **Input Validation** – `express-validator` on all request bodies

## 🗺️ Role Permissions

| Permission | Super Admin | Tenant Admin | User |
|---|:---:|:---:|:---:|
| Platform analytics | ✅ | ❌ | ❌ |
| Manage all tenants | ✅ | ❌ | ❌ |
| Invite users | ✅ | ✅ | ❌ |
| Manage roles | ✅ | ✅ | ❌ |
| Org analytics | ✅ | ✅ | ❌ |
| View own dashboard | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |

## 🔮 Future Improvements

- [ ] Email verification on registration
- [ ] Stripe subscription billing integration
- [ ] SSO / SAML authentication
- [ ] Custom domain mapping per tenant
- [ ] Webhooks for tenant events
- [ ] Real-time notifications via WebSocket
- [ ] Export audit logs to CSV
- [ ] API key management for tenants
- [ ] White-labeling per tenant
- [ ] Automated backup scheduling

## 📄 License

MIT © 2024 TenantStack
