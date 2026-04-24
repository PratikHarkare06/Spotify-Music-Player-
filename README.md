# 🎵 Spotify Clone

A high-fidelity, full-stack Spotify clone built with **React**, **FastAPI**, and **MongoDB**. Replicates the complete Spotify desktop and mobile experience — including real audio playback, drag-to-scrub controls, Now Playing panel, context menus, and a fully responsive mobile layout.

---

## ✨ Features

### 🎨 UI / Design
- Pixel-perfect dark theme (`#121212` / `#181818`) matching Spotify's design system
- Spotify SVG green logo and authentic favicon
- Circular nav arrows, **UPGRADE** pill button, user avatar in TopBar
- Sticky TopBar with dynamic gradient fade-in on scroll
- Time-aware greeting — *Good morning / afternoon / evening*

### 🏠 Home Page
- **Pinned quick-play grid** — 6 recently played songs in a 3-column layout
- **Made for You** — 20 equal-size uniform cards (playlists + Daily Mixes, Discover Weekly, Release Radar, On Repeat, and more)
- **Recently Played** — scrollable song grid with hover play buttons

### 🔍 Search Page
- Pill-shaped search input
- **Top Result** large card + **Songs** grouped results list
- **Browse All** — colourful genre cards with rotated album art

### 📚 Library Page
- Filter pills — All / Playlists / Albums / Artists
- List / Grid view toggle

### 🎼 Playlist Page
- **Gradient hero header** — unique colour gradient per playlist, fades to black
- Large 208px artwork with drop shadow
- Sticky table header — `#`, Title, Album, ♡, ⏱
- Active track highlighted in Spotify green
- Per-track like button (hover → turns green)
- Track number swaps to play icon on hover

### 🎵 Player Bar
- **Real audio playback** via SoundHelix CDN (10 unique tracks)
- **Drag-to-scrub** progress bar — smooth drag anywhere on the track
- **Drag volume slider** — same drag interaction
- Live `currentTime / duration` display
- Green circular play/pause button
- Shuffle (random queue) with green dot indicator
- Repeat (loops song) with green dot indicator
- Muted speaker icon when muted / volume = 0
- Heart like button for current song

### ⏭ Song Queue
- Next / Prev track buttons (functional)
- Prev restarts current track if > 3 seconds in
- Shuffle mode picks a random next song
- Auto-advances to next song when track ends

### ⌨️ Keyboard Shortcuts
| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `→` | Next song |
| `←` | Previous song |
| `M` | Toggle mute |

### 📋 Now Playing Panel
- Toggle with the panel icon in the player bar (turns green when active)
- Slides in from the right with animation
- Large album artwork, song info + like button
- Lyrics placeholder panel (ready for Musixmatch / Genius API)
- **Up Next** queue — next 5 songs, clickable to play
- Full-screen overlay on mobile

### 🖱 Context Menus
- **Right-click any track** on Home, Search, or Playlist pages
- Smart position correction — never overflows the screen
- Actions: Play now, Save to Liked Songs, Add to playlist, Go to album, Go to artist, Share
- Dismisses on any outside click
- Slides up as a **bottom sheet** on mobile

### 📱 Mobile Responsive
- **Bottom navigation bar** — Home / Search / Your Library with active-route highlight
- **Mini player** floats above the bottom nav with album thumb, title, play button and a green progress bar
- Tapping the mini player opens the Now Playing full-screen panel
- Desktop sidebar and full player bar hidden on mobile
- All grids collapse to **2 columns** on small screens

---

## 🛠 Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| **React 18** | UI framework |
| **React Router v6** | Client-side routing |
| **Tailwind CSS** | Utility-first styling with custom Spotify tokens |
| **Heroicons** | SVG icon library |
| **Axios** | HTTP client |
| **Craco** | CRA config override |

### Backend
| Tech | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **MongoDB** | NoSQL database |
| **Motor** | Async MongoDB driver |
| **Pydantic** | Data validation |
| **Uvicorn** | ASGI server |

---

## 📁 Project Structure

```
Spotify/
├── DESIGN.md                  # UI/UX design specifications
├── README.md
├── backend/
│   ├── server.py              # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend environment variables
└── frontend/
    ├── public/
    │   ├── favicon.svg        # Spotify SVG favicon
    │   └── index.html
    ├── src/
    │   ├── App.js             # All components (Sidebar, TopBar, Player, Pages…)
    │   ├── App.css            # Component styles
    │   ├── index.css          # Global styles & font imports
    │   └── index.js           # React entry point
    ├── tailwind.config.js     # Spotify design tokens
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 14
- Python ≥ 3.8
- MongoDB ≥ 4.4
- yarn or npm

### Frontend Setup

```bash
cd frontend
yarn install
yarn start
```
App runs at **http://localhost:3000**

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py
```
API runs at **http://localhost:8000**

---

## ⚙️ Environment Variables

**`frontend/.env`**
```env
REACT_APP_API_URL=http://localhost:8000
```

**`backend/.env`**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=spotify_clone
CORS_ORIGINS=http://localhost:3000
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:8000/api`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/songs` | List all songs |
| GET | `/playlists` | List all playlists |
| POST | `/status` | Create status record |
| GET | `/status` | Get status records |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch — `git checkout -b feature/amazing-feature`
3. Commit your changes — `git commit -m 'Add amazing feature'`
4. Push to the branch — `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  Built with  ❤️  By Pratik Harkare
</div>
