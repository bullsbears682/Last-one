import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Zap, 
  FileText,
  Camera,
  Save,
  Trash2,
  Edit3,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  Search,
  Download
} from 'lucide-react';
import { format, startOfDay, endOfDay, subDays, isToday } from 'date-fns';

const PainTracking = ({ appData, updateAppData }) => {
  const [activeView, setActiveView] = useState('log'); // 'log', 'history', 'analytics'
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pain entry form state
  const [painEntry, setPainEntry] = useState({
    level: 5,
    location: '',
    type: '',
    triggers: [],
    symptoms: [],
    timeOfDay: 'morning',
    weather: '',
    activities: '',
    notes: '',
    photos: []
  });

  // Pain types and locations
  const painTypes = [
    'Sharp', 'Dull', 'Burning', 'Stabbing', 'Throbbing', 
    'Aching', 'Cramping', 'Shooting', 'Tingling', 'Stiff'
  ];

  const painLocations = [
    'Lower Back', 'Upper Back', 'Middle Back', 'Neck', 
    'Left Side', 'Right Side', 'Tailbone', 'Between Shoulders',
    'Hip Area', 'Radiating to Legs'
  ];

  const commonTriggers = [
    'Sitting too long', 'Standing too long', 'Lifting heavy objects',
    'Poor posture', 'Stress', 'Weather changes', 'Lack of sleep',
    'Physical activity', 'Certain movements', 'Emotional stress'
  ];

  const commonSymptoms = [
    'Muscle spasms', 'Numbness', 'Tingling', 'Weakness',
    'Radiating pain', 'Stiffness', 'Swelling', 'Headache',
    'Fatigue', 'Sleep disturbance'
  ];

  const timeOfDayOptions = [
    { value: 'morning', label: 'Morning (6AM-12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM-6PM)' },
    { value: 'evening', label: 'Evening (6PM-12AM)' },
    { value: 'night', label: 'Night (12AM-6AM)' }
  ];

  // Initialize form with current time
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay = 'morning';
    
    if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 24) timeOfDay = 'evening';
    else if (hour >= 0 && hour < 6) timeOfDay = 'night';

    setPainEntry(prev => ({
      ...prev,
      timeOfDay
    }));
  }, [showAddForm]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newEntry = {
      id: editingEntry ? editingEntry.id : Date.now().toString(),
      ...painEntry,
      date: editingEntry ? editingEntry.date : new Date().toISOString(),
      timestamp: new Date().toISOString()
    };

    let updatedEntries;
    if (editingEntry) {
      updatedEntries = appData.painEntries.map(entry => 
        entry.id === editingEntry.id ? newEntry : entry
      );
    } else {
      updatedEntries = [...appData.painEntries, newEntry];
    }

    updateAppData({
      painEntries: updatedEntries
    });

    // Reset form
    setPainEntry({
      level: 5,
      location: '',
      type: '',
      triggers: [],
      symptoms: [],
      timeOfDay: 'morning',
      weather: '',
      activities: '',
      notes: '',
      photos: []
    });
    
    setShowAddForm(false);
    setEditingEntry(null);
  };

  // Handle editing
  const handleEdit = (entry) => {
    setPainEntry(entry);
    setEditingEntry(entry);
    setShowAddForm(true);
    setActiveView('log');
  };

  // Handle deletion
  const handleDelete = (entryId) => {
    if (window.confirm('Are you sure you want to delete this pain entry?')) {
      const updatedEntries = appData.painEntries.filter(entry => entry.id !== entryId);
      updateAppData({ painEntries: updatedEntries });
    }
  };

  // Filter entries
  const getFilteredEntries = () => {
    let filtered = [...appData.painEntries];

    if (filterDate) {
      const filterDay = new Date(filterDate);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startOfDay(filterDay) && entryDate <= endOfDay(filterDay);
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.triggers?.some(trigger => trigger.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Get analytics data
  const getAnalytics = () => {
    const entries = appData.painEntries;
    if (entries.length === 0) return null;

    const last30Days = entries.filter(entry => 
      new Date(entry.date) >= subDays(new Date(), 30)
    );

    const averagePain = entries.reduce((sum, entry) => sum + entry.level, 0) / entries.length;
    const last30Average = last30Days.length > 0 
      ? last30Days.reduce((sum, entry) => sum + entry.level, 0) / last30Days.length 
      : 0;

    const painTrend = last30Average > averagePain ? 'increasing' : 
                     last30Average < averagePain ? 'decreasing' : 'stable';

    // Most common locations, triggers, and times
    const locationCounts = {};
    const triggerCounts = {};
    const timeCounts = {};

    entries.forEach(entry => {
      if (entry.location) {
        locationCounts[entry.location] = (locationCounts[entry.location] || 0) + 1;
      }
      if (entry.timeOfDay) {
        timeCounts[entry.timeOfDay] = (timeCounts[entry.timeOfDay] || 0) + 1;
      }
      entry.triggers?.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
    });

    const mostCommonLocation = Object.keys(locationCounts).reduce((a, b) => 
      locationCounts[a] > locationCounts[b] ? a : b, ''
    );
    const mostCommonTrigger = Object.keys(triggerCounts).reduce((a, b) => 
      triggerCounts[a] > triggerCounts[b] ? a : b, ''
    );
    const mostCommonTime = Object.keys(timeCounts).reduce((a, b) => 
      timeCounts[a] > timeCounts[b] ? a : b, ''
    );

    return {
      totalEntries: entries.length,
      averagePain: Math.round(averagePain * 10) / 10,
      last30Average: Math.round(last30Average * 10) / 10,
      painTrend,
      mostCommonLocation,
      mostCommonTrigger,
      mostCommonTime,
      last30Days: last30Days.length
    };
  };

  const analytics = getAnalytics();
  const filteredEntries = getFilteredEntries();

  // Pain level visualization component
  const PainLevelSelector = () => (
    <div style={{ marginBottom: '24px' }}>
      <label className="form-label">Pain Level (1-10)</label>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(10, 1fr)', 
        gap: '8px',
        marginBottom: '12px'
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
          <button
            key={level}
            type="button"
            className={`pain-level-indicator pain-level-${level} ${painEntry.level === level ? 'selected' : ''}`}
            onClick={() => setPainEntry(prev => ({ ...prev, level }))}
            style={{
              width: '40px',
              height: '40px',
              border: painEntry.level === level ? '3px solid var(--primary-600)' : '2px solid transparent',
              cursor: 'pointer',
              transform: painEntry.level === level ? 'scale(1.1)' : 'scale(1)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {level}
          </button>
        ))}
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        fontSize: 'var(--font-size-sm)',
        color: 'var(--gray-600)'
      }}>
        <span>No Pain</span>
        <span>Severe Pain</span>
      </div>
    </div>
  );

  // Body diagram component (simplified)
  const BodyDiagram = () => (
    <div style={{ marginBottom: '24px' }}>
      <label className="form-label">Pain Location</label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '8px'
      }}>
        {painLocations.map(location => (
          <button
            key={location}
            type="button"
            className={`btn ${painEntry.location === location ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setPainEntry(prev => ({ ...prev, location }))}
            style={{ fontSize: 'var(--font-size-sm)' }}
          >
            {location}
          </button>
        ))}
      </div>
    </div>
  );

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
            <Activity size={28} style={{ color: 'var(--primary-600)' }} />
            Pain Tracking
          </h1>
          <p style={{ color: 'var(--gray-600)', margin: 0 }}>
            Monitor and log your pain levels to identify patterns
          </p>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm(true);
            setEditingEntry(null);
          }}
        >
          <Plus size={20} />
          Log Pain
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`nav-tab ${activeView === 'log' ? 'active' : ''}`}
          onClick={() => setActiveView('log')}
        >
          <Plus size={16} />
          Log Entry
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
          Analytics
        </button>
      </div>

      {/* Log Entry View */}
      {activeView === 'log' && (
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0 }}>
              {editingEntry ? 'Edit Pain Entry' : 'Log New Pain Entry'}
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Pain Level Selector */}
              <PainLevelSelector />

              {/* Body Diagram */}
              <BodyDiagram />

              {/* Pain Type */}
              <div className="form-group">
                <label className="form-label">Pain Type</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '8px'
                }}>
                  {painTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`btn ${painEntry.type === type ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setPainEntry(prev => ({ ...prev, type }))}
                      style={{ fontSize: 'var(--font-size-sm)' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time of Day */}
              <div className="form-group">
                <label className="form-label">Time of Day</label>
                <select
                  className="form-select"
                  value={painEntry.timeOfDay}
                  onChange={(e) => setPainEntry(prev => ({ ...prev, timeOfDay: e.target.value }))}
                >
                  {timeOfDayOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Triggers */}
              <div className="form-group">
                <label className="form-label">Possible Triggers</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '8px'
                }}>
                  {commonTriggers.map(trigger => (
                    <button
                      key={trigger}
                      type="button"
                      className={`btn ${painEntry.triggers.includes(trigger) ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        setPainEntry(prev => ({
                          ...prev,
                          triggers: prev.triggers.includes(trigger)
                            ? prev.triggers.filter(t => t !== trigger)
                            : [...prev.triggers, trigger]
                        }));
                      }}
                      style={{ fontSize: 'var(--font-size-sm)' }}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div className="form-group">
                <label className="form-label">Associated Symptoms</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '8px'
                }}>
                  {commonSymptoms.map(symptom => (
                    <button
                      key={symptom}
                      type="button"
                      className={`btn ${painEntry.symptoms.includes(symptom) ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        setPainEntry(prev => ({
                          ...prev,
                          symptoms: prev.symptoms.includes(symptom)
                            ? prev.symptoms.filter(s => s !== symptom)
                            : [...prev.symptoms, symptom]
                        }));
                      }}
                      style={{ fontSize: 'var(--font-size-sm)' }}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather */}
              <div className="form-group">
                <label className="form-label">Weather Conditions</label>
                <select
                  className="form-select"
                  value={painEntry.weather}
                  onChange={(e) => setPainEntry(prev => ({ ...prev, weather: e.target.value }))}
                >
                  <option value="">Select weather...</option>
                  <option value="sunny">Sunny</option>
                  <option value="cloudy">Cloudy</option>
                  <option value="rainy">Rainy</option>
                  <option value="stormy">Stormy</option>
                  <option value="cold">Cold</option>
                  <option value="hot">Hot</option>
                  <option value="humid">Humid</option>
                </select>
              </div>

              {/* Activities */}
              <div className="form-group">
                <label className="form-label">Recent Activities</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="What were you doing before the pain started?"
                  value={painEntry.activities}
                  onChange={(e) => setPainEntry(prev => ({ ...prev, activities: e.target.value }))}
                />
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Any additional details about your pain..."
                  value={painEntry.notes}
                  onChange={(e) => setPainEntry(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Form Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end',
                marginTop: '24px'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingEntry(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History View */}
      {activeView === 'history' && (
        <div>
          {/* Filters */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-body">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                alignItems: 'end'
              }}>
                <div className="form-group mb-0">
                  <label className="form-label">Filter by Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>
                
                <div className="form-group mb-0">
                  <label className="form-label">Search</label>
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
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setFilterDate('');
                      setSearchTerm('');
                    }}
                  >
                    <Filter size={16} />
                    Clear
                  </button>
                  <button className="btn btn-primary">
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Entries List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredEntries.length === 0 ? (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Activity size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                  <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Pain Entries Found</h3>
                  <p style={{ color: 'var(--gray-500)' }}>
                    {appData.painEntries.length === 0 
                      ? 'Start tracking your pain to see patterns and trends.'
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setActiveView('log');
                      setShowAddForm(true);
                    }}
                    style={{ marginTop: '16px' }}
                  >
                    <Plus size={16} />
                    Log Your First Entry
                  </button>
                </div>
              </div>
            ) : (
              filteredEntries.map(entry => (
                <div key={entry.id} className="card">
                  <div className="card-body">
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className={`pain-level-indicator pain-level-${entry.level}`}>
                          {entry.level}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, marginBottom: '4px' }}>
                            {entry.location || 'General Pain'}
                          </h3>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '16px',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--gray-600)'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={14} />
                              {format(new Date(entry.date), 'MMM d, yyyy')}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={14} />
                              {entry.timeOfDay}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Entry Details */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      {entry.type && (
                        <div>
                          <strong>Type:</strong> {entry.type}
                        </div>
                      )}
                      {entry.weather && (
                        <div>
                          <strong>Weather:</strong> {entry.weather}
                        </div>
                      )}
                      {entry.activities && (
                        <div>
                          <strong>Activities:</strong> {entry.activities}
                        </div>
                      )}
                    </div>

                    {/* Triggers */}
                    {entry.triggers && entry.triggers.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Triggers:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                          {entry.triggers.map((trigger, index) => (
                            <span key={index} className="badge badge-warning">
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Symptoms */}
                    {entry.symptoms && entry.symptoms.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Symptoms:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                          {entry.symptoms.map((symptom, index) => (
                            <span key={index} className="badge badge-error">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {entry.notes && (
                      <div>
                        <strong>Notes:</strong>
                        <p style={{ 
                          margin: '6px 0 0 0', 
                          color: 'var(--gray-700)',
                          fontStyle: 'italic'
                        }}>
                          {entry.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: 'var(--font-size-3xl)', 
                      fontWeight: '700',
                      color: 'var(--primary-600)',
                      marginBottom: '8px'
                    }}>
                      {analytics.totalEntries}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Total Entries</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: 'var(--font-size-3xl)', 
                      fontWeight: '700',
                      color: 'var(--warning)',
                      marginBottom: '8px'
                    }}>
                      {analytics.averagePain}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Average Pain Level</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        fontSize: 'var(--font-size-3xl)', 
                        fontWeight: '700',
                        color: analytics.painTrend === 'decreasing' ? 'var(--success)' : 
                               analytics.painTrend === 'increasing' ? 'var(--error)' : 'var(--gray-600)'
                      }}>
                        {analytics.last30Average}
                      </span>
                      {analytics.painTrend === 'decreasing' && <TrendingDown size={24} style={{ color: 'var(--success)' }} />}
                      {analytics.painTrend === 'increasing' && <TrendingUp size={24} style={{ color: 'var(--error)' }} />}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Last 30 Days Average</div>
                    <div style={{ 
                      fontSize: 'var(--font-size-sm)',
                      color: analytics.painTrend === 'decreasing' ? 'var(--success)' : 
                             analytics.painTrend === 'increasing' ? 'var(--error)' : 'var(--gray-500)',
                      marginTop: '4px'
                    }}>
                      {analytics.painTrend === 'decreasing' ? '↓ Improving' : 
                       analytics.painTrend === 'increasing' ? '↑ Worsening' : '→ Stable'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="card">
                <div className="card-header">
                  <h2 style={{ margin: 0 }}>Pain Insights</h2>
                </div>
                <div className="card-body">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                  }}>
                    <div>
                      <h4 style={{ marginBottom: '12px', color: 'var(--primary-600)' }}>
                        Most Common Location
                      </h4>
                      <div style={{ 
                        padding: '16px',
                        backgroundColor: 'var(--primary-50)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--primary-200)'
                      }}>
                        <MapPin size={20} style={{ color: 'var(--primary-600)', marginBottom: '8px' }} />
                        <div style={{ fontWeight: '600' }}>{analytics.mostCommonLocation || 'No data'}</div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ marginBottom: '12px', color: 'var(--warning)' }}>
                        Most Common Trigger
                      </h4>
                      <div style={{ 
                        padding: '16px',
                        backgroundColor: '#fef3c7',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid #fcd34d'
                      }}>
                        <Zap size={20} style={{ color: 'var(--warning)', marginBottom: '8px' }} />
                        <div style={{ fontWeight: '600' }}>{analytics.mostCommonTrigger || 'No data'}</div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ marginBottom: '12px', color: 'var(--secondary-600)' }}>
                        Most Common Time
                      </h4>
                      <div style={{ 
                        padding: '16px',
                        backgroundColor: 'var(--secondary-50)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--secondary-200)'
                      }}>
                        <Clock size={20} style={{ color: 'var(--secondary-600)', marginBottom: '8px' }} />
                        <div style={{ fontWeight: '600' }}>
                          {analytics.mostCommonTime ? 
                            timeOfDayOptions.find(opt => opt.value === analytics.mostCommonTime)?.label || analytics.mostCommonTime
                            : 'No data'
                          }
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
                <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Data Available</h3>
                <p style={{ color: 'var(--gray-500)' }}>
                  Start logging your pain entries to see analytics and insights.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveView('log')}
                  style={{ marginTop: '16px' }}
                >
                  <Plus size={16} />
                  Log Your First Entry
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PainTracking;