import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Play,
  Pause,
  Square,
  RotateCcw,
  Timer,
  Volume2,
  VolumeX,
  Settings,
  Heart,
  Leaf,
  Sun,
  Moon,
  Wind,
  Waves,
  Cloud,
  Mountain,
  Flower,
  TreePine,
  Sparkles,
  Target
} from 'lucide-react';
import useSound from '../hooks/useSound';

const MeditationCenter = ({ appData, updateAppData }) => {
  const { soundPresets, playSound, stopAllSounds } = useSound();
  
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [breathingPhase, setBreathingPhase] = useState('prepare'); // 'prepare', 'inhale', 'hold', 'exhale', 'rest'
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [backgroundSound, setBackgroundSound] = useState(null);
  
  const breathingTimerRef = useRef(null);
  const phaseTimerRef = useRef(null);
  const backgroundSoundRef = useRef(null);

  // Meditation programs
  const meditationPrograms = [
    {
      id: 'basic-breathing',
      name: 'Basic Breathing',
      description: 'Simple 4-7-8 breathing technique for relaxation',
      icon: Wind,
      duration: 300, // 5 minutes
      type: 'breathing',
      pattern: {
        prepare: 5,
        inhale: 4,
        hold: 7,
        exhale: 8,
        rest: 2
      },
      benefits: ['Reduces anxiety', 'Improves sleep', 'Lowers stress'],
      difficulty: 'beginner'
    },
    {
      id: 'box-breathing',
      name: 'Box Breathing',
      description: 'Equal-count breathing for focus and calm',
      icon: Target,
      duration: 600, // 10 minutes
      type: 'breathing',
      pattern: {
        prepare: 5,
        inhale: 4,
        hold: 4,
        exhale: 4,
        rest: 4
      },
      benefits: ['Enhances focus', 'Reduces stress', 'Improves concentration'],
      difficulty: 'intermediate'
    },
    {
      id: 'pain-relief',
      name: 'Pain Relief Meditation',
      description: 'Guided meditation specifically for pain management',
      icon: Heart,
      duration: 900, // 15 minutes
      type: 'guided',
      benefits: ['Reduces pain perception', 'Promotes healing', 'Increases relaxation'],
      difficulty: 'beginner'
    },
    {
      id: 'progressive-relaxation',
      name: 'Progressive Muscle Relaxation',
      description: 'Systematic tension and release of muscle groups',
      icon: Leaf,
      duration: 1200, // 20 minutes
      type: 'progressive',
      benefits: ['Releases muscle tension', 'Improves body awareness', 'Reduces physical stress'],
      difficulty: 'intermediate'
    },
    {
      id: 'morning-energy',
      name: 'Morning Energy Boost',
      description: 'Energizing breathing to start your day',
      icon: Sun,
      duration: 300, // 5 minutes
      type: 'breathing',
      pattern: {
        prepare: 3,
        inhale: 3,
        hold: 1,
        exhale: 3,
        rest: 1
      },
      benefits: ['Increases energy', 'Improves alertness', 'Enhances mood'],
      difficulty: 'beginner'
    },
    {
      id: 'evening-calm',
      name: 'Evening Wind Down',
      description: 'Calming meditation for better sleep',
      icon: Moon,
      duration: 600, // 10 minutes
      type: 'breathing',
      pattern: {
        prepare: 5,
        inhale: 4,
        hold: 4,
        exhale: 6,
        rest: 3
      },
      benefits: ['Promotes sleep', 'Reduces evening anxiety', 'Calms the mind'],
      difficulty: 'beginner'
    }
  ];

  // Background sound options
  const backgroundSounds = [
    { id: 'none', name: 'Silence', icon: VolumeX },
    { id: 'rain', name: 'Rain', icon: Cloud },
    { id: 'ocean', name: 'Ocean Waves', icon: Waves },
    { id: 'white-noise', name: 'White Noise', icon: Wind },
    { id: 'brown-noise', name: 'Brown Noise', icon: Mountain }
  ];

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning && activeSession) {
      interval = setInterval(() => {
        setSessionTimer(prev => {
          const newTime = prev + 1;
          
          // Check if session is complete
          if (newTime >= selectedProgram.duration) {
            completeSession();
            return prev;
          }
          
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, activeSession, selectedProgram]);

  // Breathing pattern effect
  useEffect(() => {
    if (activeSession && selectedProgram?.type === 'breathing' && isRunning) {
      startBreathingCycle();
    }
    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
    };
  }, [activeSession, isRunning, selectedProgram]);

  // Background sound effect
  useEffect(() => {
    if (backgroundSound && backgroundSound !== 'none') {
      const soundMap = {
        'rain': soundPresets.startRain,
        'ocean': soundPresets.startOcean,
        'white-noise': soundPresets.startWhiteNoise,
        'brown-noise': soundPresets.startBrownNoise
      };
      
      if (soundMap[backgroundSound]) {
        backgroundSoundRef.current = soundMap[backgroundSound]();
      }
    }
    
    return () => {
      if (backgroundSoundRef.current) {
        stopAllSounds();
        backgroundSoundRef.current = null;
      }
    };
  }, [backgroundSound, soundPresets, stopAllSounds]);

  const startBreathingCycle = () => {
    if (!selectedProgram?.pattern) return;
    
    const pattern = selectedProgram.pattern;
    let currentPhase = 'prepare';
    
    const runPhase = (phase, duration) => {
      setBreathingPhase(phase);
      
      // Play appropriate sound for each phase
      switch (phase) {
        case 'prepare':
          soundPresets.meditationBell();
          break;
        case 'inhale':
          soundPresets.breathingIn();
          break;
        case 'exhale':
          soundPresets.breathingOut();
          break;
        case 'hold':
        case 'rest':
          // Silent phases
          break;
      }
      
      phaseTimerRef.current = setTimeout(() => {
        if (!isRunning) return;
        
        // Move to next phase
        switch (phase) {
          case 'prepare':
            runPhase('inhale', pattern.inhale);
            break;
          case 'inhale':
            runPhase('hold', pattern.hold);
            break;
          case 'hold':
            runPhase('exhale', pattern.exhale);
            break;
          case 'exhale':
            runPhase('rest', pattern.rest);
            break;
          case 'rest':
            setBreathingCycle(prev => prev + 1);
            runPhase('inhale', pattern.inhale);
            break;
        }
      }, duration * 1000);
    };
    
    runPhase('prepare', pattern.prepare);
  };

  const startSession = (program) => {
    setSelectedProgram(program);
    setActiveSession(program.id);
    setSessionTimer(0);
    setBreathingCycle(0);
    setBreathingPhase('prepare');
    setIsRunning(true);
    
    // Play start sound
    soundPresets.meditationBell();
    
    // Save session start
    const sessionData = {
      id: Date.now().toString(),
      programId: program.id,
      programName: program.name,
      startTime: new Date().toISOString(),
      duration: 0,
      completed: false
    };
    
    const updatedSessions = [...(appData.meditationSessions || []), sessionData];
    updateAppData({ meditationSessions: updatedSessions });
  };

  const pauseSession = () => {
    setIsRunning(false);
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
    }
    setBreathingPhase('paused');
  };

  const resumeSession = () => {
    setIsRunning(true);
    if (selectedProgram?.type === 'breathing') {
      startBreathingCycle();
    }
  };

  const stopSession = () => {
    setIsRunning(false);
    setActiveSession(null);
    setSelectedProgram(null);
    setSessionTimer(0);
    setBreathingCycle(0);
    setBreathingPhase('prepare');
    
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
    }
    
    stopAllSounds();
  };

  const completeSession = () => {
    const completedSession = {
      id: Date.now().toString(),
      programId: selectedProgram.id,
      programName: selectedProgram.name,
      startTime: new Date(Date.now() - sessionTimer * 1000).toISOString(),
      endTime: new Date().toISOString(),
      duration: sessionTimer,
      completed: true,
      cycles: breathingCycle
    };
    
    // Update meditation sessions
    const updatedSessions = (appData.meditationSessions || []).map(session => 
      session.programId === selectedProgram.id && !session.completed 
        ? completedSession 
        : session
    );
    
    // If no existing incomplete session found, add new one
    if (!updatedSessions.some(s => s.id === completedSession.id)) {
      updatedSessions.push(completedSession);
    }
    
    updateAppData({ meditationSessions: updatedSessions });
    
    // Play completion sound
    soundPresets.achievement();
    
    // Reset state
    setIsRunning(false);
    setActiveSession(null);
    setSelectedProgram(null);
    setSessionTimer(0);
    setBreathingCycle(0);
    setBreathingPhase('prepare');
    
    stopAllSounds();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseInstructions = () => {
    switch (breathingPhase) {
      case 'prepare':
        return 'Get comfortable and prepare to begin';
      case 'inhale':
        return 'Breathe in slowly through your nose';
      case 'hold':
        return 'Hold your breath gently';
      case 'exhale':
        return 'Exhale slowly through your mouth';
      case 'rest':
        return 'Rest and prepare for the next breath';
      case 'paused':
        return 'Session paused - click resume to continue';
      default:
        return 'Focus on your breathing';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionStats = () => {
    const sessions = appData.meditationSessions || [];
    const completedSessions = sessions.filter(s => s.completed);
    const totalTime = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSession = completedSessions.length > 0 ? totalTime / completedSessions.length : 0;
    
    return {
      totalSessions: completedSessions.length,
      totalTime: Math.floor(totalTime / 60), // in minutes
      averageSession: Math.floor(averageSession / 60), // in minutes
      streak: calculateStreak(completedSessions)
    };
  };

  const calculateStreak = (sessions) => {
    if (sessions.length === 0) return 0;
    
    const today = new Date();
    const sortedSessions = sessions
      .map(s => new Date(s.endTime))
      .sort((a, b) => b - a);
    
    let streak = 0;
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);
    
    for (let sessionDate of sortedSessions) {
      const sessionDay = new Date(sessionDate);
      sessionDay.setHours(0, 0, 0, 0);
      
      const dayDiff = (currentDate - sessionDay) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 0 || dayDiff === 1) {
        streak++;
        currentDate = sessionDay;
      } else {
        break;
      }
    }
    
    return streak;
  };

  if (activeSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Session Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedProgram.name}
            </h1>
            <p className="text-gray-600 mb-4">{selectedProgram.description}</p>
            
            {/* Timer Display */}
            <div className="bg-white rounded-3xl p-8 shadow-lg mb-6">
              <div className="text-6xl font-mono font-bold text-blue-600 mb-2">
                {formatTime(sessionTimer)}
              </div>
              <div className="text-lg text-gray-600 mb-4">
                {formatTime(selectedProgram.duration - sessionTimer)} remaining
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(sessionTimer / selectedProgram.duration) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Breathing Guide */}
          {selectedProgram.type === 'breathing' && (
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-6 text-center">
              <div className={`inline-block p-6 rounded-full mb-4 transition-all duration-1000 ${
                breathingPhase === 'inhale' ? 'bg-blue-100 scale-110' :
                breathingPhase === 'exhale' ? 'bg-purple-100 scale-90' :
                breathingPhase === 'hold' ? 'bg-green-100 scale-105' :
                'bg-gray-100'
              }`}>
                <Wind className={`h-12 w-12 transition-colors duration-1000 ${
                  breathingPhase === 'inhale' ? 'text-blue-600' :
                  breathingPhase === 'exhale' ? 'text-purple-600' :
                  breathingPhase === 'hold' ? 'text-green-600' :
                  'text-gray-600'
                }`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                {breathingPhase}
              </h3>
              <p className="text-gray-600 mb-4">{getPhaseInstructions()}</p>
              
              {breathingCycle > 0 && (
                <p className="text-sm text-gray-500">
                  Cycle {breathingCycle}
                </p>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {isRunning ? (
              <button
                onClick={pauseSession}
                className="flex items-center px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </button>
            ) : (
              <button
                onClick={resumeSession}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Play className="h-5 w-5 mr-2" />
                Resume
              </button>
            )}
            
            <button
              onClick={stopSession}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop
            </button>
          </div>

          {/* Background Sound Controls */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Background Sounds</h3>
            <div className="grid grid-cols-3 gap-3">
              {backgroundSounds.map((sound) => {
                const IconComponent = sound.icon;
                return (
                  <button
                    key={sound.id}
                    onClick={() => setBackgroundSound(sound.id === backgroundSound ? null : sound.id)}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                      backgroundSound === sound.id
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">{sound.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getSessionStats();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meditation Center</h1>
        <p className="text-gray-600">Guided meditation and breathing exercises for pain relief</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTime}m</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Timer className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Session</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageSession}m</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <RotateCcw className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Meditation Programs */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Meditation Programs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meditationPrograms.map((program) => {
            const IconComponent = program.icon;
            return (
              <div key={program.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <IconComponent className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(program.difficulty)}`}>
                    {program.difficulty}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{program.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{program.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Timer className="h-4 w-4 mr-1" />
                    {Math.floor(program.duration / 60)}min
                  </span>
                  <span className="capitalize">{program.type}</span>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Benefits:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {program.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-1 h-1 bg-purple-400 rounded-full mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={() => startSession(program)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MeditationCenter;