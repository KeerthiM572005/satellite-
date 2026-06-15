# Project Orbit: Sentinel V-1 Telemetry Interface

A high-performance, single-page scrolling interactive website designed to showcase a futuristic earth-observation and telecommunications satellite in a "Deep Space Cinematic" visual aesthetic.

## 🌌 Core Features

1. **High-Performance Scroll Scrubbing**: Uses an HTML5 `<canvas>` element fixed to the viewport to scrub forward/backward through a sequence of 40 preloaded animation frames.
2. **Smooth Linear Interpolation (Lerping)**: Integrates frame interpolation inside a `requestAnimationFrame` loop, guaranteeing stutter-free, buttery-smooth transition feedback when scrolling at any speed.
3. **Optimized Image Preloader**: Features a cinematic radial-glow loading screen with simulated log diagnostics while sequentially caching all JPG frame assets to eliminate lagging or flickering during scroll interactions.
4. **Cover Scale Calculations**: Handles dynamic scaling and cropping (reproducing CSS `object-fit: cover` logic in JavaScript) to ensure the background animation fills the viewport on any window resize.
5. **Glassmorphic Telemetry Card**: At the final 10% of scroll depth, the satellite stabilizes and reveals a sleek, semi-transparent telemetry dashboard containing:
   - Live simulated signal tracking (auto-fluctuating bandwidth percentage).
   - An active rotating radar sweep widget.
   - Dynamic slide-and-fade styling utilizing Tailwind CSS and CSS border accents.

---

## 🛠️ Tech Stack

- **Core**: HTML5, Vanilla JavaScript (ES6)
- **Styling**: Tailwind CSS (v3 Play CDN) & Vanilla CSS
- **Typography**: Google Fonts (*Orbitron*, *Inter*)

---

## 📂 Project Structure

```text
├── satellite/             # Directory containing sequence JPG frames
│   ├── ezgif-frame-001.jpg
│   └── ... (up to 040.jpg)
├── index.html             # Structuring UI sections and loading screen
├── styles.css             # Custom keyframes, space grids, and glassmorphism styling
├── app.js                 # Image preloader, lerp-engine, and trigger hooks
└── README.md              # Repository overview
```

---

## 🚀 Running Locally

To run the application, open the project directory inside any local development server to ensure assets are resolved correctly:

### Option A: Using Python (Built-in)
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000`.

### Option B: Using Node.js (serve)
```bash
npx serve
```
Then navigate to the URL printed in your console.
