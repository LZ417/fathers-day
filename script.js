"use strict";

const memoryPhotoFiles = [
  "photo-02.JPG",
  "photo-03.JPG",
  "photo-04.JPG",
  "photo-05.JPG",
  "photo-06.JPG",
  "photo-07.JPG",
  "photo-08.JPG",
  "photo-09.JPG",
  "photo-10.JPG",
  "photo-11.JPG",
  "photo-12.JPG",
  "photo-13.JPG",
  "photo-14.JPG",
  "photo-15.JPG",
  "photo-16.JPG",
  "photo-17.JPG",
  "photo-18.JPG",
  "photo-19.JPG",
  "photo-20.JPG"
];

const motionSequence = [
  "zoom-in",
  "pan-left",
  "zoom-out",
  "pan-right",
  "sharpen",
  "pan-up",
  "pan-down"
];

const memories = memoryPhotoFiles.map((fileName, index) => ({
  src: `./images/${fileName}`,
  caption: `家庭照片 ${index + 1}`,
  motion: motionSequence[index % motionSequence.length]
}));

const slideDuration = 3800;
const transitionDuration = 900;

const hero = document.querySelector("#hero");
const startButton = document.querySelector("#startButton");
const backHomeButton = document.querySelector("#backHomeButton");
const memorySection = document.querySelector("#memorySection");
const memoryPlayer = document.querySelector("#memoryPlayer");
const slidesRoot = document.querySelector("#slides");
const playStatus = document.querySelector("#playStatus");
const progressBar = document.querySelector("#progressBar");
const transitionFlash = document.querySelector("#transitionFlash");
const sceneTransition = document.querySelector("#sceneTransition");
const replayButton = document.querySelector("#replayButton");
const showGalleryButton = document.querySelector("#showGalleryButton");
const gallerySection = document.querySelector("#gallerySection");
const photoGrid = document.querySelector("#photoGrid");
const preview = document.querySelector("#preview");
const previewImage = document.querySelector("#previewImage");
const previewCounter = document.querySelector("#previewCounter");
const previewClose = document.querySelector("#previewClose");
const previewPrev = document.querySelector("#previewPrev");
const previewNext = document.querySelector("#previewNext");
const particleCanvas = document.querySelector("#particleCanvas");

let currentIndex = 0;
let previousIndex = -1;
let slideStart = 0;
let pausedAt = 0;
let rafId = 0;
let pageScrollRafId = 0;
let isPlaying = false;
let isPaused = false;
let isReturningHome = false;
let previewIndex = 0;
let touchStartX = 0;
let lastBackTouchTime = 0;
let returnTimerIds = [];

function createSlides() {
  const fragment = document.createDocumentFragment();

  memories.forEach((memory, index) => {
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.dataset.index = String(index);
    slide.style.setProperty("--slide-duration", `${slideDuration}ms`);

    const backdrop = document.createElement("img");
    backdrop.src = memory.src;
    backdrop.alt = "";
    backdrop.className = "slide__backdrop";
    backdrop.draggable = false;
    backdrop.setAttribute("aria-hidden", "true");

    const cover = document.createElement("img");
    cover.src = memory.src;
    cover.alt = memory.caption;
    cover.className = `slide__image slide__cover motion-${memory.motion}`;
    cover.draggable = false;

    const full = document.createElement("img");
    full.src = memory.src;
    full.alt = "";
    full.className = "slide__image slide__full";
    full.draggable = false;
    full.setAttribute("aria-hidden", "true");

    slide.append(backdrop, cover, full);
    fragment.appendChild(slide);
  });

  slidesRoot.appendChild(fragment);
}

function createGallery() {
  const fragment = document.createDocumentFragment();
  previewCounter.textContent = `1 / ${memories.length}`;

  memories.forEach((memory, index) => {
    const button = document.createElement("button");
    button.className = "photo-card";
    button.type = "button";
    button.setAttribute("aria-label", `查看第 ${index + 1} 张家庭照片`);
    button.addEventListener("click", () => openPreview(index));

    const img = document.createElement("img");
    img.src = memory.src;
    img.alt = memory.caption;
    img.loading = "lazy";
    img.draggable = false;

    const mark = document.createElement("span");
    mark.className = "save-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M12 3v12"></path>
        <path d="m7 10 5 5 5-5"></path>
        <path d="M5 21h14"></path>
      </svg>
    `;

    button.append(img, mark);
    fragment.appendChild(button);
  });

  photoGrid.appendChild(fragment);
}

function startMemory() {
  if (isPlaying || isReturningHome) return;

  isPlaying = true;
  isPaused = false;
  currentIndex = 0;
  previousIndex = -1;
  hero.classList.add("is-started");
  memorySection.classList.add("is-visible");
  gallerySection.classList.remove("is-gallery-visible");
  replayButton.classList.add("is-hidden");
  showGalleryButton.classList.add("is-hidden");
  progressBar.style.width = "0%";

  window.setTimeout(() => {
    renderSlide(0);
    animatePageScrollTo(memorySection.offsetTop, 980, () => {
      slideStart = performance.now();
      playStatus.textContent = "自动播放回忆中";
      rafId = requestAnimationFrame(updateProgress);
    });
  }, 620);
}

function getScrollTop() {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function setScrollTop(value) {
  window.scrollTo(0, value);
  document.documentElement.scrollTop = value;
  document.body.scrollTop = value;
}

function easeInOutSine(value) {
  return -(Math.cos(Math.PI * value) - 1) / 2;
}

function animatePageScrollTo(targetY, duration, onComplete) {
  cancelAnimationFrame(pageScrollRafId);

  const startY = getScrollTop();
  const distance = targetY - startY;
  const startedAt = performance.now();
  document.documentElement.style.scrollBehavior = "auto";

  function tick(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const nextY = Math.round(startY + distance * easeInOutSine(progress));
    setScrollTop(nextY);

    if (progress < 1) {
      pageScrollRafId = requestAnimationFrame(tick);
      return;
    }

    pageScrollRafId = 0;
    setScrollTop(targetY);
    if (typeof onComplete === "function") onComplete();
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = "";
    });
  }

  pageScrollRafId = requestAnimationFrame(tick);
}

function jumpToHomeTop() {
  cancelAnimationFrame(pageScrollRafId);
  pageScrollRafId = 0;
  setScrollTop(0);
}

function clearReturnTimers() {
  returnTimerIds.forEach((timerId) => window.clearTimeout(timerId));
  returnTimerIds = [];
}

function scheduleReturnStep(callback, delay) {
  const timerId = window.setTimeout(() => {
    returnTimerIds = returnTimerIds.filter((id) => id !== timerId);
    callback();
  }, delay);
  returnTimerIds.push(timerId);
}

function resetMemoryPlaybackState() {
  currentIndex = 0;
  previousIndex = -1;
  slideStart = 0;
  pausedAt = 0;
  memorySection.classList.remove("is-visible");
  gallerySection.classList.remove("is-gallery-visible");
  memoryPlayer.classList.remove("is-paused");
  replayButton.classList.add("is-hidden");
  showGalleryButton.classList.add("is-hidden");
  progressBar.style.width = "0%";
  playStatus.textContent = "自动播放回忆中";
  transitionFlash.classList.remove("is-active");

  [...slidesRoot.children].forEach((slide) => {
    slide.classList.remove("is-active", "is-leaving");
  });

  jumpToHomeTop();
}

function finishReturnHome() {
  isReturningHome = false;
  memorySection.classList.remove("is-returning");
  sceneTransition.classList.remove("is-active");

  requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = "";
  });
}

function returnHome() {
  if (isReturningHome) return;

  isReturningHome = true;
  clearReturnTimers();
  cancelAnimationFrame(rafId);
  cancelAnimationFrame(pageScrollRafId);
  pageScrollRafId = 0;
  rafId = 0;
  isPlaying = false;
  isPaused = false;

  document.documentElement.style.scrollBehavior = "auto";
  sceneTransition.classList.add("is-active");
  memorySection.classList.add("is-returning");
  memoryPlayer.classList.add("is-paused");
  playStatus.textContent = "正在返回首页";

  scheduleReturnStep(() => {
    hero.classList.remove("is-started");
    resetMemoryPlaybackState();
  }, 720);

  scheduleReturnStep(finishReturnHome, 1380);
}

function renderSlide(index) {
  const slides = [...slidesRoot.children];

  slides.forEach((slide, slideIndex) => {
    slide.classList.remove("is-active");

    if (slideIndex === previousIndex) {
      slide.classList.add("is-leaving");
      window.setTimeout(() => slide.classList.remove("is-leaving"), transitionDuration);
    } else {
      slide.classList.remove("is-leaving");
    }

    if (slideIndex === index) {
      void slide.offsetWidth;
      slide.classList.add("is-active");
    }
  });

  runTransitionFlash();
}

function runTransitionFlash() {
  transitionFlash.classList.remove("is-active");
  void transitionFlash.offsetWidth;
  transitionFlash.classList.add("is-active");
}

function updateProgress(now) {
  if (!isPlaying || isPaused) return;

  const elapsed = now - slideStart;
  const slideProgress = Math.min(elapsed / slideDuration, 1);
  const totalProgress = ((currentIndex + slideProgress) / memories.length) * 100;
  progressBar.style.width = `${totalProgress}%`;

  if (elapsed >= slideDuration) {
    goToNextSlide();
    return;
  }

  rafId = requestAnimationFrame(updateProgress);
}

function goToNextSlide() {
  previousIndex = currentIndex;
  currentIndex += 1;

  if (currentIndex >= memories.length) {
    finishMemory();
    return;
  }

  renderSlide(currentIndex);
  slideStart = performance.now();
  rafId = requestAnimationFrame(updateProgress);
}

function finishMemory() {
  isPlaying = false;
  isPaused = false;
  currentIndex = memories.length - 1;
  progressBar.style.width = "100%";
  playStatus.textContent = "回忆播放完成";
  memoryPlayer.classList.remove("is-paused");
  replayButton.classList.remove("is-hidden");
  showGalleryButton.classList.remove("is-hidden");
}

function replayMemory() {
  cancelAnimationFrame(rafId);
  rafId = 0;
  isPlaying = true;
  isPaused = false;
  currentIndex = 0;
  previousIndex = -1;
  progressBar.style.width = "0%";
  gallerySection.classList.remove("is-gallery-visible");
  playStatus.textContent = "自动播放回忆中";
  replayButton.classList.add("is-hidden");
  showGalleryButton.classList.add("is-hidden");
  memoryPlayer.classList.remove("is-paused");

  [...slidesRoot.children].forEach((slide) => {
    slide.classList.remove("is-active", "is-leaving");
  });

  renderSlide(0);
  slideStart = performance.now();
  rafId = requestAnimationFrame(updateProgress);
}

function togglePlayback() {
  if (!isPlaying) return;

  if (isPaused) {
    isPaused = false;
    slideStart += performance.now() - pausedAt;
    memoryPlayer.classList.remove("is-paused");
    playStatus.textContent = "自动播放回忆中";
    rafId = requestAnimationFrame(updateProgress);
    return;
  }

  isPaused = true;
  pausedAt = performance.now();
  cancelAnimationFrame(rafId);
  memoryPlayer.classList.add("is-paused");
  playStatus.textContent = "已暂停，轻触继续";
}

function openPreview(index) {
  previewIndex = index;
  updatePreview();
  preview.classList.add("is-open");
  preview.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closePreview() {
  preview.classList.remove("is-open");
  preview.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function updatePreview() {
  const memory = memories[previewIndex];
  previewImage.src = memory.src;
  previewImage.alt = memory.caption;
  previewCounter.textContent = `${previewIndex + 1} / ${memories.length}`;
}

function showPreviousPreview() {
  previewIndex = (previewIndex - 1 + memories.length) % memories.length;
  updatePreview();
}

function showNextPreview() {
  previewIndex = (previewIndex + 1) % memories.length;
  updatePreview();
}

function initParticles() {
  const ctx = particleCanvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let animationId = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    particleCanvas.width = Math.floor(width * ratio);
    particleCanvas.height = Math.floor(height * ratio);
    particleCanvas.style.width = `${width}px`;
    particleCanvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    seedParticles();
  }

  function seedParticles() {
    particles.length = 0;
    const count = Math.min(86, Math.max(42, Math.floor((width * height) / 11500)));

    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.45,
        vx: Math.random() * 0.18 + 0.05,
        vy: Math.random() * -0.12 - 0.02,
        alpha: Math.random() * 0.48 + 0.16,
        gold: Math.random() > 0.48
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;

      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.r * 8
      );
      const color = particle.gold ? "246, 216, 139" : "112, 162, 212";
      gradient.addColorStop(0, `rgba(${color}, ${particle.alpha})`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r * 8, 0, Math.PI * 2);
      ctx.fill();
    });

    animationId = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  draw();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      draw();
    }
  });
}

startButton.addEventListener("click", startMemory);
replayButton.addEventListener("click", replayMemory);
backHomeButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (Date.now() - lastBackTouchTime < 450) return;
  returnHome();
});
backHomeButton.addEventListener(
  "touchend",
  (event) => {
    event.preventDefault();
    event.stopPropagation();
    lastBackTouchTime = Date.now();
    returnHome();
  },
  { passive: false }
);
showGalleryButton.addEventListener("click", () => {
  gallerySection.classList.add("is-gallery-visible");
  requestAnimationFrame(() => {
    gallerySection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
memoryPlayer.addEventListener("click", togglePlayback);
memoryPlayer.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    togglePlayback();
  }
});

previewClose.addEventListener("click", closePreview);
previewPrev.addEventListener("click", showPreviousPreview);
previewNext.addEventListener("click", showNextPreview);
preview.addEventListener("click", (event) => {
  if (event.target === preview) closePreview();
});
preview.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].clientX;
  },
  { passive: true }
);
preview.addEventListener(
  "touchend",
  (event) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX;

    if (Math.abs(deltaX) < 42) return;
    if (deltaX > 0) {
      showPreviousPreview();
    } else {
      showNextPreview();
    }
  },
  { passive: true }
);

document.addEventListener("keydown", (event) => {
  if (!preview.classList.contains("is-open")) return;

  if (event.key === "Escape") closePreview();
  if (event.key === "ArrowLeft") showPreviousPreview();
  if (event.key === "ArrowRight") showNextPreview();
});

createSlides();
createGallery();
initParticles();
