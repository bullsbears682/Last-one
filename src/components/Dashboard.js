import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  Dumbbell, 
  Pill, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Heart,
  Target,
  Award,
  AlertCircle,
  Plus,
  ChevronRight,
  Sun,
  Moon,
  Sunrise
} from 'lucide-react';
import { format, startOfDay, endOfDay, subDays, isToday } from 'date-fns';

const Dashboard = ({ appData, updateAppData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, [currentTime]);

  // Calculate dashboard stats
  const getDashboardStats = () => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const weekAgo = subDays(today, 7);

    // Pain tracking stats
    const todayPainEntries = appData.painEntries.filter(entry => 
      new Date(entry.date) >= todayStart && new Date(entry.date) <= todayEnd
    );
    const weekPainEntries = appData.painEntries.filter(entry => 
      new Date(entry.date) >= weekAgo
    );

    const latestPainLevel = todayPainEntries.length > 0 
      ? todayPainEntries[todayPainEntries.length - 1].level 
      : null;

    const averageWeeklyPain = weekPainEntries.length > 0
      ? Math.round(weekPainEntries.reduce((sum, entry) => sum + entry.level, 0) / weekPainEntries.length)
      : 0;

    // Exercise stats
    const todayExercises = appData.exercises.filter(exercise => 
      exercise.completedSessions?.some(session => isToday(new Date(session.date)))
    );

    const weeklyExerciseMinutes = appData.exercises.reduce((total, exercise) => {
      const recentSessions = exercise.completedSessions?.filter(session => 
        new Date(session.date) >= weekAgo
      ) || [];
      return total + recentSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    }, 0);

    // Medication stats
    const todayMedications = appData.medications.filter(med => {
      const todayDoses = med.dosageHistory?.filter(dose => 
        isToday(new Date(dose.timestamp))
      ) || [];
      return todayDoses.length > 0;
    });

    const missedMedications = appData.medications.filter(med => {
      if (!med.schedule || !med.schedule.times) return false;
      
      const todayDoses = med.dosageHistory?.filter(dose => 
        isToday(new Date(dose.timestamp))
      ) || [];
      
      return todayDoses.length < med.schedule.times.length;
    });

    // Upcoming appointments
    const upcomingAppointments = appData.appointments.filter(apt => 
      new Date(apt.dateTime) > today
    ).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    return {
      latestPainLevel,
      averageWeeklyPain,
      todayExerciseCount: todayExercises.length,
      weeklyExerciseMinutes,
      todayMedicationCount: todayMedications.length,
      missedMedicationCount: missedMedications.length,
      upcomingAppointments: upcomingAppointments.slice(0, 3),
      totalPainEntries: appData.painEntries.length,
      totalExercises: appData.exercises.length,
      totalMedications: appData.medications.length
    };
  };

  const stats = getDashboardStats();

  // Quick actions
  const quickActions = [
    {
      id: 'track-pain',
      title: 'Track Pain',
      subtitle: 'Log your current pain level',
      icon: Activity,
      color: 'var(--primary-600)',
      bgColor: 'var(--primary-50)',
      action: () => {
        // This would navigate to pain tracking
        console.log('Navigate to pain tracking');
      }
    },
    {
      id: 'start-exercise',
      title: 'Start Exercise',
      subtitle: 'Begin a workout session',
      icon: Dumbbell,
      color: 'var(--secondary-600)',
      bgColor: 'var(--secondary-50)',
      action: () => {
        console.log('Navigate to exercises');
      }
    },
    {
      id: 'take-medication',
      title: 'Take Medication',
      subtitle: 'Log medication intake',
      icon: Pill,
      color: 'var(--warning)',
      bgColor: '#fef3c7',
      action: () => {
        console.log('Navigate to medications');
      }
    },
    {
      id: 'schedule-appointment',
      title: 'New Appointment',
      subtitle: 'Schedule with provider',
      icon: Calendar,
      color: 'var(--info)',
      bgColor: 'var(--primary-50)',
      action: () => {
        console.log('Navigate to appointments');
      }
    }
  ];

  // Achievement badges
  const getAchievements = () => {
    const achievements = [];
    
    if (appData.painEntries.length >= 7) {
      achievements.push({
        title: 'Week Tracker',
        description: '7 days of pain tracking',
        icon: '🗓️',
        color: 'var(--primary-600)'
      });
    }
    
    if (stats.weeklyExerciseMinutes >= 150) {
      achievements.push({
        title: 'Exercise Champion',
        description: '150+ minutes this week',
        icon: '🏆',
        color: 'var(--secondary-600)'
      });
    }
    
    if (stats.todayMedicationCount > 0 && stats.missedMedicationCount === 0) {
      achievements.push({
        title: 'Medication Master',
        description: 'Perfect adherence today',
        icon: '💊',
        color: 'var(--success)'
      });
    }
    
    return achievements;
  };

  const achievements = getAchievements();

  const getTimeIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 6 || hour >= 20) return Moon;
    if (hour < 12) return Sunrise;
    return Sun;
  };

  const TimeIcon = getTimeIcon();

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '8px'
              }}>
                <TimeIcon size={24} style={{ color: 'var(--primary-600)' }} />
                <h1 style={{ 
                  fontSize: 'var(--font-size-3xl)', 
                  fontWeight: '700',
                  color: 'var(--gray-900)',
                  margin: 0
                }}>
                  {greeting}!
                </h1>
              </div>
              <p style={{ 
                color: 'var(--gray-600)', 
                fontSize: 'var(--font-size-lg)',
                margin: 0
              }}>
                {format(currentTime, 'EEEE, MMMM do, yyyy')}
              </p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: 'var(--font-size-2xl)', 
                fontWeight: '600',
                color: 'var(--primary-600)'
              }}>
                {format(currentTime, 'h:mm a')}
              </div>
              <div style={{ 
                fontSize: 'var(--font-size-sm)', 
                color: 'var(--gray-500)'
              }}>
                Your health journey continues
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Pain Level Card */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                padding: '12px',
                borderRadius: 'var(--border-radius-lg)',
                backgroundColor: 'var(--primary-50)'
              }}>
                <Activity size={24} style={{ color: 'var(--primary-600)' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Current Pain</h3>
                <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                  Latest reading
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {stats.latestPainLevel !== null ? (
                <>
                  <div className={`pain-level-indicator pain-level-${stats.latestPainLevel}`}>
                    {stats.latestPainLevel}
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                      Weekly Average: {stats.averageWeeklyPain}/10
                    </div>
                    {stats.latestPainLevel < stats.averageWeeklyPain ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
                        <TrendingDown size={16} />
                        <span style={{ fontSize: 'var(--font-size-sm)' }}>Improving</span>
                      </div>
                    ) : stats.latestPainLevel > stats.averageWeeklyPain ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--error)' }}>
                        <TrendingUp size={16} />
                        <span style={{ fontSize: 'var(--font-size-sm)' }}>Elevated</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gray-500)' }}>
                        <span style={{ fontSize: 'var(--font-size-sm)' }}>Stable</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--gray-500)' }}>
                  No pain data today
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exercise Card */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                padding: '12px',
                borderRadius: 'var(--border-radius-lg)',
                backgroundColor: 'var(--secondary-50)'
              }}>
                <Dumbbell size={24} style={{ color: 'var(--secondary-600)' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Exercise</h3>
                <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                  This week
                </p>
              </div>
            </div>
            
            <div>
              <div style={{ 
                fontSize: 'var(--font-size-2xl)', 
                fontWeight: '700',
                color: 'var(--secondary-600)',
                marginBottom: '4px'
              }}>
                {stats.weeklyExerciseMinutes} min
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                {stats.todayExerciseCount} sessions today
              </div>
              <div className="progress" style={{ marginTop: '8px' }}>
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${Math.min((stats.weeklyExerciseMinutes / 150) * 100, 100)}%`,
                    backgroundColor: 'var(--secondary-600)'
                  }}
                />
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginTop: '4px' }}>
                Goal: 150 minutes/week
              </div>
            </div>
          </div>
        </div>

        {/* Medication Card */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                padding: '12px',
                borderRadius: 'var(--border-radius-lg)',
                backgroundColor: stats.missedMedicationCount > 0 ? '#fee2e2' : '#fef3c7'
              }}>
                <Pill size={24} style={{ 
                  color: stats.missedMedicationCount > 0 ? 'var(--error)' : 'var(--warning)' 
                }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Medications</h3>
                <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                  Today's status
                </p>
              </div>
            </div>
            
            <div>
              <div style={{ 
                fontSize: 'var(--font-size-2xl)', 
                fontWeight: '700',
                color: stats.missedMedicationCount > 0 ? 'var(--error)' : 'var(--success)',
                marginBottom: '4px'
              }}>
                {stats.todayMedicationCount}/{stats.todayMedicationCount + stats.missedMedicationCount}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                {stats.missedMedicationCount > 0 ? 
                  `${stats.missedMedicationCount} missed doses` : 
                  'All medications taken'
                }
              </div>
              {stats.missedMedicationCount > 0 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  color: 'var(--error)',
                  marginTop: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>Reminder needed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>Quick Actions</h2>
        </div>
        <div className="card-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {quickActions.map(action => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  className="btn"
                  onClick={action.action}
                  style={{
                    backgroundColor: action.bgColor,
                    color: action.color,
                    border: `1px solid ${action.color}20`,
                    padding: '20px',
                    textAlign: 'left',
                    height: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = action.color;
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = action.bgColor;
                    e.target.style.color = action.color;
                  }}
                >
                  <IconComponent size={24} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.8 }}>
                      {action.subtitle}
                    </div>
                  </div>
                  <ChevronRight size={20} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements & Upcoming */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} style={{ color: 'var(--warning)' }} />
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Achievements</h3>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {achievements.map((achievement, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--gray-50)',
                    borderRadius: 'var(--border-radius)',
                    border: `1px solid ${achievement.color}20`
                  }}>
                    <div style={{ fontSize: '24px' }}>{achievement.icon}</div>
                    <div>
                      <div style={{ fontWeight: '600', color: achievement.color }}>
                        {achievement.title}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        {stats.upcomingAppointments.length > 0 && (
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} style={{ color: 'var(--primary-600)' }} />
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Upcoming</h3>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.upcomingAppointments.map((appointment, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--primary-50)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--primary-200)'
                  }}>
                    <Clock size={16} style={{ color: 'var(--primary-600)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--gray-900)' }}>
                        {appointment.type || 'Appointment'}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                        {format(new Date(appointment.dateTime), 'MMM d, h:mm a')}
                      </div>
                      {appointment.provider && (
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary-600)' }}>
                          Dr. {appointment.provider}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Health Summary */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} style={{ color: 'var(--error)' }} />
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Health Summary</h3>
          </div>
        </div>
        <div className="card-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: 'var(--font-size-3xl)', 
                fontWeight: '700',
                color: 'var(--primary-600)',
                marginBottom: '4px'
              }}>
                {stats.totalPainEntries}
              </div>
              <div style={{ color: 'var(--gray-600)' }}>Pain Entries</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: 'var(--font-size-3xl)', 
                fontWeight: '700',
                color: 'var(--secondary-600)',
                marginBottom: '4px'
              }}>
                {stats.totalExercises}
              </div>
              <div style={{ color: 'var(--gray-600)' }}>Exercises</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: 'var(--font-size-3xl)', 
                fontWeight: '700',
                color: 'var(--warning)',
                marginBottom: '4px'
              }}>
                {stats.totalMedications}
              </div>
              <div style={{ color: 'var(--gray-600)' }}>Medications</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;