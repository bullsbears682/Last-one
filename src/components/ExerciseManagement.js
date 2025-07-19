import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Play,
  Pause,
  Square,
  Plus,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  Star,
  Heart,
  RotateCcw,
  Timer,
  CheckCircle,
  Edit3,
  Trash2,
  BarChart3,
  Award,
  Flame,
  Activity,
  Users,
  BookOpen
} from 'lucide-react';
import { format, startOfDay, endOfDay, subDays, isToday } from 'date-fns';

const ExerciseManagement = ({ appData, updateAppData }) => {
  const [activeView, setActiveView] = useState('library'); // 'library', 'workout', 'history', 'analytics'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [workoutTimer, setWorkoutTimer] = useState({ isRunning: false, time: 0, exercise: null });
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Exercise library with comprehensive back pain exercises
  const exerciseLibrary = [
    // Stretching Exercises
    {
      id: 'cat-cow',
      name: 'Cat-Cow Stretch',
      category: 'stretching',
      difficulty: 'beginner',
      duration: 300, // 5 minutes
      instructions: [
        'Start on your hands and knees in a tabletop position',
        'Arch your back and look up (Cow pose)',
        'Round your spine and tuck your chin (Cat pose)',
        'Alternate between poses slowly and smoothly',
        'Repeat for 10-15 cycles'
      ],
      benefits: ['Improves spinal flexibility', 'Reduces back tension', 'Strengthens core'],
      targetMuscles: ['Spine', 'Core', 'Back'],
      equipment: 'None',
      caloriesBurned: 25,
      image: '🐱',
      tips: 'Move slowly and focus on breathing deeply with each movement'
    },
    {
      id: 'child-pose',
      name: 'Child\'s Pose',
      category: 'stretching',
      difficulty: 'beginner',
      duration: 180,
      instructions: [
        'Kneel on the floor with knees hip-width apart',
        'Sit back on your heels',
        'Fold forward, extending arms in front',
        'Rest forehead on the ground',
        'Hold and breathe deeply'
      ],
      benefits: ['Stretches lower back', 'Relieves stress', 'Gentle spinal decompression'],
      targetMuscles: ['Lower back', 'Hips', 'Shoulders'],
      equipment: 'Yoga mat',
      caloriesBurned: 15,
      image: '🧘',
      tips: 'If knees are uncomfortable, place a pillow between calves and thighs'
    },
    {
      id: 'knee-to-chest',
      name: 'Knee-to-Chest Stretch',
      category: 'stretching',
      difficulty: 'beginner',
      duration: 240,
      instructions: [
        'Lie on your back with knees bent',
        'Bring one knee towards your chest',
        'Hold with both hands behind thigh',
        'Hold for 30 seconds',
        'Switch legs and repeat'
      ],
      benefits: ['Stretches lower back', 'Relieves hip tension', 'Improves flexibility'],
      targetMuscles: ['Lower back', 'Glutes', 'Hip flexors'],
      equipment: 'None',
      caloriesBurned: 20,
      image: '🤸',
      tips: 'Keep your back flat against the floor throughout the stretch'
    },

    // Strengthening Exercises
    {
      id: 'bird-dog',
      name: 'Bird Dog',
      category: 'strengthening',
      difficulty: 'intermediate',
      duration: 600,
      instructions: [
        'Start in tabletop position',
        'Extend opposite arm and leg simultaneously',
        'Hold for 5 seconds',
        'Return to start and switch sides',
        'Repeat 10 times each side'
      ],
      benefits: ['Strengthens core', 'Improves balance', 'Stabilizes spine'],
      targetMuscles: ['Core', 'Glutes', 'Back', 'Shoulders'],
      equipment: 'Yoga mat',
      caloriesBurned: 45,
      image: '🦅',
      tips: 'Keep hips level and avoid rotating your torso'
    },
    {
      id: 'plank',
      name: 'Modified Plank',
      category: 'strengthening',
      difficulty: 'intermediate',
      duration: 300,
      instructions: [
        'Start in push-up position on knees',
        'Keep body straight from head to knees',
        'Hold position while breathing normally',
        'Start with 15-30 seconds',
        'Gradually increase hold time'
      ],
      benefits: ['Strengthens core', 'Improves posture', 'Builds endurance'],
      targetMuscles: ['Core', 'Shoulders', 'Arms'],
      equipment: 'Yoga mat',
      caloriesBurned: 35,
      image: '🏋️',
      tips: 'Keep your core engaged and avoid sagging hips'
    },
    {
      id: 'glute-bridge',
      name: 'Glute Bridge',
      category: 'strengthening',
      difficulty: 'beginner',
      duration: 480,
      instructions: [
        'Lie on back with knees bent',
        'Feet flat on floor, hip-width apart',
        'Lift hips by squeezing glutes',
        'Hold for 2 seconds at top',
        'Lower slowly, repeat 15 times'
      ],
      benefits: ['Strengthens glutes', 'Supports lower back', 'Improves hip stability'],
      targetMuscles: ['Glutes', 'Hamstrings', 'Core'],
      equipment: 'None',
      caloriesBurned: 40,
      image: '🍑',
      tips: 'Focus on squeezing glutes, not pushing through heels'
    },

    // Cardio Exercises
    {
      id: 'walking',
      name: 'Gentle Walking',
      category: 'cardio',
      difficulty: 'beginner',
      duration: 1200, // 20 minutes
      instructions: [
        'Start with 5-minute warm-up at slow pace',
        'Gradually increase to comfortable pace',
        'Maintain good posture throughout',
        'Cool down with 5 minutes slow walking',
        'Focus on breathing rhythm'
      ],
      benefits: ['Low-impact cardio', 'Improves circulation', 'Reduces stiffness'],
      targetMuscles: ['Legs', 'Core', 'Cardiovascular system'],
      equipment: 'Comfortable shoes',
      caloriesBurned: 120,
      image: '🚶',
      tips: 'Start slowly and listen to your body'
    },
    {
      id: 'water-walking',
      name: 'Water Walking',
      category: 'cardio',
      difficulty: 'beginner',
      duration: 1800, // 30 minutes
      instructions: [
        'Enter pool at chest-deep water',
        'Walk forward maintaining upright posture',
        'Swing arms naturally as you walk',
        'Vary direction - forward, backward, sideways',
        'Use water resistance for gentle strengthening'
      ],
      benefits: ['Zero-impact exercise', 'Full-body workout', 'Reduces joint stress'],
      targetMuscles: ['Full body', 'Core', 'Cardiovascular system'],
      equipment: 'Swimming pool',
      caloriesBurned: 180,
      image: '🏊',
      tips: 'Water should be chest-deep for optimal resistance and support'
    },

    // Yoga Exercises
    {
      id: 'downward-dog',
      name: 'Downward Facing Dog',
      category: 'yoga',
      difficulty: 'intermediate',
      duration: 300,
      instructions: [
        'Start in tabletop position',
        'Tuck toes under and lift hips up',
        'Straighten legs as much as comfortable',
        'Create inverted V-shape with body',
        'Hold while breathing deeply'
      ],
      benefits: ['Stretches entire back', 'Strengthens arms', 'Improves circulation'],
      targetMuscles: ['Back', 'Shoulders', 'Hamstrings', 'Calves'],
      equipment: 'Yoga mat',
      caloriesBurned: 30,
      image: '🐕',
      tips: 'Bend knees slightly if hamstrings are tight'
    },
    {
      id: 'warrior-pose',
      name: 'Warrior I Pose',
      category: 'yoga',
      difficulty: 'intermediate',
      duration: 240,
      instructions: [
        'Step left foot back 3-4 feet',
        'Turn left foot out 45 degrees',
        'Bend right knee over ankle',
        'Raise arms overhead',
        'Hold, then switch sides'
      ],
      benefits: ['Strengthens legs', 'Opens hips', 'Improves balance'],
      targetMuscles: ['Legs', 'Hips', 'Core', 'Shoulders'],
      equipment: 'Yoga mat',
      caloriesBurned: 35,
      image: '⚔️',
      tips: 'Keep front knee aligned over ankle, not past toes'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Exercises', icon: Dumbbell },
    { value: 'stretching', label: 'Stretching', icon: RotateCcw },
    { value: 'strengthening', label: 'Strengthening', icon: Target },
    { value: 'cardio', label: 'Cardio', icon: Heart },
    { value: 'yoga', label: 'Yoga', icon: Users }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (workoutTimer.isRunning) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => ({
          ...prev,
          time: prev.time + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutTimer.isRunning]);

  // Filter exercises
  const getFilteredExercises = () => {
    return exerciseLibrary.filter(exercise => {
      const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
      const matchesSearch = searchTerm === '' || 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.benefits.some(benefit => benefit.toLowerCase().includes(searchTerm.toLowerCase())) ||
        exercise.targetMuscles.some(muscle => muscle.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  };

  // Start workout
  const startWorkout = (exercise) => {
    setCurrentWorkout(exercise);
    setWorkoutTimer({
      isRunning: true,
      time: 0,
      exercise: exercise
    });
    setActiveView('workout');
  };

  // Complete workout
  const completeWorkout = () => {
    if (!currentWorkout) return;

    const completedSession = {
      id: Date.now().toString(),
      exerciseId: currentWorkout.id,
      exerciseName: currentWorkout.name,
      duration: workoutTimer.time,
      targetDuration: currentWorkout.duration,
      completedAt: new Date().toISOString(),
      caloriesBurned: Math.round((workoutTimer.time / currentWorkout.duration) * currentWorkout.caloriesBurned),
      difficulty: currentWorkout.difficulty,
      category: currentWorkout.category
    };

    // Update exercise data
    const existingExerciseIndex = appData.exercises.findIndex(ex => ex.id === currentWorkout.id);
    let updatedExercises;

    if (existingExerciseIndex >= 0) {
      // Update existing exercise
      updatedExercises = appData.exercises.map((exercise, index) => {
        if (index === existingExerciseIndex) {
          return {
            ...exercise,
            completedSessions: [...(exercise.completedSessions || []), completedSession],
            totalSessions: (exercise.totalSessions || 0) + 1,
            totalDuration: (exercise.totalDuration || 0) + workoutTimer.time,
            lastCompleted: new Date().toISOString()
          };
        }
        return exercise;
      });
    } else {
      // Add new exercise
      const newExercise = {
        ...currentWorkout,
        completedSessions: [completedSession],
        totalSessions: 1,
        totalDuration: workoutTimer.time,
        lastCompleted: new Date().toISOString(),
        isFavorite: false
      };
      updatedExercises = [...appData.exercises, newExercise];
    }

    updateAppData({ exercises: updatedExercises });

    // Reset workout state
    setCurrentWorkout(null);
    setWorkoutTimer({ isRunning: false, time: 0, exercise: null });
    setActiveView('history');
  };

  // Toggle timer
  const toggleTimer = () => {
    setWorkoutTimer(prev => ({
      ...prev,
      isRunning: !prev.isRunning
    }));
  };

  // Stop workout
  const stopWorkout = () => {
    if (window.confirm('Are you sure you want to stop this workout?')) {
      setCurrentWorkout(null);
      setWorkoutTimer({ isRunning: false, time: 0, exercise: null });
      setActiveView('library');
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get analytics
  const getAnalytics = () => {
    if (appData.exercises.length === 0) return null;

    const allSessions = appData.exercises.reduce((acc, exercise) => {
      return acc.concat(exercise.completedSessions || []);
    }, []);

    const last30Days = allSessions.filter(session => 
      new Date(session.completedAt) >= subDays(new Date(), 30)
    );

    const totalSessions = allSessions.length;
    const totalMinutes = Math.round(allSessions.reduce((sum, session) => sum + session.duration, 0) / 60);
    const totalCalories = allSessions.reduce((sum, session) => sum + session.caloriesBurned, 0);
    const last30Sessions = last30Days.length;
    const last30Minutes = Math.round(last30Days.reduce((sum, session) => sum + session.duration, 0) / 60);

    // Most popular category
    const categoryCounts = {};
    allSessions.forEach(session => {
      categoryCounts[session.category] = (categoryCounts[session.category] || 0) + 1;
    });
    const mostPopularCategory = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, ''
    );

    return {
      totalSessions,
      totalMinutes,
      totalCalories,
      last30Sessions,
      last30Minutes,
      mostPopularCategory,
      averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      weeklyAverage: Math.round(last30Sessions / 4.3) // 30 days / 7 days per week
    };
  };

  const analytics = getAnalytics();
  const filteredExercises = getFilteredExercises();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Dumbbell size={28} style={{ color: 'var(--secondary-600)' }} />
            Exercise Management
          </h1>
          <p style={{ color: 'var(--gray-600)', margin: 0 }}>
            Strengthen your back and improve your health with guided exercises
          </p>
        </div>
        
        <button
          className="btn btn-success"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={20} />
          Create Custom Exercise
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`nav-tab ${activeView === 'library' ? 'active' : ''}`}
          onClick={() => setActiveView('library')}
        >
          <BookOpen size={16} />
          Exercise Library
        </button>
        <button
          className={`nav-tab ${activeView === 'workout' ? 'active' : ''}`}
          onClick={() => setActiveView('workout')}
          disabled={!currentWorkout}
        >
          <Play size={16} />
          Active Workout
        </button>
        <button
          className={`nav-tab ${activeView === 'history' ? 'active' : ''}`}
          onClick={() => setActiveView('history')}
        >
          <Calendar size={16} />
          History
        </button>
        <button
          className={`nav-tab ${activeView === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveView('analytics')}
        >
          <BarChart3 size={16} />
          Progress
        </button>
      </div>

      {/* Exercise Library View */}
      {activeView === 'library' && (
        <div>
          {/* Filters */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-body">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                alignItems: 'end'
              }}>
                {/* Search */}
                <div className="form-group mb-0">
                  <label className="form-label">Search Exercises</label>
                  <div style={{ position: 'relative' }}>
                    <Search 
                      size={16} 
                      style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: 'var(--gray-400)'
                      }} 
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search by name, benefits, or muscles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="form-group mb-0">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div className="form-group mb-0">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-select"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                >
                  <Filter size={16} />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Exercise Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {filteredExercises.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1' }}>
                <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Dumbbell size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                  <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Exercises Found</h3>
                  <p style={{ color: 'var(--gray-500)' }}>
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              </div>
            ) : (
              filteredExercises.map(exercise => (
                <div key={exercise.id} className="card" style={{ overflow: 'hidden' }}>
                  {/* Exercise Header */}
                  <div style={{
                    background: `linear-gradient(135deg, var(--${exercise.category === 'stretching' ? 'primary' : exercise.category === 'strengthening' ? 'secondary' : exercise.category === 'cardio' ? 'error' : 'warning'}-600), var(--${exercise.category === 'stretching' ? 'primary' : exercise.category === 'strengthening' ? 'secondary' : exercise.category === 'cardio' ? 'error' : 'warning'}-700))`,
                    color: 'white',
                    padding: '20px',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      fontSize: '48px', 
                      textAlign: 'center', 
                      marginBottom: '12px',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}>
                      {exercise.image}
                    </div>
                    <h3 style={{ 
                      margin: 0, 
                      textAlign: 'center', 
                      fontSize: 'var(--font-size-lg)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      {exercise.name}
                    </h3>
                    
                    {/* Difficulty Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: 'var(--border-radius-full)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {exercise.difficulty}
                    </div>
                  </div>

                  <div className="card-body">
                    {/* Exercise Stats */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--border-radius)'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <Clock size={16} style={{ color: 'var(--primary-600)', marginBottom: '4px' }} />
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                          {Math.round(exercise.duration / 60)}m
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                          Duration
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <Flame size={16} style={{ color: 'var(--error)', marginBottom: '4px' }} />
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                          {exercise.caloriesBurned}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                          Calories
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <Target size={16} style={{ color: 'var(--secondary-600)', marginBottom: '4px' }} />
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                          {exercise.targetMuscles.length}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                          Muscles
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: '8px' }}>
                        Benefits:
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {exercise.benefits.slice(0, 3).map((benefit, index) => (
                          <span key={index} className="badge badge-success" style={{ fontSize: 'var(--font-size-xs)' }}>
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Equipment */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--gray-600)'
                      }}>
                        <Dumbbell size={14} />
                        <span>Equipment: {exercise.equipment}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-success"
                        onClick={() => startWorkout(exercise)}
                        style={{ flex: 1 }}
                      >
                        <Play size={16} />
                        Start Exercise
                      </button>
                      
                      <button
                        className="btn btn-secondary btn-icon-only"
                        onClick={() => {
                          // Toggle favorite (would implement this functionality)
                          console.log('Toggle favorite for', exercise.name);
                        }}
                      >
                        <Heart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Active Workout View */}
      {activeView === 'workout' && currentWorkout && (
        <div>
          <div className="card">
            <div style={{
              background: `linear-gradient(135deg, var(--secondary-600), var(--secondary-700))`,
              color: 'white',
              padding: '40px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '72px', marginBottom: '16px' }}>
                {currentWorkout.image}
              </div>
              <h2 style={{ margin: 0, marginBottom: '8px' }}>
                {currentWorkout.name}
              </h2>
              <p style={{ margin: 0, opacity: 0.9 }}>
                {currentWorkout.category.charAt(0).toUpperCase() + currentWorkout.category.slice(1)} • {currentWorkout.difficulty.charAt(0).toUpperCase() + currentWorkout.difficulty.slice(1)}
              </p>
            </div>

            <div className="card-body">
              {/* Timer Display */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  fontSize: 'var(--font-size-4xl)',
                  fontWeight: '700',
                  color: 'var(--secondary-600)',
                  marginBottom: '8px'
                }}>
                  {formatTime(workoutTimer.time)}
                </div>
                <div style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--gray-600)',
                  marginBottom: '16px'
                }}>
                  Target: {formatTime(currentWorkout.duration)}
                </div>

                {/* Progress Bar */}
                <div className="progress" style={{ marginBottom: '24px' }}>
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${Math.min((workoutTimer.time / currentWorkout.duration) * 100, 100)}%`,
                      backgroundColor: 'var(--secondary-600)'
                    }}
                  />
                </div>

                {/* Timer Controls */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    className={`btn ${workoutTimer.isRunning ? 'btn-warning' : 'btn-success'} btn-lg`}
                    onClick={toggleTimer}
                  >
                    {workoutTimer.isRunning ? (
                      <>
                        <Pause size={20} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        {workoutTimer.time > 0 ? 'Resume' : 'Start'}
                      </>
                    )}
                  </button>
                  
                  <button
                    className="btn btn-success btn-lg"
                    onClick={completeWorkout}
                    disabled={workoutTimer.time < 30} // Minimum 30 seconds
                  >
                    <CheckCircle size={20} />
                    Complete
                  </button>
                  
                  <button
                    className="btn btn-error btn-lg"
                    onClick={stopWorkout}
                  >
                    <Square size={20} />
                    Stop
                  </button>
                </div>
              </div>

              {/* Exercise Instructions */}
              <div>
                <h3 style={{ marginBottom: '16px', color: 'var(--secondary-600)' }}>
                  Instructions:
                </h3>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                  {currentWorkout.instructions.map((instruction, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>
                      {instruction}
                    </li>
                  ))}
                </ol>

                {currentWorkout.tips && (
                  <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: 'var(--secondary-50)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--secondary-200)'
                  }}>
                    <h4 style={{ 
                      margin: 0, 
                      marginBottom: '8px', 
                      color: 'var(--secondary-700)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: '600'
                    }}>
                      💡 Pro Tip:
                    </h4>
                    <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                      {currentWorkout.tips}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History View */}
      {activeView === 'history' && (
        <div>
          {appData.exercises.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Calendar size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Exercise History</h3>
                <p style={{ color: 'var(--gray-500)' }}>
                  Complete your first workout to start tracking your progress.
                </p>
                <button
                  className="btn btn-success"
                  onClick={() => setActiveView('library')}
                  style={{ marginTop: '16px' }}
                >
                  <Play size={16} />
                  Browse Exercises
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {appData.exercises
                .filter(exercise => exercise.completedSessions && exercise.completedSessions.length > 0)
                .sort((a, b) => new Date(b.lastCompleted) - new Date(a.lastCompleted))
                .map(exercise => (
                  <div key={exercise.id} className="card">
                    <div className="card-body">
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ fontSize: '32px' }}>{exercise.image}</div>
                          <div>
                            <h3 style={{ margin: 0, marginBottom: '4px' }}>
                              {exercise.name}
                            </h3>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px',
                              fontSize: 'var(--font-size-sm)',
                              color: 'var(--gray-600)'
                            }}>
                              <span className={`badge badge-${exercise.category === 'stretching' ? 'primary' : exercise.category === 'strengthening' ? 'success' : 'warning'}`}>
                                {exercise.category}
                              </span>
                              <span>{exercise.totalSessions} sessions</span>
                              <span>{Math.round(exercise.totalDuration / 60)} minutes total</span>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                          Last: {format(new Date(exercise.lastCompleted), 'MMM d, yyyy')}
                        </div>
                      </div>

                      {/* Recent Sessions */}
                      <div>
                        <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: '8px' }}>
                          Recent Sessions:
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {exercise.completedSessions.slice(-5).reverse().map((session, index) => (
                            <div key={index} style={{
                              padding: '8px 12px',
                              backgroundColor: 'var(--gray-50)',
                              borderRadius: 'var(--border-radius)',
                              fontSize: 'var(--font-size-xs)',
                              border: '1px solid var(--gray-200)'
                            }}>
                              <div style={{ fontWeight: '600' }}>
                                {formatTime(session.duration)}
                              </div>
                              <div style={{ color: 'var(--gray-600)' }}>
                                {format(new Date(session.completedAt), 'MMM d')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div>
          {analytics ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Overview Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <Activity size={32} style={{ color: 'var(--secondary-600)', marginBottom: '8px' }} />
                    <div style={{
                      fontSize: 'var(--font-size-3xl)',
                      fontWeight: '700',
                      color: 'var(--secondary-600)',
                      marginBottom: '4px'
                    }}>
                      {analytics.totalSessions}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Total Sessions</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <Clock size={32} style={{ color: 'var(--primary-600)', marginBottom: '8px' }} />
                    <div style={{
                      fontSize: 'var(--font-size-3xl)',
                      fontWeight: '700',
                      color: 'var(--primary-600)',
                      marginBottom: '4px'
                    }}>
                      {analytics.totalMinutes}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Minutes Exercised</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <Flame size={32} style={{ color: 'var(--error)', marginBottom: '8px' }} />
                    <div style={{
                      fontSize: 'var(--font-size-3xl)',
                      fontWeight: '700',
                      color: 'var(--error)',
                      marginBottom: '4px'
                    }}>
                      {analytics.totalCalories}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Calories Burned</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <TrendingUp size={32} style={{ color: 'var(--warning)', marginBottom: '8px' }} />
                    <div style={{
                      fontSize: 'var(--font-size-3xl)',
                      fontWeight: '700',
                      color: 'var(--warning)',
                      marginBottom: '4px'
                    }}>
                      {analytics.weeklyAverage}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Weekly Average</div>
                  </div>
                </div>
              </div>

              {/* Progress Insights */}
              <div className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={20} style={{ color: 'var(--warning)' }} />
                    <h2 style={{ margin: 0 }}>Progress Insights</h2>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                  }}>
                    <div>
                      <h4 style={{ marginBottom: '12px', color: 'var(--secondary-600)' }}>
                        Last 30 Days
                      </h4>
                      <div style={{
                        padding: '16px',
                        backgroundColor: 'var(--secondary-50)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--secondary-200)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>Sessions:</span>
                          <strong>{analytics.last30Sessions}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Minutes:</span>
                          <strong>{analytics.last30Minutes}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ marginBottom: '12px', color: 'var(--primary-600)' }}>
                        Favorite Category
                      </h4>
                      <div style={{
                        padding: '16px',
                        backgroundColor: 'var(--primary-50)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--primary-200)'
                      }}>
                        <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                          {analytics.mostPopularCategory || 'No data'}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                          Most completed exercises
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ marginBottom: '12px', color: 'var(--warning)' }}>
                        Average Session
                      </h4>
                      <div style={{
                        padding: '16px',
                        backgroundColor: '#fef3c7',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid #fcd34d'
                      }}>
                        <div style={{ fontWeight: '600' }}>
                          {analytics.averageSessionLength} minutes
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                          Per workout session
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <BarChart3 size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Analytics Available</h3>
                <p style={{ color: 'var(--gray-500)' }}>
                  Complete some exercises to see your progress analytics.
                </p>
                <button
                  className="btn btn-success"
                  onClick={() => setActiveView('library')}
                  style={{ marginTop: '16px' }}
                >
                  <Play size={16} />
                  Start Exercising
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseManagement;