import { useState, useEffect, useRef, useCallback } from 'react';

const useSound = () => {
  const [soundSettings, setSoundSettings] = useState(() => {
    const saved = localStorage.getItem('soundSettings');
    return saved ? JSON.parse(saved) : {
      masterVolume: 0.7,
      soundEnabled: true,
      exerciseSounds: true,
      notificationSounds: true,
      backgroundSounds: false,
      feedbackSounds: true,
      meditationSounds: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00'
      }
    };
  });

  const audioContextRef = useRef(null);
  const audioBuffersRef = useRef({});
  const activeSourcesRef = useRef([]);

  // Initialize Web Audio Context
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create audio buffers for different sound types
        await loadSoundBuffers();
      } catch (error) {
        console.warn('Web Audio not supported, falling back to HTML5 Audio');
      }
    };

    initAudioContext();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generate audio buffers programmatically (no external files needed)
  const loadSoundBuffers = async () => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const sounds = {
      // Exercise sounds
      'timer-start': createBeepSound(audioContext, 800, 0.2, 'sine'),
      'timer-stop': createBeepSound(audioContext, 400, 0.3, 'sine'),
      'timer-interval': createChimeSound(audioContext, [523, 659, 784], 0.5),
      'exercise-complete': createSuccessSound(audioContext),
      'rest-alert': createGentleChime(audioContext, 440, 0.4),
      
      // Notification sounds
      'medication-reminder': createMelodySound(audioContext, [523, 659, 523], 0.3),
      'pain-checkin': createSoftChime(audioContext, 330, 0.3),
      'appointment-alert': createProfessionalTone(audioContext),
      
      // Feedback sounds
      'button-click': createClickSound(audioContext),
      'success': createSuccessChime(audioContext),
      'error': createErrorTone(audioContext),
      'achievement': createAchievementSound(audioContext),
      
      // Meditation sounds
      'breathing-in': createBreathingCue(audioContext, 'in'),
      'breathing-out': createBreathingCue(audioContext, 'out'),
      'meditation-bell': createSingingBowl(audioContext),
      'relaxation-chime': createRelaxationChime(audioContext),
      
      // Background/ambient sounds (generated)
      'rain': createRainSound(audioContext),
      'ocean': createOceanSound(audioContext),
      'white-noise': createWhiteNoise(audioContext),
      'brown-noise': createBrownNoise(audioContext)
    };

    audioBuffersRef.current = sounds;
  };

  // Sound generation functions
  const createBeepSound = (audioContext, frequency, duration, waveType = 'sine') => {
    const sampleRate = audioContext.sampleRate;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample;
      
      switch (waveType) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'triangle':
          sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
          break;
        default:
          sample = Math.sin(2 * Math.PI * frequency * t);
      }
      
      // Apply envelope (fade in/out)
      const envelope = Math.min(1, Math.min(i / (sampleRate * 0.01), (numSamples - i) / (sampleRate * 0.05)));
      data[i] = sample * envelope * 0.3;
    }

    return buffer;
  };

  const createChimeSound = (audioContext, frequencies, duration) => {
    const sampleRate = audioContext.sampleRate;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      frequencies.forEach((freq, index) => {
        const delay = index * 0.1;
        if (t > delay) {
          sample += Math.sin(2 * Math.PI * freq * (t - delay)) * Math.exp(-(t - delay) * 3);
        }
      });
      
      const envelope = Math.exp(-t * 2);
      data[i] = sample * envelope * 0.2;
    }

    return buffer;
  };

  const createSuccessSound = (audioContext) => {
    return createChimeSound(audioContext, [523, 659, 784, 1047], 1.0);
  };

  const createGentleChime = (audioContext, frequency, duration) => {
    const sampleRate = audioContext.sampleRate;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 4);
      data[i] = sample * 0.3;
    }

    return buffer;
  };

  const createMelodySound = (audioContext, notes, noteDuration) => {
    const sampleRate = audioContext.sampleRate;
    const totalDuration = notes.length * noteDuration;
    const numSamples = Math.floor(sampleRate * totalDuration);
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    notes.forEach((frequency, noteIndex) => {
      const noteStart = Math.floor(noteIndex * noteDuration * sampleRate);
      const noteEnd = Math.floor((noteIndex + 1) * noteDuration * sampleRate);
      
      for (let i = noteStart; i < noteEnd && i < numSamples; i++) {
        const t = (i - noteStart) / sampleRate;
        const sample = Math.sin(2 * Math.PI * frequency * t);
        const envelope = Math.min(1, Math.min(t / 0.05, (noteDuration - t) / 0.1));
        data[i] += sample * envelope * 0.3;
      }
    });

    return buffer;
  };

  const createSoftChime = (audioContext, frequency, duration) => {
    return createGentleChime(audioContext, frequency, duration);
  };

  const createProfessionalTone = (audioContext) => {
    return createMelodySound(audioContext, [440, 554, 659], 0.4);
  };

  const createClickSound = (audioContext) => {
    return createBeepSound(audioContext, 1000, 0.05, 'square');
  };

  const createSuccessChime = (audioContext) => {
    return createChimeSound(audioContext, [659, 784, 988], 0.8);
  };

  const createErrorTone = (audioContext) => {
    return createBeepSound(audioContext, 200, 0.3, 'square');
  };

  const createAchievementSound = (audioContext) => {
    return createChimeSound(audioContext, [523, 659, 784, 1047, 1319], 1.5);
  };

  const createBreathingCue = (audioContext, type) => {
    const frequency = type === 'in' ? 440 : 330;
    const duration = type === 'in' ? 4 : 6;
    return createGentleChime(audioContext, frequency, duration);
  };

  const createSingingBowl = (audioContext) => {
    const sampleRate = audioContext.sampleRate;
    const duration = 3;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const fundamental = 256;
      let sample = 0;
      
      // Add harmonics for singing bowl effect
      sample += Math.sin(2 * Math.PI * fundamental * t) * 0.5;
      sample += Math.sin(2 * Math.PI * fundamental * 1.5 * t) * 0.3;
      sample += Math.sin(2 * Math.PI * fundamental * 2.2 * t) * 0.2;
      sample += Math.sin(2 * Math.PI * fundamental * 3.1 * t) * 0.1;
      
      const envelope = Math.exp(-t * 0.8);
      data[i] = sample * envelope * 0.4;
    }

    return buffer;
  };

  const createRelaxationChime = (audioContext) => {
    return createChimeSound(audioContext, [256, 384, 512], 2.0);
  };

  const createRainSound = (audioContext) => {
    const sampleRate = audioContext.sampleRate;
    const duration = 10; // 10 second loop
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      // Create rain-like noise with filtering
      let sample = (Math.random() - 0.5) * 2;
      
      // Apply low-pass filtering for rain sound
      if (i > 0) {
        sample = data[i - 1] * 0.7 + sample * 0.3;
      }
      
      data[i] = sample * 0.1;
    }

    return buffer;
  };

  const createOceanSound = (audioContext) => {
    const sampleRate = audioContext.sampleRate;
    const duration = 15; // 15 second loop
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      
      // Create ocean wave sound
      let sample = 0;
      sample += Math.sin(2 * Math.PI * 0.1 * t) * 0.5; // Main wave
      sample += Math.sin(2 * Math.PI * 0.05 * t) * 0.3; // Longer wave
      sample += (Math.random() - 0.5) * 0.2; // White noise for foam
      
      // Apply envelope for wave effect
      const waveEnvelope = Math.sin(2 * Math.PI * 0.15 * t) * 0.5 + 0.5;
      data[i] = sample * waveEnvelope * 0.3;
    }

    return buffer;
  };

  const createWhiteNoise = (audioContext) => {
    const sampleRate = audioContext.sampleRate;
    const duration = 5; // 5 second loop
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      data[i] = (Math.random() - 0.5) * 0.2;
    }

    return buffer;
  };

  const createBrownNoise = (audioContext) => {
    const sampleRate = audioContext.sampleRate;
    const duration = 5; // 5 second loop
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < numSamples; i++) {
      const white = Math.random() - 0.5;
      const brown = (lastOut + (0.02 * white)) / 1.02;
      lastOut = brown;
      data[i] = brown * 0.3;
    }

    return buffer;
  };

  // Check if in quiet hours
  const isInQuietHours = () => {
    if (!soundSettings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = soundSettings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = soundSettings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Crosses midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  // Play sound function
  const playSound = useCallback((soundName, options = {}) => {
    if (!soundSettings.soundEnabled || isInQuietHours()) return;

    const {
      volume = 1,
      loop = false,
      category = 'feedback',
      onEnded = null
    } = options;

    // Check category-specific settings
    const categoryEnabled = {
      exercise: soundSettings.exerciseSounds,
      notification: soundSettings.notificationSounds,
      background: soundSettings.backgroundSounds,
      feedback: soundSettings.feedbackSounds,
      meditation: soundSettings.meditationSounds
    };

    if (!categoryEnabled[category]) return;

    const audioContext = audioContextRef.current;
    const buffer = audioBuffersRef.current[soundName];

    if (!audioContext || !buffer) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = buffer;
      source.loop = loop;
      
      // Set volume
      const finalVolume = soundSettings.masterVolume * volume;
      gainNode.gain.setValueAtTime(finalVolume, audioContext.currentTime);
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Handle ended event
      if (onEnded) {
        source.onended = onEnded;
      }
      
      // Start playing
      source.start();
      
      // Keep track of active sources
      activeSourcesRef.current.push(source);
      
      // Clean up finished sources
      source.onended = () => {
        const index = activeSourcesRef.current.indexOf(source);
        if (index > -1) {
          activeSourcesRef.current.splice(index, 1);
        }
        if (onEnded) onEnded();
      };

      return source; // Return source for manual control if needed
      
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [soundSettings]);

  // Stop all sounds
  const stopAllSounds = useCallback(() => {
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (error) {
        // Source might already be stopped
      }
    });
    activeSourcesRef.current = [];
  }, []);

  // Update sound settings
  const updateSoundSettings = useCallback((newSettings) => {
    const updated = { ...soundSettings, ...newSettings };
    setSoundSettings(updated);
    localStorage.setItem('soundSettings', JSON.stringify(updated));
  }, [soundSettings]);

  // Preset sound functions for common use cases
  const soundPresets = {
    // Exercise sounds
    startExercise: () => playSound('timer-start', { category: 'exercise' }),
    stopExercise: () => playSound('timer-stop', { category: 'exercise' }),
    exerciseInterval: () => playSound('timer-interval', { category: 'exercise' }),
    exerciseComplete: () => playSound('exercise-complete', { category: 'exercise' }),
    restTime: () => playSound('rest-alert', { category: 'exercise' }),
    
    // Notification sounds
    medicationReminder: () => playSound('medication-reminder', { category: 'notification' }),
    painCheckin: () => playSound('pain-checkin', { category: 'notification' }),
    appointmentAlert: () => playSound('appointment-alert', { category: 'notification' }),
    
    // Feedback sounds
    buttonClick: () => playSound('button-click', { category: 'feedback', volume: 0.5 }),
    success: () => playSound('success', { category: 'feedback' }),
    error: () => playSound('error', { category: 'feedback' }),
    achievement: () => playSound('achievement', { category: 'feedback' }),
    
    // Meditation sounds
    breathingIn: () => playSound('breathing-in', { category: 'meditation' }),
    breathingOut: () => playSound('breathing-out', { category: 'meditation' }),
    meditationBell: () => playSound('meditation-bell', { category: 'meditation' }),
    relaxationChime: () => playSound('relaxation-chime', { category: 'meditation' }),
    
    // Background sounds (looping)
    startRain: () => playSound('rain', { category: 'background', loop: true, volume: 0.3 }),
    startOcean: () => playSound('ocean', { category: 'background', loop: true, volume: 0.3 }),
    startWhiteNoise: () => playSound('white-noise', { category: 'background', loop: true, volume: 0.2 }),
    startBrownNoise: () => playSound('brown-noise', { category: 'background', loop: true, volume: 0.2 })
  };

  return {
    soundSettings,
    updateSoundSettings,
    playSound,
    stopAllSounds,
    soundPresets,
    isInQuietHours
  };
};

export default useSound;