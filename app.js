// app.js - Cinematic Scroll-Scrubbing Satellite Telemetry Website

// 1. CONFIGURATION & STATE
const TOTAL_FRAMES = 40;
const IMAGES_DIR = 'satellite';
const IMAGE_PREFIX = 'ezgif-frame-';
const IMAGE_EXT = 'jpg';

const images = [];
let loadedCount = 0;
let isLoaded = false;

// Scroll & Animation State
let targetFrameIndex = 0;
let currentFrameIndex = 0;
let lastRenderedFrame = -1;
let currentProgress = 0;
let isFirstDraw = true;

// DOM Elements
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar');
const preloaderPercent = document.getElementById('preloader-percentage');
const preloaderStatus = document.getElementById('preloader-status');
const canvas = document.getElementById('satellite-canvas');
const ctx = canvas.getContext('2d');
const introSection = document.getElementById('intro-section');
const specsSection = document.getElementById('specs-section');
const telemetryUplink = document.getElementById('telemetry-uplink');

// Telemetry status logs for the loader
const LOADER_LOGS = [
  { limit: 0.15, text: 'INITIALIZING TELEMETRY LINK...' },
  { limit: 0.35, text: 'CALIBRATING ORBITAL SECTOR SENSORS...' },
  { limit: 0.55, text: 'PRE-CACHING ORBITAL FRAME ARRAY...' },
  { limit: 0.75, text: 'ESTABLISHING QUANTUM DEEP-SPACE UPLINK...' },
  { limit: 0.90, text: 'DE-COMPRESSING Topographical LAYERS...' },
  { limit: 1.00, text: 'ORBITAL CORRELATION COMPLETE.' }
];

// Helper to format frame filename (e.g. satellite/ezgif-frame-001.jpg)
function getFramePath(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `${IMAGES_DIR}/${IMAGE_PREFIX}${paddedIndex}.${IMAGE_EXT}`;
}

// 2. PRELOAD ALL IMAGES
function startPreloading() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    img.onload = () => handleImageLoad(i);
    img.onerror = () => {
      console.error(`Failed to load image frame at path: ${img.src}`);
      // Continue loading to not freeze the app
      handleImageLoad(i);
    };
    images.push(img);
  }
}

function handleImageLoad(frameNum) {
  loadedCount++;
  const progressRatio = loadedCount / TOTAL_FRAMES;
  const progressPercent = Math.floor(progressRatio * 100);

  // Update loading UI
  if (preloaderBar) preloaderBar.style.width = `${progressPercent}%`;
  if (preloaderPercent) preloaderPercent.textContent = `${progressPercent}%`;

  // Update status messages based on percentage
  const matchingLog = LOADER_LOGS.find(log => progressRatio <= log.limit);
  if (matchingLog && preloaderStatus) {
    preloaderStatus.textContent = matchingLog.text;
  }

  // Check if fully loaded
  if (loadedCount === TOTAL_FRAMES) {
    setTimeout(completeLoadingSequence, 500); // Small delay for visual completion
  }
}

function completeLoadingSequence() {
  isLoaded = true;
  
  // Fade out loader screen
  if (preloader) {
    preloader.classList.add('opacity-0', 'pointer-events-none');
  }

  // Allow page interaction and scrolling
  document.body.classList.remove('overflow-hidden');

  // Trigger first draw and kick off animation loop
  resizeCanvas();
  requestAnimationFrame(animationLoop);
}

