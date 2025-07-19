import React, { useState } from 'react';
import { 
  Volume2, VolumeX, Clock, Play, Pause, Settings, 
  Headphones, Bell, Activity, Brain, Music,
  TestTube, Check, X
} from 'lucide-react';
import useSound from '../hooks/useSound';

const SoundSettings = () => {
  const { 
    soundSettings, 
    updateSoundSettings, 
    playSound, 
    stopAllSounds,
    soundPresets,
    isInQuietHours 
  } = useSound();
  
  const [testingSound, setTestingSound] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleVolumeChange = (value) => {
    updateSoundSettings({ masterVolume: value / 100 });
  };

  const toggleSoundEnabled = () => {
    updateSoundSettings({ soundEnabled: !soundSettings.soundEnabled });
    if (!soundSettings.soundEnabled) {
      stopAllSounds();
    }
  };

  const updateCategorySetting = (category, enabled) => {
    updateSoundSettings({ [category]: enabled });
  };

  const updateQuietHours = (field, value) => {
    updateSoundSettings({
      quietHours: {
        ...soundSettings.quietHours,
        [field]: value
      }
    });
  };

  const testSound = async (soundName, preset) => {
    if (testingSound === soundName) {
      stopAllSounds();
      setTestingSound(null);
      return;
    }

    stopAllSounds();
    setTestingSound(soundName);
    
    try {
      if (preset) {
        preset();
      } else {
        playSound(soundName);
      }
      
      // Auto-stop after 3 seconds for non-looping sounds
      setTimeout(() => {
        setTestingSound(null);
      }, 3000);
    } catch (error) {
      console.error('Error testing sound:', error);
      setTestingSound(null);
    }
  };

  const soundCategories = [
    {
      key: 'exerciseSounds',
      label: 'Exercise Sounds',
      description: 'Timer alerts, workout completion, rest intervals',
      icon: Activity,
      sounds: [
        { name: 'Exercise Start', key: 'timer-start', preset: soundPresets.startExercise },
        { name: 'Exercise Complete', key: 'exercise-complete', preset: soundPresets.exerciseComplete },
        { name: 'Rest Time', key: 'rest-alert', preset: soundPresets.restTime },
        { name: 'Interval Alert', key: 'timer-interval', preset: soundPresets.exerciseInterval }
      ]
    },
    {
      key: 'notificationSounds',
      label: 'Notification Sounds',
      description: 'Medication reminders, pain check-ins, appointments',
      icon: Bell,
      sounds: [
        { name: 'Medication Reminder', key: 'medication-reminder', preset: soundPresets.medicationReminder },
        { name: 'Pain Check-in', key: 'pain-checkin', preset: soundPresets.painCheckin },
        { name: 'Appointment Alert', key: 'appointment-alert', preset: soundPresets.appointmentAlert }
      ]
    },
    {
      key: 'feedbackSounds',
      label: 'Interface Feedback',
      description: 'Button clicks, success alerts, error notifications',
      icon: Settings,
      sounds: [
        { name: 'Button Click', key: 'button-click', preset: soundPresets.buttonClick },
        { name: 'Success', key: 'success', preset: soundPresets.success },
        { name: 'Achievement', key: 'achievement', preset: soundPresets.achievement },
        { name: 'Error', key: 'error', preset: soundPresets.error }
      ]
    },
    {
      key: 'meditationSounds',
      label: 'Meditation & Relaxation',
      description: 'Breathing cues, meditation bells, relaxation chimes',
      icon: Brain,
      sounds: [
        { name: 'Breathing In', key: 'breathing-in', preset: soundPresets.breathingIn },
        { name: 'Breathing Out', key: 'breathing-out', preset: soundPresets.breathingOut },
        { name: 'Meditation Bell', key: 'meditation-bell', preset: soundPresets.meditationBell },
        { name: 'Relaxation Chime', key: 'relaxation-chime', preset: soundPresets.relaxationChime }
      ]
    },
    {
      key: 'backgroundSounds',
      label: 'Background Sounds',
      description: 'Ambient sounds for focus and relaxation',
      icon: Music,
      sounds: [
        { name: 'Rain', key: 'rain', preset: soundPresets.startRain },
        { name: 'Ocean Waves', key: 'ocean', preset: soundPresets.startOcean },
        { name: 'White Noise', key: 'white-noise', preset: soundPresets.startWhiteNoise },
        { name: 'Brown Noise', key: 'brown-noise', preset: soundPresets.startBrownNoise }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Headphones className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sound Settings</h1>
        <p className="text-gray-600">Customize your audio experience for better pain management</p>
        
        {isInQuietHours() && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-center">
            <Clock className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-purple-800 font-medium">Quiet Hours Active</span>
          </div>
        )}
      </div>

      {/* Master Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Master Controls</h2>
        
        <div className="space-y-6">
          {/* Master Volume */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-gray-700 font-medium">
                <Volume2 className="h-5 w-5 mr-2" />
                Master Volume
              </label>
              <span className="text-gray-600 font-mono">
                {Math.round(soundSettings.masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(soundSettings.masterVolume * 100)}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              disabled={!soundSettings.soundEnabled}
            />
          </div>

          {/* Enable/Disable All Sounds */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {soundSettings.soundEnabled ? (
                <Volume2 className="h-5 w-5 text-green-600 mr-3" />
              ) : (
                <VolumeX className="h-5 w-5 text-red-600 mr-3" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">Sound Effects</h3>
                <p className="text-sm text-gray-600">
                  {soundSettings.soundEnabled ? 'All sounds enabled' : 'All sounds disabled'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleSoundEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundSettings.soundEnabled ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Sound Categories */}
      <div className="space-y-6">
        {soundCategories.map((category) => {
          const IconComponent = category.icon;
          const isEnabled = soundSettings[category.key];
          
          return (
            <div key={category.key} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-4 ${
                      isEnabled ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`h-6 w-6 ${
                        isEnabled ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.label}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateCategorySetting(category.key, !isEnabled)}
                    disabled={!soundSettings.soundEnabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isEnabled && soundSettings.soundEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    } ${!soundSettings.soundEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled && soundSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Sound Test Buttons */}
              {isEnabled && soundSettings.soundEnabled && (
                <div className="p-6 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Sounds
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {category.sounds.map((sound) => (
                      <button
                        key={sound.key}
                        onClick={() => testSound(sound.key, sound.preset)}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          testingSound === sound.key
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm font-medium">{sound.name}</span>
                        {testingSound === sound.key ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-xl font-semibold text-gray-900">Advanced Settings</h2>
          <div className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {showAdvanced && (
          <div className="mt-6 space-y-6">
            {/* Quiet Hours */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-gray-900">Quiet Hours</h3>
                    <p className="text-sm text-gray-600">Automatically disable sounds during specified hours</p>
                  </div>
                </div>
                <button
                  onClick={() => updateQuietHours('enabled', !soundSettings.quietHours.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundSettings.quietHours.enabled ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundSettings.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {soundSettings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={soundSettings.quietHours.start}
                      onChange={(e) => updateQuietHours('start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={soundSettings.quietHours.end}
                      onChange={(e) => updateQuietHours('end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stop All Sounds Button */}
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center">
                <X className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <h3 className="font-medium text-red-900">Emergency Stop</h3>
                  <p className="text-sm text-red-700">Immediately stop all playing sounds</p>
                </div>
              </div>
              <button
                onClick={stopAllSounds}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Stop All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 rounded-lg mr-4">
            <Check className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Sound Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use meditation sounds during breathing exercises for better focus</li>
              <li>• Enable quiet hours to avoid disruptions during sleep</li>
              <li>• Background sounds can help mask pain-related distractions</li>
              <li>• Exercise sounds provide audio cues for proper workout timing</li>
              <li>• Notification sounds ensure you never miss important reminders</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundSettings;