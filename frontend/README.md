# Adhyaya AI - Frontend Client

Modern, responsive single-page web application (SPA) built with **React 19**, **Vite**, and **Tailwind CSS**. Provides an interactive learning studio with synchronized YouTube video playback, live RAG AI Tutor chat with timestamp navigation, interactive quizzes, note-taking, markdown export, and verifiable certificates.

---

## Table of Contents

- [Features & Capabilities](#features--capabilities)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Directory Structure](#directory-structure)
- [Core Application Architecture](#core-application-architecture)
  - [1. Authentication & Session Management (`AuthContext.jsx`)](#1-authentication--session-management)
  - [2. Centralized API & Error Handling (`api/axios.js`)](#2-centralized-api--error-handling)
  - [3. Global Notifications (`ToastContext.jsx`)](#3-global-notifications)
  - [4. Synchronized Study Studio & Player (`CourseDetail.jsx`)](#4-synchronized-study-studio--player)
  - [5. RAG AI Tutor Chat Panel (`ChatPanel.jsx`)](#5-rag-ai-tutor-chat-panel)
- [Environment Variables](#environment-variables)
- [Installation & Local Development](#installation--local-development)
- [Building for Production](#building-for-production)
- [Deployment (Vercel SPA)](#deployment-vercel-spa)
- [Troubleshooting](#troubleshooting)

---

## Features & Capabilities

- **Modern Responsive Design System**: Built with Tailwind CSS v4 design tokens, smooth animations (Framer Motion), and momentum scrolling (Lenis).
- **Synchronized Video Player**: Custom YouTube player with chapter markers, playback controls, and automatic lesson synchronization.
- **RAG AI Tutor with `[MM:SS]` Seeking**: Real-time course chat assistant that references exact transcript timestamps that jump the video player upon clicking.
- **Interactive Assessment Engine**: Instant multiple-choice quiz validation, score calculation, explanations, and progress updates.
- **Live Scratchpad & Markdown Exporter**: Take timestamped notes during study sessions and export full course syllabi + notes as clean `.md` files.
- **Course Progress & Verification**: Real-time progress bars, completion checkmarks, and cryptographic certificate generator modal with SHA-256 hash IDs.
- **Dual Authentication**: Local email/password registration/login and Google Identity Services OAuth 2.0 integration.
- **Personalized Settings**: Custom themes (amber, emerald, indigo, rose, cyan), font sizing, grid/list catalog layouts, and dark mode toggles.

---

## Architecture & Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | React 19 | Modern component architecture with hooks and suspense |
| **Tooling & Bundler** | Vite 8 | Fast HMR development server and optimized rollup production bundling |
| **Routing** | React Router v7 | Protected route middleware and browser navigation |
| **Styling** | Tailwind CSS v4 | Utility-first styling with dark mode and custom CSS variables |
| **Animations** | Framer Motion & Lenis | Smooth scrolling and interactive UI transitions |
| **HTTP Client** | Axios | Interceptor-driven requests with JWT bearer tokens and toast alerts |
| **Video Engine** | react-youtube | IFrame Player API wrapper with seek controls |
| **Iconography** | Lucide React & React Icons | SVG icon library |
| **OAuth** | @react-oauth/google | Google Identity Services OAuth provider |

---

## Directory Structure

```text
frontend/
├── package.json                   # Dependencies and npm scripts
├── vite.config.js                 # Vite build configuration & React plugin
├── tailwind.config.js             # Tailwind CSS tokens & dark mode config
├── index.html                     # HTML5 entry point
├── vercel.json                    # Single Page App rewrite rule for Vercel
├── .env.example                   # Environment configuration template
└── src/
    ├── main.jsx                   # Application bootstrap & Google OAuth Provider
    ├── App.jsx                    # Route mapping & Suspense lazy loading
    ├── index.css                  # Design tokens, custom scrollbars & base styles
    ├── context/
    │   ├── AuthContext.jsx        # User state, login, register, token, and theme
    │   └── ToastContext.jsx       # Global toast notification queue and dispatcher
    ├── api/
    │   └── axios.js               # Axios instance with Bearer token & error handler
    ├── hooks/
    │   └── useCourseProgress.js   # Module and section progress computation hook
    ├── pages/
    │   ├── Home.jsx               # Landing page with interactive feature showcases
    │   ├── Login.jsx              # User login page with form validation
    │   ├── Register.jsx           # User registration page
    │   ├── Dashboard.jsx          # Learner dashboard, stats, and course matrix
    │   ├── Courses.jsx            # My Courses catalog and filtering
    │   ├── Profile.jsx            # User profile details and learning metrics
    │   └── Settings.jsx           # Application appearance and preference settings
    ├── components/
    │   ├── ProtectedRoute.jsx     # Route guard redirecting unauthenticated users
    │   ├── RouteLoader.jsx        # Navigation top loading indicator
    │   ├── Loader.jsx             # Animated loading spinner
    │   ├── SmoothScroll.jsx       # Lenis smooth scrolling container
    │   ├── NotFound.jsx           # 404 Not Found fallback page
    │   ├── Hero/                  # Landing page presentation sections
    │   │   ├── Navbar.jsx         # Header navigation
    │   │   ├── Hero.jsx           # Hero banner & demo video callout
    │   │   ├── AIAgents.jsx       # Interactive multi-agent cards
    │   │   ├── HowItWorks.jsx     # Ingestion & curriculum graph workflow
    │   │   ├── EverythingYouNeed.jsx # Feature grid
    │   │   ├── LearnBeyondWatching.jsx # Interactive value matrix
    │   │   ├── CTA.jsx            # Conversion banner
    │   │   └── Footer.jsx         # Footer & links
    │   ├── Dashboard/             # Authenticated dashboard components
    │   │   ├── Navbar.jsx         # Top application navigation bar
    │   │   ├── Avatar.jsx         # Dynamic user avatar component
    │   │   └── RecentCourseCard.jsx # Quick jump course card
    │   └── Courses/               # Course & study studio components
    │       ├── CourseCard.jsx     # Catalog course card
    │       ├── CourseOverview.jsx # Course syllabus & module preview page
    │       ├── CourseDetail.jsx   # Interactive Study Studio workspace
    │       ├── CreateCourseModal.jsx # Video/playlist URL input modal
    │       ├── CustomYoutubePlayer.jsx # Synchronized YouTube player
    │       ├── ChatPanel.jsx      # Embedded RAG AI Tutor chat interface
    │       └── CertificateModal.jsx # Verifiable certificate modal
    └── assets/
        └── logo.png               # Adhyaya AI brand logo
```

---

## Core Application Architecture

### 1. Authentication & Session Management (`AuthContext.jsx`)

- Manages user login, registration, logout, and token lifecycle.
- Persists tokens in `localStorage` (`adhyaya_token`) and synchronizes with server-side HTTP-only cookies.
- Automatically checks session validity on app load via `GET /auth/me`.
- Applies user theme colors (`amber`, `emerald`, `indigo`, `rose`, `cyan`) and dark mode class to `document.documentElement`.

### 2. Centralized API & Error Handling (`api/axios.js`)

- Dynamically resolves `VITE_API_URL` with local fallback to `http://localhost:8000`.
- Request Interceptor: Automatically attaches `Authorization: Bearer <token>` if present.
- Response Interceptor: Translates status codes (401, 403, 404, 429, 500, Network Errors) into user-friendly error messages and dispatches global toast notifications when appropriate.

### 3. Global Notifications (`ToastContext.jsx`)

- Non-blocking notifications for success, warning, error, and info events.
- Supports manual dismissal and automated timeout closures.

### 4. Synchronized Study Studio & Player (`CourseDetail.jsx`)

- Integrated workspace containing the synchronized video player, lesson sidebar, assessment tab, notes scratchpad, and chat panel.
- Controls player state (playing, paused, seek to timestamp) via `CustomYoutubePlayer.jsx`.
- Automatically highlights active module sections as the video progresses.

### 5. RAG AI Tutor Chat Panel (`ChatPanel.jsx`)

- Real-time conversation with the backend LangGraph RAG Tutor.
- Automatically scans AI responses for `[MM:SS]` or `[HH:MM:SS]` timestamp patterns and turns them into clickable seeking buttons.
- Maintains local message history for continuous dialogue.

---

## Environment Variables

Create a `frontend/.env` file:

```env
# Backend API Base URL
VITE_API_URL=http://localhost:8000

# Google OAuth 2.0 Web Client ID
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# YouTube Data API Key (Optional)
VITE_YOUTUBE_API_KEY=your_youtube_data_api_key
```

---

## Installation & Local Development

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Configure `.env`:
   ```bash
   cp .env.example .env
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the frontend at `http://localhost:5173`.

---

## Building for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production bundle locally:

```bash
npm run preview
```

---

## Deployment (Vercel SPA)

The repository includes `frontend/vercel.json` for single-page routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

When deploying on Vercel:
- Set Root Directory to `frontend`.
- Add environment variables:
  - `VITE_API_URL`: Your deployed backend URL (e.g. `https://your-backend.vercel.app`)
  - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID

---

## Troubleshooting

- **`net::ERR_CONNECTION_REFUSED` / Network Error**:
  - Ensure the backend service is running on `http://localhost:8000`.
  - Check that `VITE_API_URL` in `frontend/.env` matches the backend host and port.
- **Google Sign-In Error (Origin Mismatch)**:
  - In Google Cloud Console, add `http://localhost:5173` and your production domain to Authorized JavaScript Origins.
- **Module / Player Seeking Issues**:
  - Ensure third-party cookies and YouTube iframe embeddings are permitted by your browser.