// 3. CANVAS RENDER ENGINE (OBJECT-FIT COVER)
function drawImageToCover(img) {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imageWidth = img.naturalWidth;
  const imageHeight = img.naturalHeight;

  const canvasRatio = canvasWidth / canvasHeight;
  const imageRatio = imageWidth / imageHeight;

  let sx, sy, sWidth, sHeight;

  if (canvasRatio > imageRatio) {
    // Canvas is wider than image (height-wise cropping)
    sWidth = imageWidth;
    sHeight = imageWidth / canvasRatio;
    sx = 0;
    sy = (imageHeight - sHeight) / 2;
  } else {
    // Canvas is taller than image (width-wise cropping)
    sWidth = imageHeight * canvasRatio;
    sHeight = imageHeight;
    sx = (imageWidth - sWidth) / 2;
    sy = 0;
  }

  // Draw the cropped source image onto the full canvas
  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Force redraw on resize
  const activeFrame = Math.round(currentFrameIndex);
  if (images[activeFrame]) {
    drawImageToCover(images[activeFrame]);
  }
}

// 4. ANIMATION LOOP (LERP & SCROLL SCRUBBING)
function animationLoop() {
  // Update current scroll progress ratio
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  currentProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;

  // Map progress to target image frame
  targetFrameIndex = currentProgress * (TOTAL_FRAMES - 1);

  // Smooth Interpolation (lerp) for frames to eliminate scroll stutter
  const ease = 0.12; // Lower value is smoother/slower, 1 is instant
  currentFrameIndex += (targetFrameIndex - currentFrameIndex) * ease;

  // Snap to target if very close to prevent endless rendering
  if (Math.abs(targetFrameIndex - currentFrameIndex) < 0.01) {
    currentFrameIndex = targetFrameIndex;
  }

  const activeFrame = Math.round(currentFrameIndex);

  // Redraw canvas if frame changed or it's the first draw
  if (activeFrame !== lastRenderedFrame || isFirstDraw) {
    if (images[activeFrame]) {
      drawImageToCover(images[activeFrame]);
      lastRenderedFrame = activeFrame;
      isFirstDraw = false;
    }
  }

  // Update UI Elements based on scroll progress
  updateUIElements(currentProgress);

  // Continuously request updates
  requestAnimationFrame(animationLoop);
}

// 5. DYNAMIC UI TRANSITIONS
function updateUIElements(progress) {
  // Phase 1: Intro Section (0% to 15% scroll)
  if (introSection) {
    if (progress < 0.15) {
      const introOpacity = 1 - (progress / 0.15);
      introSection.style.opacity = introOpacity;
      introSection.style.pointerEvents = 'auto';
      // Slight scale out effect for cinematic feel
      introSection.style.transform = `scale(${1 - (progress * 0.05)})`;
    } else {
      introSection.style.opacity = '0';
      introSection.style.pointerEvents = 'none';
    }
  }

  // Phase 2: Specs Section Reveal (90% to 100% scroll)
  if (specsSection) {
    if (progress >= 0.90) {
      const relativeProgress = (progress - 0.90) / 0.10; // Normalized 0 to 1
      const specsOpacity = relativeProgress;
      const slideTranslate = (1 - relativeProgress) * 30; // 30px slide in
      
      specsSection.style.opacity = specsOpacity;
      specsSection.style.transform = `translateX(${slideTranslate}px)`;
      specsSection.style.pointerEvents = 'auto';
    } else {
      // Smooth slide-out
      specsSection.style.opacity = '0';
      specsSection.style.transform = 'translateX(30px)';
      specsSection.style.pointerEvents = 'none';
    }
  }

  // Bonus: Dynamic Telemetry reading based on scroll progress
  if (telemetryUplink && isLoaded) {
    // Simulate slight fluctuation in satellite signal
    const noise = (Math.sin(Date.now() / 400) * 0.5) + (Math.random() * 0.2);
    const signal = Math.min(100, Math.max(90, 99.4 + noise)).toFixed(1);
    telemetryUplink.textContent = `${signal}% UP`;
  }
}

// 6. EVENT LISTENERS
window.addEventListener('resize', resizeCanvas);

// Prevent scrolling on preloader screen until it loads
document.body.classList.add('overflow-hidden');

// Initialize preloader sequence
window.addEventListener('DOMContentLoaded', () => {
  startPreloading();
});
