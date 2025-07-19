import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Palette,
  Globe,
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  Mail,
  Lock,
  Key,
  Archive,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';

const SettingsManager = ({ appData, updateAppData }) => {
  const [activeView, setActiveView] = useState('profile'); // 'profile', 'notifications', 'privacy', 'data', 'appearance', 'about'
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  // User profile settings
  const [profileSettings, setProfileSettings] = useState({
    name: appData.userProfile?.name || '',
    email: appData.userProfile?.email || '',
    dateOfBirth: appData.userProfile?.dateOfBirth || '',
    gender: appData.userProfile?.gender || '',
    height: appData.userProfile?.height || '',
    weight: appData.userProfile?.weight || '',
    medicalConditions: appData.userProfile?.medicalConditions || [],
    emergencyContact: appData.userProfile?.emergencyContact || {
      name: '',
      phone: '',
      relationship: ''
    },
    healthcareProvider: appData.userProfile?.healthcareProvider || {
      name: '',
      phone: '',
      address: ''
    }
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: appData.notificationSettings?.enabled !== false,
    painReminders: appData.notificationSettings?.painReminders !== false,
    medicationReminders: appData.notificationSettings?.medicationReminders !== false,
    exerciseReminders: appData.notificationSettings?.exerciseReminders !== false,
    appointmentReminders: appData.notificationSettings?.appointmentReminders !== false,
    dailyCheckIn: appData.notificationSettings?.dailyCheckIn !== false,
    weeklyReports: appData.notificationSettings?.weeklyReports !== false,
    reminderTime: appData.notificationSettings?.reminderTime || '09:00',
    quietHours: appData.notificationSettings?.quietHours || {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: appData.privacySettings?.dataSharing || 'none',
    analytics: appData.privacySettings?.analytics !== false,
    backupToCloud: appData.privacySettings?.backupToCloud || false,
    shareWithHealthcare: appData.privacySettings?.shareWithHealthcare || false,
    anonymousUsage: appData.privacySettings?.anonymousUsage !== false,
    dataRetention: appData.privacySettings?.dataRetention || '1year'
  });

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: appData.appearanceSettings?.theme || 'light',
    colorScheme: appData.appearanceSettings?.colorScheme || 'blue',
    fontSize: appData.appearanceSettings?.fontSize || 'medium',
    language: appData.appearanceSettings?.language || 'en',
    dateFormat: appData.appearanceSettings?.dateFormat || 'MM/dd/yyyy',
    timeFormat: appData.appearanceSettings?.timeFormat || '12h'
  });

  const medicalConditions = [
    'Herniated Disc', 'Sciatica', 'Arthritis', 'Fibromyalgia', 'Osteoporosis',
    'Scoliosis', 'Spinal Stenosis', 'Muscle Strain', 'Chronic Pain', 'Other'
  ];

  const colorSchemes = [
    { value: 'blue', label: 'Blue', color: '#3b82f6' },
    { value: 'green', label: 'Green', color: '#10b981' },
    { value: 'purple', label: 'Purple', color: '#8b5cf6' },
    { value: 'red', label: 'Red', color: '#ef4444' },
    { value: 'orange', label: 'Orange', color: '#f59e0b' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' }
  ];

  // Save profile settings
  const saveProfileSettings = () => {
    updateAppData({ 
      userProfile: {
        ...profileSettings,
        lastUpdated: new Date().toISOString()
      }
    });
    alert('Profile settings saved successfully!');
  };

  // Save notification settings
  const saveNotificationSettings = () => {
    updateAppData({ 
      notificationSettings: {
        ...notificationSettings,
        lastUpdated: new Date().toISOString()
      }
    });
    alert('Notification settings saved successfully!');
  };

  // Save privacy settings
  const savePrivacySettings = () => {
    updateAppData({ 
      privacySettings: {
        ...privacySettings,
        lastUpdated: new Date().toISOString()
      }
    });
    alert('Privacy settings saved successfully!');
  };

  // Save appearance settings
  const saveAppearanceSettings = () => {
    updateAppData({ 
      appearanceSettings: {
        ...appearanceSettings,
        lastUpdated: new Date().toISOString()
      }
    });
    alert('Appearance settings saved successfully!');
  };

  // Export data
  const exportData = () => {
    setIsExporting(true);
    
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: appData
      };

      let content, filename, mimeType;

      if (exportFormat === 'json') {
        content = JSON.stringify(exportData, null, 2);
        filename = `back-pain-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
        mimeType = 'application/json';
      } else if (exportFormat === 'csv') {
        // Convert to CSV format (simplified)
        const csvData = [];
        
        // Pain entries
        if (appData.painEntries) {
          csvData.push('Pain Entries');
          csvData.push('Date,Level,Location,Type,Triggers,Notes');
          appData.painEntries.forEach(entry => {
            csvData.push(`${entry.timestamp},${entry.level},"${entry.location}","${entry.type}","${entry.triggers?.join(';') || ''}","${entry.notes || ''}"`);
          });
          csvData.push('');
        }

        // Exercise data
        if (appData.exercises) {
          csvData.push('Exercise Sessions');
          csvData.push('Date,Exercise,Duration,Category,Calories');
          appData.exercises.forEach(exercise => {
            exercise.completedSessions?.forEach(session => {
              csvData.push(`${session.completedAt},${exercise.name},${session.duration},${exercise.category},${session.caloriesBurned}`);
            });
          });
          csvData.push('');
        }

        // Medication data
        if (appData.medications) {
          csvData.push('Medication History');
          csvData.push('Date,Medication,Dosage,Notes');
          appData.medications.forEach(medication => {
            medication.dosageHistory?.forEach(dose => {
              csvData.push(`${dose.timestamp},${medication.name},${dose.dosage},"${dose.notes || ''}"`);
            });
          });
        }

        content = csvData.join('\n');
        filename = `back-pain-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        mimeType = 'text/csv';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Import data
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.data) {
          // Validate and merge data
          const mergedData = {
            ...appData,
            ...importedData.data,
            lastImported: new Date().toISOString()
          };
          
          updateAppData(mergedData);
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format. Please select a valid backup file.');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Error importing data. Please check the file format.');
      } finally {
        setIsImporting(false);
        event.target.value = ''; // Reset file input
      }
    };

    reader.readAsText(file);
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL data? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your pain entries, exercises, medications, and appointments. Type "DELETE" to confirm.')) {
        const userInput = prompt('Type "DELETE" to confirm:');
        if (userInput === 'DELETE') {
          // Keep only essential settings
          const essentialData = {
            userProfile: appData.userProfile,
            notificationSettings: appData.notificationSettings,
            privacySettings: appData.privacySettings,
            appearanceSettings: appData.appearanceSettings,
            painEntries: [],
            exercises: [],
            medications: [],
            appointments: [],
            providers: [],
            bookmarks: [],
            dataCleared: new Date().toISOString()
          };
          
          updateAppData(essentialData);
          alert('All data has been cleared successfully.');
          setShowDeleteConfirm(false);
        } else {
          alert('Data deletion cancelled.');
        }
      }
    }
  };

  // Get data statistics
  const getDataStats = () => {
    return {
      painEntries: appData.painEntries?.length || 0,
      exercises: appData.exercises?.length || 0,
      medications: appData.medications?.length || 0,
      appointments: appData.appointments?.length || 0,
      providers: appData.providers?.length || 0,
      bookmarks: appData.bookmarks?.length || 0,
      totalSize: JSON.stringify(appData).length
    };
  };

  const dataStats = getDataStats();

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
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
            <Settings size={28} style={{ color: 'var(--primary-600)' }} />
            Settings & Data Management
          </h1>
          <p style={{ color: 'var(--gray-600)', margin: 0 }}>
            Manage your profile, preferences, and data
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`nav-tab ${activeView === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveView('profile')}
        >
          <User size={16} />
          Profile
        </button>
        <button
          className={`nav-tab ${activeView === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveView('notifications')}
        >
          <Bell size={16} />
          Notifications
        </button>
        <button
          className={`nav-tab ${activeView === 'privacy' ? 'active' : ''}`}
          onClick={() => setActiveView('privacy')}
        >
          <Shield size={16} />
          Privacy
        </button>
        <button
          className={`nav-tab ${activeView === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveView('appearance')}
        >
          <Palette size={16} />
          Appearance
        </button>
        <button
          className={`nav-tab ${activeView === 'data' ? 'active' : ''}`}
          onClick={() => setActiveView('data')}
        >
          <Database size={16} />
          Data Management
        </button>
        <button
          className={`nav-tab ${activeView === 'about' ? 'active' : ''}`}
          onClick={() => setActiveView('about')}
        >
          <Info size={16} />
          About
        </button>
      </div>

      {/* Profile Settings */}
      {activeView === 'profile' && (
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0 }}>User Profile</h2>
          </div>
          <div className="card-body">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your full name"
                  value={profileSettings.name}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="your.email@example.com"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={profileSettings.dateOfBirth}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={profileSettings.gender}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Height</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="5'8\" or 173 cm"
                  value={profileSettings.height}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="150 lbs or 68 kg"
                  value={profileSettings.weight}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Medical Conditions</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '8px'
              }}>
                {medicalConditions.map(condition => (
                  <button
                    key={condition}
                    type="button"
                    className={`btn ${profileSettings.medicalConditions.includes(condition) ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      setProfileSettings(prev => ({
                        ...prev,
                        medicalConditions: prev.medicalConditions.includes(condition)
                          ? prev.medicalConditions.filter(c => c !== condition)
                          : [...prev.medicalConditions, condition]
                      }));
                    }}
                    style={{ fontSize: 'var(--font-size-sm)' }}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--secondary-600)' }}>Emergency Contact</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contact name"
                    value={profileSettings.emergencyContact.name}
                    onChange={(e) => setProfileSettings(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                    }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="(555) 123-4567"
                    value={profileSettings.emergencyContact.phone}
                    onChange={(e) => setProfileSettings(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                    }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Spouse, Parent, etc."
                    value={profileSettings.emergencyContact.relationship}
                    onChange={(e) => setProfileSettings(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Primary Healthcare Provider */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--secondary-600)' }}>Primary Healthcare Provider</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Dr. Smith"
                    value={profileSettings.healthcareProvider.name}
                    onChange={(e) => setProfileSettings(prev => ({
                      ...prev,
                      healthcareProvider: { ...prev.healthcareProvider, name: e.target.value }
                    }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="(555) 123-4567"
                    value={profileSettings.healthcareProvider.phone}
                    onChange={(e) => setProfileSettings(prev => ({
                      ...prev,
                      healthcareProvider: { ...prev.healthcareProvider, phone: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-textarea"
                  placeholder="Clinic address"
                  value={profileSettings.healthcareProvider.address}
                  onChange={(e) => setProfileSettings(prev => ({
                    ...prev,
                    healthcareProvider: { ...prev.healthcareProvider, address: e.target.value }
                  }))}
                  rows={2}
                />
              </div>
            </div>

            <button className="btn btn-primary" onClick={saveProfileSettings}>
              <Save size={16} />
              Save Profile
            </button>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeView === 'notifications' && (
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0 }}>Notification Settings</h2>
          </div>
          <div className="card-body">
            {/* Master Toggle */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                cursor: 'pointer',
                padding: '12px',
                backgroundColor: 'var(--primary-50)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--primary-200)'
              }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.enabled}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  style={{ transform: 'scale(1.2)' }}
                />
                <div>
                  <div style={{ fontWeight: '600' }}>Enable Notifications</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Master switch for all app notifications
                  </div>
                </div>
              </label>
            </div>

            {/* Individual Notification Types */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              marginBottom: '24px',
              opacity: notificationSettings.enabled ? 1 : 0.5,
              pointerEvents: notificationSettings.enabled ? 'auto' : 'none'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.painReminders}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, painReminders: e.target.checked }))}
                />
                <div>
                  <div style={{ fontWeight: '500' }}>Pain Tracking Reminders</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Daily reminders to log your pain levels
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.medicationReminders}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, medicationReminders: e.target.checked }))}
                />
                <div>
                  <div style={{ fontWeight: '500' }}>Medication Reminders</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Alerts for scheduled medication doses
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.exerciseReminders}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, exerciseReminders: e.target.checked }))}
                />
                <div>
                  <div style={{ fontWeight: '500' }}>Exercise Reminders</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Encouragement to stay active with exercises
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.appointmentReminders}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, appointmentReminders: e.target.checked }))}
                />
                <div>
                  <div style={{ fontWeight: '500' }}>Appointment Reminders</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Alerts for upcoming healthcare appointments
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.weeklyReports}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                />
                <div>
                  <div style={{ fontWeight: '500' }}>Weekly Progress Reports</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Weekly summary of your health progress
                  </div>
                </div>
              </label>
            </div>

            {/* Timing Settings */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
              opacity: notificationSettings.enabled ? 1 : 0.5,
              pointerEvents: notificationSettings.enabled ? 'auto' : 'none'
            }}>
              <div className="form-group">
                <label className="form-label">Daily Reminder Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={notificationSettings.reminderTime}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
                />
              </div>
            </div>

            {/* Quiet Hours */}
            <div style={{ 
              marginBottom: '24px',
              opacity: notificationSettings.enabled ? 1 : 0.5,
              pointerEvents: notificationSettings.enabled ? 'auto' : 'none'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.quietHours.enabled}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: e.target.checked }
                  }))}
                />
                <div>
                  <div style={{ fontWeight: '500' }}>Enable Quiet Hours</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Disable notifications during specified hours
                  </div>
                </div>
              </label>

              {notificationSettings.quietHours.enabled && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  marginLeft: '36px'
                }}>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={notificationSettings.quietHours.start}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, start: e.target.value }
                      }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={notificationSettings.quietHours.end}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, end: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              )}
            </div>

            <button className="btn btn-primary" onClick={saveNotificationSettings}>
              <Save size={16} />
              Save Notification Settings
            </button>
          </div>
        </div>
      )}

      {/* Privacy Settings */}
      {activeView === 'privacy' && (
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0 }}>Privacy & Security</h2>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--success)' + '10',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--success)',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Shield size={20} style={{ color: 'var(--success)' }} />
                  <strong style={{ color: 'var(--success)' }}>Your Data is Private</strong>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                  All your health data is stored locally on your device. We never transmit your personal health information to external servers.
                </p>
              </div>

              {/* Privacy Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Data Sharing</label>
                  <select
                    className="form-select"
                    value={privacySettings.dataSharing}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, dataSharing: e.target.value }))}
                  >
                    <option value="none">No data sharing</option>
                    <option value="anonymous">Anonymous usage statistics only</option>
                    <option value="healthcare">Share with healthcare providers (when authorized)</option>
                  </select>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginTop: '4px' }}>
                    Control how your data may be shared
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={privacySettings.analytics}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, analytics: e.target.checked }))}
                  />
                  <div>
                    <div style={{ fontWeight: '500' }}>Anonymous Usage Analytics</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                      Help improve the app by sharing anonymous usage patterns
                    </div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={privacySettings.backupToCloud}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, backupToCloud: e.target.checked }))}
                  />
                  <div>
                    <div style={{ fontWeight: '500' }}>Cloud Backup (Encrypted)</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                      Securely backup your data to cloud storage (coming soon)
                    </div>
                  </div>
                </label>

                <div>
                  <label className="form-label">Data Retention</label>
                  <select
                    className="form-select"
                    value={privacySettings.dataRetention}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, dataRetention: e.target.value }))}
                  >
                    <option value="6months">6 months</option>
                    <option value="1year">1 year</option>
                    <option value="2years">2 years</option>
                    <option value="5years">5 years</option>
                    <option value="forever">Keep forever</option>
                  </select>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginTop: '4px' }}>
                    How long to keep your historical data
                  </div>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={savePrivacySettings}>
              <Save size={16} />
              Save Privacy Settings
            </button>
          </div>
        </div>
      )}

      {/* Appearance Settings */}
      {activeView === 'appearance' && (
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0 }}>Appearance & Language</h2>
          </div>
          <div className="card-body">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {/* Theme */}
              <div>
                <label className="form-label">Theme</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className={`btn ${appearanceSettings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAppearanceSettings(prev => ({ ...prev, theme: 'light' }))}
                  >
                    <Sun size={16} />
                    Light
                  </button>
                  <button
                    className={`btn ${appearanceSettings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAppearanceSettings(prev => ({ ...prev, theme: 'dark' }))}
                  >
                    <Moon size={16} />
                    Dark
                  </button>
                  <button
                    className={`btn ${appearanceSettings.theme === 'system' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAppearanceSettings(prev => ({ ...prev, theme: 'system' }))}
                  >
                    <Monitor size={16} />
                    System
                  </button>
                </div>
              </div>

              {/* Color Scheme */}
              <div>
                <label className="form-label">Color Scheme</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {colorSchemes.map(scheme => (
                    <button
                      key={scheme.value}
                      className={`btn ${appearanceSettings.colorScheme === scheme.value ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setAppearanceSettings(prev => ({ ...prev, colorScheme: scheme.value }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: scheme.color
                      }} />
                      {scheme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="form-label">Font Size</label>
                <select
                  className="form-select"
                  value={appearanceSettings.fontSize}
                  onChange={(e) => setAppearanceSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="form-label">Language</label>
                <select
                  className="form-select"
                  value={appearanceSettings.language}
                  onChange={(e) => setAppearanceSettings(prev => ({ ...prev, language: e.target.value }))}
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>

              {/* Date Format */}
              <div>
                <label className="form-label">Date Format</label>
                <select
                  className="form-select"
                  value={appearanceSettings.dateFormat}
                  onChange={(e) => setAppearanceSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                >
                  <option value="MM/dd/yyyy">MM/DD/YYYY (US)</option>
                  <option value="dd/MM/yyyy">DD/MM/YYYY (EU)</option>
                  <option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</option>
                </select>
              </div>

              {/* Time Format */}
              <div>
                <label className="form-label">Time Format</label>
                <select
                  className="form-select"
                  value={appearanceSettings.timeFormat}
                  onChange={(e) => setAppearanceSettings(prev => ({ ...prev, timeFormat: e.target.value }))}
                >
                  <option value="12h">12 Hour (AM/PM)</option>
                  <option value="24h">24 Hour</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary" onClick={saveAppearanceSettings}>
              <Save size={16} />
              Save Appearance Settings
            </button>
          </div>
        </div>
      )}

      {/* Data Management */}
      {activeView === 'data' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Data Statistics */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ margin: 0 }}>Data Overview</h2>
            </div>
            <div className="card-body">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: 'var(--error)' }}>
                    {dataStats.painEntries}
                  </div>
                  <div style={{ color: 'var(--gray-600)' }}>Pain Entries</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: 'var(--secondary-600)' }}>
                    {dataStats.exercises}
                  </div>
                  <div style={{ color: 'var(--gray-600)' }}>Exercises</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: 'var(--warning)' }}>
                    {dataStats.medications}
                  </div>
                  <div style={{ color: 'var(--gray-600)' }}>Medications</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: 'var(--primary-600)' }}>
                    {dataStats.appointments}
                  </div>
                  <div style={{ color: 'var(--gray-600)' }}>Appointments</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', color: 'var(--gray-600)' }}>
                    {Math.round(dataStats.totalSize / 1024)} KB
                  </div>
                  <div style={{ color: 'var(--gray-600)' }}>Storage Used</div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Data */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ margin: 0 }}>Export Data</h2>
            </div>
            <div className="card-body">
              <p style={{ marginBottom: '16px', color: 'var(--gray-600)' }}>
                Download a backup of all your health data. This includes pain entries, exercises, medications, and appointments.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">Export Format</label>
                  <select
                    className="form-select"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    style={{ width: '150px' }}
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={exportData}
                  disabled={isExporting}
                  style={{ marginTop: '24px' }}
                >
                  {isExporting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </button>
              </div>
            </div>
          </div>

          {/* Import Data */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ margin: 0 }}>Import Data</h2>
            </div>
            <div className="card-body">
              <p style={{ marginBottom: '16px', color: 'var(--gray-600)' }}>
                Restore your data from a previous backup. This will merge with your existing data.
              </p>

              <div style={{
                padding: '16px',
                backgroundColor: 'var(--warning)' + '10',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--warning)',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
                  <strong style={{ color: 'var(--warning)' }}>Important</strong>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                  Importing data will add to your existing data. Duplicate entries may be created. Consider exporting your current data first as a backup.
                </p>
              </div>

              <input
                type="file"
                accept=".json"
                onChange={importData}
                disabled={isImporting}
                style={{ marginBottom: '16px' }}
              />

              {isImporting && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-600)' }}>
                  <RefreshCw size={16} className="animate-spin" />
                  Importing data...
                </div>
              )}
            </div>
          </div>

          {/* Clear All Data */}
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--error)' }}>
              <h2 style={{ margin: 0, color: 'var(--error)' }}>Danger Zone</h2>
            </div>
            <div className="card-body">
              <p style={{ marginBottom: '16px', color: 'var(--gray-600)' }}>
                Permanently delete all your health data. This action cannot be undone.
              </p>

              <div style={{
                padding: '16px',
                backgroundColor: 'var(--error)' + '10',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--error)',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertTriangle size={16} style={{ color: 'var(--error)' }} />
                  <strong style={{ color: 'var(--error)' }}>Warning</strong>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                  This will permanently delete all pain entries, exercises, medications, appointments, and providers. Your profile and settings will be preserved.
                </p>
              </div>

              <button
                className="btn btn-error"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={16} />
                Clear All Data
              </button>

              {showDeleteConfirm && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div className="card" style={{ maxWidth: '400px', margin: '20px' }}>
                    <div className="card-header">
                      <h3 style={{ margin: 0, color: 'var(--error)' }}>Confirm Data Deletion</h3>
                    </div>
                    <div className="card-body">
                      <p style={{ marginBottom: '16px' }}>
                        Are you absolutely sure you want to delete all your health data? This action cannot be undone.
                      </p>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-error"
                          onClick={clearAllData}
                        >
                          Delete All Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* About */}
      {activeView === 'about' && (
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0 }}>About Back Pain Manager</h2>
          </div>
          <div className="card-body">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--primary-600)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Settings size={40} style={{ color: 'white' }} />
              </div>
              <h3 style={{ marginBottom: '8px' }}>Back Pain Manager</h3>
              <p style={{ color: 'var(--gray-600)', marginBottom: '16px' }}>Version 1.0.0</p>
              <p style={{ color: 'var(--gray-600)', maxWidth: '600px', margin: '0 auto' }}>
                A comprehensive Progressive Web Application designed to help you track, manage, and understand your back pain journey. 
                Built with privacy in mind - all your data stays on your device.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div>
                <h4 style={{ marginBottom: '12px', color: 'var(--primary-600)' }}>Features</h4>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                  <li>Comprehensive pain tracking with analytics</li>
                  <li>Exercise library and workout management</li>
                  <li>Medication scheduling and adherence tracking</li>
                  <li>Appointment and provider management</li>
                  <li>Educational content and myth-busting</li>
                  <li>Detailed reports and data visualization</li>
                  <li>Complete privacy - no data leaves your device</li>
                </ul>
              </div>

              <div>
                <h4 style={{ marginBottom: '12px', color: 'var(--primary-600)' }}>Privacy & Security</h4>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                  <li>All data stored locally on your device</li>
                  <li>No external servers or data transmission</li>
                  <li>No user accounts or login required</li>
                  <li>No tracking or analytics without consent</li>
                  <li>HIPAA-compliant design principles</li>
                  <li>Export your data anytime</li>
                </ul>
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--gray-200)',
              textAlign: 'center'
            }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--secondary-600)' }}>Important Disclaimer</h4>
              <p style={{ 
                margin: 0, 
                fontSize: 'var(--font-size-sm)', 
                color: 'var(--gray-600)',
                lineHeight: '1.6'
              }}>
                This app is designed to help you track and manage your back pain, but it is not a substitute for professional medical advice, 
                diagnosis, or treatment. Always consult with your healthcare provider regarding your health concerns and before making any 
                changes to your treatment plan.
              </p>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '16px', 
              marginTop: '24px',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--gray-500)'
            }}>
              <span>Built with ❤️ for better health</span>
              <span>•</span>
              <span>© 2024 Back Pain Manager</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsManager;