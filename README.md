# 夜 Yoru

**A cinematic ambient station where the UI disappears and the atmosphere takes over.**

Yoru (夜, Japanese for "night") is an immersive ambient music experience featuring anime-style visuals and layered soundscapes. Unlike typical lofi sites, Yoru treats the experience as art — the UI is invisible until needed, and scene transitions feel like moving between worlds.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **21 Cinematic Scenes** — Anime-style visuals spanning rain, ocean, fireplace, night, sci-fi, and more
- **13 Ambient Soundscapes** — Curated royalty-free audio (rain, thunder, ocean waves, fireplace, wind, coffee shop, etc.)
- **Sound-Scene Mapping** — Scenes automatically match their ambient sound, with manual override via arrow keys
- **Cinematic Splash Screen** — Wavy liquid fill animation on the "夜" character with asset preloading
- **Idle Detection** — UI fades away after 3 seconds of inactivity for full immersion
- **Crossfade Transitions** — Smooth 3-second scene transitions powered by Framer Motion
- **Keyboard Shortcuts** — Full keyboard control for power users
- **Persistent Preferences** — Volume, sound selection, and settings saved to localStorage
- **Accessibility** — Respects `prefers-reduced-motion`, ARIA labels, keyboard navigable
- **Error Boundary** — Graceful failure handling with recovery UI

## 🎹 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `M` | Mute / Unmute |
| `F` | Fullscreen |
| `←` | Previous Scene |
| `→` | Next Scene |
| `↑` | Volume Up |
| `↓` | Volume Down |
| `/` | Toggle Shortcuts |
| `R` | Reset Preferences |

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| Audio | Howler.js |
| Components | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React |
| Font | Clash Display (self-hosted) |
| Testing | Vitest, React Testing Library |
| Linting | ESLint 9, Prettier |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/RajDesai-18/yoru.git
cd yoru

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
yoru/
├── app/
│   ├── layout.tsx          # Root layout with metadata & fonts
│   ├── page.tsx            # Main page with error boundary
│   └── globals.css         # Global styles & Tailwind
├── components/
│   ├── scenes/
│   │   ├── Scene.tsx           # Individual scene (image/video)
│   │   ├── SceneContainer.tsx  # Scene orchestration & state
│   │   ├── SceneIndicator.tsx  # Grouped dot navigation
│   │   └── FXOverlay.tsx       # CSS visual effects layer
│   ├── ui/
│   │   ├── AmbientSelector.tsx # Categorized sound picker
│   │   ├── Controls.tsx        # Floating control bar
│   │   ├── KeyboardShortcuts.tsx
│   │   ├── SplashScreen.tsx    # Cinematic loading screen
│   │   └── [shadcn components]
│   └── ErrorBoundary.tsx
├── hooks/
│   ├── useAmbient.ts       # Audio state & Howler.js management
│   ├── useKeyboard.ts      # Global keyboard shortcuts
│   ├── useIdleDetection.ts # UI auto-hide timer
│   └── useFullscreen.ts    # Fullscreen API wrapper
├── lib/
│   ├── audio/
│   │   └── ambient.ts      # Sound definitions & categories
│   ├── constants/
│   │   └── index.ts        # Scene data, timing, config
│   └── utils.ts
├── __tests__/
│   └── hooks/              # Unit tests for all hooks
├── public/
│   ├── fonts/              # Clash Display woff2
│   ├── scenes/             # 21 scene images (PNG)
│   └── audio/ambient/      # 13 ambient audio files (MP3)
└── [config files]
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

Tests cover all custom hooks: `useAmbient`, `useKeyboard`, `useIdleDetection`, and `useFullscreen`.

## 📊 Lighthouse Scores

| Category | Score |
|----------|-------|
| Performance | 77 |
| Accessibility | 96 |
| Best Practices | 100 |
| SEO | 100 |

## 🎨 Visual Architecture

```
┌──────────────────────────────────────┐
│  Scene Container (100vw × 100vh)     │
│  ┌────────────────────────────────┐  │
│  │  Base Layer                    │  │
│  │  <img> or <video>             │  │
│  │  object-fit: cover            │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  FX Layer (CSS overlays)      │  │
│  │  Rain, particles, grain       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  UI Layer (Framer Motion)     │  │
│  │  Fades in/out on idle state   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## 🔊 Audio System

Yoru uses a dual-layer audio architecture:

- **Ambient Layer** — Looping environmental sounds (rain, ocean, fire, etc.) managed by the `useAmbient` hook via Howler.js
- **Sound-Scene Mapping** — Each scene is mapped to an ambient sound; changing sounds auto-navigates to matching scenes
- **Crossfade** — Smooth audio transitions when switching between sounds
- **Persistence** — Volume and sound selection survive page refreshes via localStorage

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`git commit -m "feat: add new feature"`)
4. Push to your branch (`git push origin feat/your-feature`)
5. Open a Pull Request

### Commit Convention

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring |
| `test` | Adding or updating tests |
| `style` | Formatting changes |
| `docs` | Documentation only |
| `chore` | Build process, dependencies |
| `perf` | Performance improvement |

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🎵 Credits

- **Ambient audio** — [Pixabay](https://pixabay.com/) (royalty-free)
- **Font** — [Clash Display](https://www.fontshare.com/fonts/clash-display) by Indian Type Foundry
- **UI Components** — [shadcn/ui](https://ui.shadcn.com/)
- **Icons** — [Lucide](https://lucide.dev/)

---

<p align="center">
  <strong>夜</strong> — Built with 🌙 by <a href="https://github.com/RajDesai-18">Raj Desai</a>
</p>