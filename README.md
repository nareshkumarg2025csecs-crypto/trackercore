# GreenLedger Personal Capital Terminal 🌐

GreenLedger is a modern, beautiful, and secure personal finance tracker application structured as a monorepo containing a frontend client and backend server.

## 📂 Project Structure

```
tracker/
├── frontend/                  # React + Vite client application
│   ├── src/                   # React components, pages, context, and state
│   ├── public/                # Static assets
│   ├── .env                   # Frontend environment variables
│   └── package.json           # Frontend package dependencies & scripts
├── backend/                   # Node.js + Express API server
│   ├── src/                   # Main server routes, controllers, middleware, and config
│   │   ├── config/            # Firebase Admin SDK settings
│   │   ├── controllers/       # Route request handlers
│   │   ├── middleware/        # Request validation and auth middleware
│   │   ├── routes/            # REST API endpoint definitions
│   │   └── index.js           # Server application entry point
│   ├── .env                   # Backend environment variables
│   ├── serviceAccountKey.json # Firebase Service Account key (Gitignored!)
│   └── package.json           # Backend package dependencies & scripts
├── .gitignore                 # Root level git rules
├── package.json               # Root monorepo manager package
└── README.md                  # Project overview and run instructions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
Install all dependencies for both `frontend` and `backend` using the root monorepo manager script:
```bash
npm run install:all
```

### Development
Start both the Frontend (Vite) and Backend (Express) servers simultaneously using:
```bash
npm run dev
```
- Frontend will run on: `http://localhost:5173`
- Backend will run on: `http://localhost:5000`

### Production Build
To compile the frontend bundle for production deployment, run:
```bash
npm run build:frontend
```

---

## 🔒 Firebase Configuration

### Service Account Key
To enable token authentication validation in the backend:
1. Go to your **Firebase Console** -> **Project Settings** -> **Service Accounts**.
2. Click **Generate New Private Key** and download the file.
3. Rename the downloaded file to `serviceAccountKey.json`.
4. Place it in the `backend/` folder of this project.

> [!WARNING]
> **Security Warning:** The `serviceAccountKey.json` contains private credentials and should **never** be committed to Git. It has been pre-configured in `.gitignore`.
