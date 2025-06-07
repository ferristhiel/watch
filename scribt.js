let mode = 'clock';
let stopwatchInterval;
let elapsed = 0;

const clockDisplay = document.getElementById('clockDisplay');
const title = document.getElementById('title');
const stopwatchControls = document.getElementById('stopwatchControls');

function updateClock() {
  if (mode !== 'clock') return;
  const now = new Date();
  const timeStr = now.toLocaleTimeString();
  clockDisplay.textContent = timeStr;
  requestAnimationFrame(updateClock);
}

function switchMode() {
  if (mode === 'clock') {
    mode = 'stopwatch';
    title.textContent = 'Stoppuhr';
    stopwatchControls.style.display = 'block';
    clockDisplay.textContent = '00:00:00';
  } else {
    mode = 'clock';
    title.textContent = 'Uhr';
    stopwatchControls.style.display = 'none';
    stopStopwatch();
    elapsed = 0;
    updateClock();
  }
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function startStopwatch() {
  const start = Date.now() - elapsed;
  stopwatchInterval = setInterval(() => {
    elapsed = Date.now() - start;
    clockDisplay.textContent = formatTime(elapsed);
  }, 100);
}

function stopStopwatch() {
  clearInterval(stopwatchInterval);
}

function resetStopwatch() {
  stopStopwatch();
  elapsed = 0;
  clockDisplay.textContent = '00:00:00';
}

// Theme toggle
document.getElementById('toggleTheme').addEventListener('change', (e) => {
  document.body.classList.toggle('light', e.target.checked);
});

updateClock();