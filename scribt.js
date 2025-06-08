let timezone = localStorage.getItem('timezone') || 'Europe/Berlin';
let mode = 'clock'; // 'clock' oder 'stopwatch'
let stopwatchInterval;
let stopwatchTime = 0; // Sekunden
let stopwatchMs = 0;   // Millisekunden (0-59)
let lapTime = 0;      // Sekunden für aktuelle Runde
let lapMs = 0;        // Millisekunden für aktuelle Runde

let countdownInterval;
let countdownSeconds = 300; // Standard: 5 Minuten
let countdownRunning = false;

function updateClock() {
  if (mode !== 'clock') return;
  const now = new Date();
  try {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: timezone };
    document.getElementById('clockDisplay').textContent = now.toLocaleTimeString('de-DE', options);
  } catch {
    document.getElementById('clockDisplay').textContent = now.toLocaleTimeString();
  }
}
setInterval(updateClock, 1000);
updateClock();

function switchMode() {
  if (mode === 'clock') {
    mode = 'stopwatch';
    document.getElementById('clockSection').style.display = 'none';
    document.getElementById('stopwatchBox').style.display = 'flex';
    document.getElementById('countdownBox').style.display = 'none';
  } else {
    mode = 'clock';
    document.getElementById('clockSection').style.display = '';
    document.getElementById('stopwatchBox').style.display = 'none';
    document.getElementById('countdownBox').style.display = 'none';
  }
}

// Stoppuhr-Funktionen
function startStopwatch() {
  if (stopwatchInterval) return;
  stopwatchInterval = setInterval(() => {
    // Gesamtzeit
    stopwatchMs++;
    if (stopwatchMs >= 60) {
      stopwatchMs = 0;
      stopwatchTime++;
    }
    // Rundenzeit
    lapMs++;
    if (lapMs >= 60) {
      lapMs = 0;
      lapTime++;
    }
    updateStopwatchDisplay();
    updateLapDisplay();
  }, 1000 / 60); // ca. 16,67ms
}
function stopStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchInterval = null;
}
function resetStopwatch() {
  stopwatchTime = 0;
  stopwatchMs = 0;
  lapTime = 0;
  lapMs = 0;
  updateStopwatchDisplay();
  updateLapDisplay();
  document.getElementById('lapsList').innerHTML = ''; // Rundenliste leeren
}
function updateStopwatchDisplay() {
  if (stopwatchTime < 60) {
    // Nur Sekunden.Millisekunden anzeigen
    document.getElementById('stopwatchDisplay').textContent =
      `${stopwatchTime}.${stopwatchMs.toString().padStart(2, '0')}`;
  } else if (stopwatchTime < 3600) {
    // Minuten:Sekunden.Millisekunden anzeigen
    const minutes = String(Math.floor(stopwatchTime / 60));
    const seconds = String(stopwatchTime % 60).padStart(2, '0');
    document.getElementById('stopwatchDisplay').textContent =
      `${minutes}:${seconds}.${stopwatchMs.toString().padStart(2, '0')}`;
  } else {
    // Stunden:Minuten:Sekunden.Millisekunden anzeigen
    const hours = String(Math.floor(stopwatchTime / 3600));
    const minutes = String(Math.floor((stopwatchTime % 3600) / 60)).padStart(2, '0');
    const seconds = String(stopwatchTime % 60).padStart(2, '0');
    document.getElementById('stopwatchDisplay').textContent =
      `${hours}:${minutes}:${seconds}.${stopwatchMs.toString().padStart(2, '0')}`;
  }
}

