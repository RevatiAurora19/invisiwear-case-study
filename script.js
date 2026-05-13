const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const chapters = [...document.querySelectorAll("[data-chapter]")];
const progressFill = document.querySelector(".scroll-progress span");

let targetScroll = window.scrollY;
let currentScroll = window.scrollY;
let isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateScrollTargets() {
  targetScroll = window.scrollY;
}

function setChapterProgress(scrollY) {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const globalProgress = maxScroll > 0 ? scrollY / maxScroll : 0;
  document.documentElement.style.setProperty("--global-progress", globalProgress.toFixed(4));
  if (progressFill) progressFill.style.height = `${globalProgress * 100}%`;

  chapters.forEach((chapter) => {
    const start = chapter.offsetTop;
    const range = chapter.offsetHeight - window.innerHeight;
    const progress = range > 0 ? clamp((scrollY - start) / range) : 0;
    chapter.style.setProperty("--chapter-progress", progress.toFixed(4));
  });
}

function smoothLoop() {
  if (isReduced) {
    setChapterProgress(window.scrollY);
    requestAnimationFrame(smoothLoop);
    return;
  }

  currentScroll += (targetScroll - currentScroll) * 0.12;
  if (Math.abs(targetScroll - currentScroll) < 0.08) currentScroll = targetScroll;
  setChapterProgress(currentScroll);
  requestAnimationFrame(smoothLoop);
}

window.addEventListener("scroll", updateScrollTargets, { passive: true });
window.addEventListener("resize", () => {
  targetScroll = window.scrollY;
  currentScroll = window.scrollY;
  resizeDust();
  makeDust();
  setChapterProgress(currentScroll);
});

const canvas = document.getElementById("dust");
const ctx = canvas.getContext("2d");
let particles = [];
let width = 0;
let height = 0;

function resizeDust() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function makeDust() {
  const amount = width < 760 ? 70 : 130;
  particles = Array.from({ length: amount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.8 + 0.35,
    a: Math.random() * 0.42 + 0.12,
    drift: Math.random() * 0.45 + 0.12,
    phase: Math.random() * Math.PI * 2
  }));
}

function drawDust(time = 0) {
  ctx.clearRect(0, 0, width, height);
  const scrollInfluence = window.scrollY * 0.018;

  particles.forEach((p) => {
    const x = (p.x + Math.sin(time * 0.0005 + p.phase) * 18 + scrollInfluence * p.drift) % width;
    const y = (p.y + Math.cos(time * 0.0004 + p.phase) * 10 + scrollInfluence * 0.2) % height;
    ctx.beginPath();
    ctx.fillStyle = `rgba(236, 208, 156, ${p.a})`;
    ctx.shadowColor = "rgba(216, 168, 75, 0.55)";
    ctx.shadowBlur = 8;
    ctx.arc(x < 0 ? x + width : x, y < 0 ? y + height : y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawDust);
}

document.querySelectorAll(".palette span").forEach((swatch, index) => {
  swatch.style.setProperty("--i", index + 1);
});

resizeDust();
makeDust();
setChapterProgress(currentScroll);
requestAnimationFrame(smoothLoop);
requestAnimationFrame(drawDust);
