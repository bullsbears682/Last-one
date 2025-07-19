import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  Dumbbell, 
  FileText, 
  Home, 
  Pill, 
  Settings, 
  BookOpen,
  BarChart3
} from 'lucide-react';

// Import all main components
import Dashboard from './components/Dashboard';
import PainTracking from './components/PainTracking';
import ExerciseManagement from './components/ExerciseManagement';
import MedicationTracker from './components/MedicationTracker';
import AppointmentManager from './components/AppointmentManager';
import EducationalContent from './components/EducationalContent';
import ReportsAnalytics from './components/ReportsAnalytics';
import SettingsManager from './components/SettingsManager';

// Import hooks and utilities
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingScreen from './components/common/LoadingScreen';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [appData, setAppData] = useLocalStorage('backPainApp', {
    userProfile: {
      name: '',
      age: '',
      gender: '',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    painEntries: [],
    exercises: [],
    medications: [],
    appointments: [],
    settings: {
      theme: 'light',
      notifications: true,
      language: 'en',
      dataBackup: true
    }
  });

  // Initialize notifications
  const { requestPermission, scheduleNotification } = useNotifications();

  // Navigation tabs configuration
  const navigationTabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      component: Dashboard
    },
    {
      id: 'pain-tracking',
      label: 'Pain Tracking',
      icon: Activity,
      component: PainTracking
    },
    {
      id: 'exercises',
      label: 'Exercises',
      icon: Dumbbell,
      component: ExerciseManagement
    },
    {
      id: 'medications',
      label: 'Medications',
      icon: Pill,
      component: MedicationTracker
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      component: AppointmentManager
    },
    {
      id: 'education',
      label: 'Education',
      icon: BookOpen,
      component: EducationalContent
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      component: ReportsAnalytics
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      component: SettingsManager
    }
  ];

  // Handle URL-based navigation for PWA shortcuts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action) {
      switch (action) {
        case 'track-pain':
          setActiveTab('pain-tracking');
          break;
        case 'exercises':
          setActiveTab('exercises');
          break;
        case 'medications':
          setActiveTab('medications');
          break;
        default:
          setActiveTab('dashboard');
      }
    }
  }, []);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Update last login
        setAppData(prev => ({
          ...prev,
          userProfile: {
            ...prev.userProfile,
            lastLogin: new Date().toISOString()
          }
        }));

        // Request notification permissions if enabled
        if (appData.settings.notifications) {
          await requestPermission();
        }

        // Simulate loading time for better UX
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Update app data helper
  const updateAppData = (updates) => {
    setAppData(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Get active component
  const getActiveComponent = () => {
    const activeTabConfig = navigationTabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return <Dashboard appData={appData} updateAppData={updateAppData} />;
    
    const Component = activeTabConfig.component;
    return <Component appData={appData} updateAppData={updateAppData} />;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="app-container">
        {/* Main Content */}
        <main className="main-content">
          {getActiveComponent()}
        </main>

        {/* Bottom Navigation */}
        <nav className="nav-tabs" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
          {navigationTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.label}
              >
                <IconComponent size={20} />
                <span className="nav-tab-label">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* App Styles */}
        <style jsx>{`
          .app-container {
            min-height: 100vh;
            background-color: var(--gray-50);
            padding-bottom: 80px; /* Space for bottom navigation */
          }

          .main-content {
            min-height: calc(100vh - 80px);
          }

          .nav-tab-label {
            font-size: var(--font-size-xs);
            margin-top: var(--spacing-1);
          }

          @media (max-width: 768px) {
            .nav-tab-label {
              display: none;
            }
            
            .nav-tab {
              flex-direction: column;
              padding: var(--spacing-3) var(--spacing-2);
            }
            
            .app-container {
              padding-bottom: 70px;
            }
            
            .main-content {
              min-height: calc(100vh - 70px);
            }
          }

          @media (min-width: 769px) {
            .app-container {
              display: grid;
              grid-template-columns: 250px 1fr;
              padding-bottom: 0;
            }

            .nav-tabs {
              position: fixed;
              left: 0;
              top: 0;
              bottom: 0;
              width: 250px;
              flex-direction: column;
              border-right: 1px solid var(--gray-200);
              border-bottom: none;
              overflow-y: auto;
              padding: var(--spacing-6) 0;
            }

            .nav-tab {
              justify-content: flex-start;
              padding: var(--spacing-4) var(--spacing-6);
              border-bottom: none;
              border-right: 3px solid transparent;
            }

            .nav-tab.active {
              border-right-color: var(--primary-600);
              border-bottom-color: transparent;
            }

            .nav-tab-label {
              font-size: var(--font-size-sm);
              margin-top: 0;
              margin-left: var(--spacing-3);
            }

            .main-content {
              margin-left: 250px;
              min-height: 100vh;
            }
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
};

export default App;