function updateLapDisplay() {
  let text = '';
  if (lapTime < 60) {
    text = `${lapTime}.${lapMs.toString().padStart(2, '0')}`;
  } else if (lapTime < 3600) {
    const minutes = String(Math.floor(lapTime / 60));
    const seconds = String(lapTime % 60).padStart(2, '0');
    text = `${minutes}:${seconds}.${lapMs.toString().padStart(2, '0')}`;
  } else {
    const hours = String(Math.floor(lapTime / 3600));
    const minutes = String(Math.floor((lapTime % 3600) / 60)).padStart(2, '0');
    const seconds = String(lapTime % 60).padStart(2, '0');
    text = `${hours}:${minutes}:${seconds}.${lapMs.toString().padStart(2, '0')}`;
  }
  document.getElementById('lapTimeDisplay').textContent = text;
}

// Einstellungen
document.getElementById('settingsBtn').onclick = () => {
  document.getElementById('settingsModal').classList.add('active');
  document.getElementById('timezone').value = timezone;
};
document.getElementById('closeSettings').onclick = () => {
  document.getElementById('settingsModal').classList.remove('active');
};
document.getElementById('timezone').onchange = (e) => {
  timezone = e.target.value;
  localStorage.setItem('timezone', timezone);
  updateClock();
};

// Initialisiere Stoppuhr-Anzeige
if (!document.getElementById('stopwatchDisplay')) {
  const sw = document.createElement('div');
  sw.id = 'stopwatchDisplay';
  sw.textContent = '00:00:00';
  document.getElementById('stopwatchControls').prepend(sw);
}
document.getElementById('stopwatchControls').style.display = 'none';

// Initialisiere Rundenzeit-Anzeige
if (!document.getElementById('lapTimeDisplay')) {
  const lapDiv = document.createElement('div');
  lapDiv.id = 'lapTimeDisplay';
  lapDiv.style.fontSize = '1.2em';
  lapDiv.style.marginBottom = '8px';
  lapDiv.style.color = '#3a8dde';
  lapDiv.textContent = '00:00:00';
  document.getElementById('stopwatchControls').prepend(lapDiv);
}

function addLap() {
  const lapsList = document.getElementById('lapsList');
  const current = document.getElementById('stopwatchDisplay').textContent;
  const lapCurrent = document.getElementById('lapTimeDisplay').textContent;

  // Neue Runde hinzufügen (Gesamtzeit + Rundenzeit)
  const li = document.createElement('li');
  li.textContent = `Runde: ${lapCurrent} (Gesamt: ${current})`;
  lapsList.appendChild(li);

  // Rundenzeit zurücksetzen
  lapTime = 0;
  lapMs = 0;
  updateLapDisplay();

  // Alle Zeiten als Array (in Sekunden)
  const laps = Array.from(lapsList.children).map(item => {
    // Extrahiere nur die Rundenzeit (vor dem Klammer-Block)
    const lapText = item.textContent.split(' (')[0].replace('Runde: ', '');
    const parts = lapText.split(':').reverse();
    let ms = 0, s = 0, m = 0, h = 0;
    if (parts[0].includes('.')) {
      const [sec, msStr] = parts[0].split('.');
      s = parseInt(sec, 10);
      ms = parseInt(msStr, 10);
    } else {
      s = parseInt(parts[0], 10);
    }
    if (parts[1]) m = parseInt(parts[1], 10);
    if (parts[2]) h = parseInt(parts[2], 10);
    return h * 3600 + m * 60 + s + ms / 60;
  });

  // Schnellste und langsamste Zeit finden (jeweils nur das erste Vorkommen markieren)
  const min = Math.min(...laps);
  const max = Math.max(...laps);

  let minIdx = laps.indexOf(min);
  let maxIdx = laps.indexOf(max);

  // Alle Farben zurücksetzen
  lapsList.childNodes.forEach(li => {
    li.style.color = '';
    li.style.fontWeight = '';
    li.style.background = '';
  });

  // Nur die jeweils erste schnellste und langsamste Runde markieren
  if (minIdx !== -1) {
    let li = lapsList.childNodes[minIdx];
    li.style.color = 'white';
    li.style.background = 'green';
    li.style.fontWeight = 'bold';
  }
  if (maxIdx !== -1) {
    let li = lapsList.childNodes[maxIdx];
    li.style.color = 'white';
    li.style.background = 'red';
    li.style.fontWeight = 'bold';
  }
}

// Countdown-Funktionen
function updateCountdownDisplay() {
  let h = Math.floor(countdownSeconds / 3600);
  let m = Math.floor((countdownSeconds % 3600) / 60);
  let s = countdownSeconds % 60;
  document.getElementById('cdHours').value = h;
  document.getElementById('cdMinutes').value = m;
  document.getElementById('cdSeconds').value = s;
}

function startCountdown() {
  if (countdownRunning || countdownSeconds <= 0) return;
  countdownRunning = true;
  countdownInterval = setInterval(() => {
    if (countdownSeconds > 0) {
      countdownSeconds--;
      updateCountdownDisplay();
    } else {
      stopCountdown();
    }
  }, 1000);
}

function stopCountdown() {
  clearInterval(countdownInterval);
  countdownRunning = false;
}

function resetCountdown() {
  stopCountdown();
  countdownSeconds = getCountdownSecondsFromSelects();
  updateCountdownDisplay();
}

// Animation: Stoppuhr nach links raus, Countdown von rechts rein
document.getElementById('showCountdownBtn').onclick = function() {
  const stopwatchBox = document.getElementById('stopwatchBox');
  const countdownBox = document.getElementById('countdownBox');
  
  // Stoppuhr ausblenden, Countdown einblenden
  stopwatchBox.style.display = 'none';
  countdownBox.style.display = 'block';
};

// Animation: Countdown nach rechts raus, Stoppuhr von links rein
document.getElementById('backToStopwatchBtn').onclick = function() {
  const stopwatchBox = document.getElementById('stopwatchBox');
  const countdownBox = document.getElementById('countdownBox');
  // Countdown raus, Stoppuhr rein
  countdownBox.classList.remove('slide-in-right');
  countdownBox.classList.add('slide-in-from-right');
  stopwatchBox.style.display = 'block';
  setTimeout(() => {
    stopwatchBox.classList.remove('slide-out-left');
  }, 10);
  setTimeout(() => {
    countdownBox.style.display = 'none';
  }, 500);
};

// Dropdowns für Countdown füllen
function fillCountdownSelects() {
  const hours = document.getElementById('cdHours');
  const minutes = document.getElementById('cdMinutes');
  const seconds = document.getElementById('cdSeconds');
  hours.innerHTML = '';
  minutes.innerHTML = '';
  seconds.innerHTML = '';
  for (let i = 0; i <= 23; i++) {
    hours.innerHTML += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
  }
  for (let i = 0; i <= 59; i++) {
    minutes.innerHTML += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
    seconds.innerHTML += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
  }
  // Standard: 0:05:00
  hours.value = 0;
  minutes.value = 5;
  seconds.value = 0;
}
fillCountdownSelects();

// Countdown-Start/Reset anpassen:
function getCountdownSecondsFromSelects() {
  const h = parseInt(document.getElementById('cdHours').value, 10) || 0;
  const m = parseInt(document.getElementById('cdMinutes').value, 10) || 0;
  const s = parseInt(document.getElementById('cdSeconds').value, 10) || 0;
  return h * 3600 + m * 60 + s;
}

function resetCountdown() {
  stopCountdown();
  countdownSeconds = getCountdownSecondsFromSelects();
  updateCountdownDisplay();
}

// Optional: Wenn sich die Auswahl ändert, sofort anzeigen
['cdHours', 'cdMinutes', 'cdSeconds'].forEach(id => {
  document.getElementById(id).addEventListener('change', resetCountdown);
}); // Fehlende Klammer hinzugefügt
// Countdown initialisieren
resetCountdown();

// Theme-Switch-Funktion
document.getElementById('toggleTheme').addEventListener('change', (e) => {
  if (e.target.checked) {
    document.body.classList.add('light');
  } else {
    document.body.classList.remove('light');
  }
});