const BACKGROUND_MUSIC_SRC = "./src/716982__kickhat__gameplay-match-3.wav";

let audioContext = null;
let backgroundMusic = null;

export function playTone(soundEnabled, frequency, duration) {
  if (!soundEnabled) {
    return;
  }

  try {
    audioContext = audioContext ?? new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.035;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    // Audio is optional for the MVP and can be blocked by browser settings.
  }
}

export function ensureBackgroundMusic(soundEnabled) {
  if (!soundEnabled) {
    return;
  }

  try {
    backgroundMusic = backgroundMusic ?? createBackgroundMusic();
    if (backgroundMusic.paused) {
      const playPromise = backgroundMusic.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Background music will be retried on the next user interaction.
        });
      }
    }
  } catch {
    // Background music is optional and may be blocked until a user gesture.
  }
}

export function updateBackgroundMusic(soundEnabled) {
  if (soundEnabled) {
    ensureBackgroundMusic(soundEnabled);
    return;
  }

  if (backgroundMusic) {
    backgroundMusic.pause();
  }
}

function createBackgroundMusic() {
  const music = new Audio(BACKGROUND_MUSIC_SRC);
  music.loop = true;
  music.volume = 0.24;
  return music;
}
