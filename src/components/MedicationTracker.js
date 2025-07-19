import React, { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Bell,
  Edit3,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Activity,
  Heart,
  Zap,
  FileText,
  Settings,
  Timer,
  Target
} from 'lucide-react';
import { format, startOfDay, endOfDay, addDays, isToday, isTomorrow, parseISO, addHours } from 'date-fns';
import useSound from '../hooks/useSound';

const MedicationTracker = ({ appData, updateAppData }) => {
  const { soundPresets } = useSound();
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'add', 'history', 'analytics'
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'taken', 'missed', 'upcoming'

  // Medication form state
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00'],
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    instructions: '',
    prescribedBy: '',
    purpose: '',
    sideEffects: [],
    color: '#3b82f6',
    reminderEnabled: true,
    withFood: false,
    notes: ''
  });

  const frequencyOptions = [
    { value: 'daily', label: 'Daily', times: 1 },
    { value: 'twice-daily', label: 'Twice Daily', times: 2 },
    { value: 'three-times', label: 'Three Times Daily', times: 3 },
    { value: 'four-times', label: 'Four Times Daily', times: 4 },
    { value: 'weekly', label: 'Weekly', times: 1 },
    { value: 'as-needed', label: 'As Needed', times: 0 }
  ];

  const commonSideEffects = [
    'Drowsiness', 'Nausea', 'Headache', 'Dizziness', 'Dry mouth',
    'Constipation', 'Diarrhea', 'Fatigue', 'Insomnia', 'Appetite changes',
    'Stomach upset', 'Rash', 'Weight gain', 'Weight loss', 'Mood changes'
  ];

  const medicationColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  // Initialize times based on frequency
  useEffect(() => {
    const frequency = frequencyOptions.find(f => f.value === medicationForm.frequency);
    if (frequency && frequency.times > 0) {
      const newTimes = [];
      const interval = 24 / frequency.times;
      
      for (let i = 0; i < frequency.times; i++) {
        const hour = Math.floor(8 + (i * interval));
        newTimes.push(`${hour.toString().padStart(2, '0')}:00`);
      }
      
      setMedicationForm(prev => ({ ...prev, times: newTimes }));
    } else if (frequency && frequency.value === 'as-needed') {
      setMedicationForm(prev => ({ ...prev, times: [] }));
    }
  }, [medicationForm.frequency]);

  // Get today's medication schedule
  const getTodaySchedule = () => {
    const today = new Date();
    const schedule = [];

    appData.medications.forEach(medication => {
      if (!medication.schedule || !medication.schedule.times) return;

      medication.schedule.times.forEach(time => {
        const [hours, minutes] = time.split(':');
        const scheduledTime = new Date(today);
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Check if dose was taken
        const doseTaken = medication.dosageHistory?.some(dose => {
          const doseTime = new Date(dose.timestamp);
          return isToday(doseTime) && 
                 Math.abs(doseTime.getTime() - scheduledTime.getTime()) < 30 * 60 * 1000; // Within 30 minutes
        });

        schedule.push({
          medicationId: medication.id,
          medicationName: medication.name,
          dosage: medication.dosage,
          time: scheduledTime,
          taken: doseTaken,
          overdue: scheduledTime < new Date() && !doseTaken,
          color: medication.color || '#3b82f6',
          withFood: medication.withFood,
          instructions: medication.instructions
        });
      });
    });

    return schedule.sort((a, b) => a.time - b.time);
  };

  // Mark dose as taken
  const markDoseTaken = (medicationId, scheduledTime, notes = '') => {
    const medication = appData.medications.find(m => m.id === medicationId);
    if (!medication) return;

    const doseRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      scheduledTime: scheduledTime.toISOString(),
      dosage: medication.dosage,
      notes: notes,
      sideEffects: []
    };

    const updatedMedications = appData.medications.map(med => {
      if (med.id === medicationId) {
        return {
          ...med,
          dosageHistory: [...(med.dosageHistory || []), doseRecord],
          lastTaken: new Date().toISOString()
        };
      }
      return med;
    });

    updateAppData({ medications: updatedMedications });
    
    // Play success sound when medication is taken
    soundPresets.success();
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newMedication = {
      id: editingMedication ? editingMedication.id : Date.now().toString(),
      ...medicationForm,
      schedule: {
        frequency: medicationForm.frequency,
        times: medicationForm.times,
        startDate: medicationForm.startDate,
        endDate: medicationForm.endDate
      },
      createdAt: editingMedication ? editingMedication.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dosageHistory: editingMedication ? editingMedication.dosageHistory || [] : [],
      isActive: true
    };

    let updatedMedications;
    if (editingMedication) {
      updatedMedications = appData.medications.map(med => 
        med.id === editingMedication.id ? newMedication : med
      );
    } else {
      updatedMedications = [...appData.medications, newMedication];
    }

    updateAppData({ medications: updatedMedications });

    // Reset form
    setMedicationForm({
      name: '',
      dosage: '',
      frequency: 'daily',
      times: ['08:00'],
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      instructions: '',
      prescribedBy: '',
      purpose: '',
      sideEffects: [],
      color: '#3b82f6',
      reminderEnabled: true,
      withFood: false,
      notes: ''
    });
    
    setShowAddForm(false);
    setEditingMedication(null);
    setActiveView('overview');
  };

  // Handle editing
  const handleEdit = (medication) => {
    setMedicationForm({
      ...medication,
      times: medication.schedule?.times || ['08:00'],
      frequency: medication.schedule?.frequency || 'daily',
      startDate: medication.schedule?.startDate || format(new Date(), 'yyyy-MM-dd'),
      endDate: medication.schedule?.endDate || ''
    });
    setEditingMedication(medication);
    setShowAddForm(true);
    setActiveView('add');
  };

  // Handle deletion
  const handleDelete = (medicationId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      const updatedMedications = appData.medications.filter(med => med.id !== medicationId);
      updateAppData({ medications: updatedMedications });
    }
  };

  // Get analytics
  const getAnalytics = () => {
    if (appData.medications.length === 0) return null;

    const allDoses = appData.medications.reduce((acc, medication) => {
      return acc.concat(medication.dosageHistory || []);
    }, []);

    const last30Days = allDoses.filter(dose => 
      new Date(dose.timestamp) >= addDays(new Date(), -30)
    );

    const totalDoses = allDoses.length;
    const last30Doses = last30Days.length;
    
    // Calculate adherence rate
    const scheduledDoses = appData.medications.reduce((total, medication) => {
      if (!medication.schedule?.times) return total;
      const daysSinceStart = Math.max(1, Math.floor((new Date() - new Date(medication.schedule.startDate)) / (1000 * 60 * 60 * 24)));
      return total + (medication.schedule.times.length * Math.min(daysSinceStart, 30));
    }, 0);

    const adherenceRate = scheduledDoses > 0 ? Math.round((last30Doses / scheduledDoses) * 100) : 0;

    // Most common side effects
    const sideEffectCounts = {};
    allDoses.forEach(dose => {
      dose.sideEffects?.forEach(effect => {
        sideEffectCounts[effect] = (sideEffectCounts[effect] || 0) + 1;
      });
    });

    const mostCommonSideEffect = Object.keys(sideEffectCounts).reduce((a, b) => 
      sideEffectCounts[a] > sideEffectCounts[b] ? a : b, ''
    );

    return {
      totalMedications: appData.medications.length,
      totalDoses,
      last30Doses,
      adherenceRate,
      mostCommonSideEffect: mostCommonSideEffect || 'None reported',
      averageDosesPerDay: Math.round(last30Doses / 30)
    };
  };

  const todaySchedule = getTodaySchedule();
  const analytics = getAnalytics();

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
            <Pill size={28} style={{ color: 'var(--warning)' }} />
            Medication Tracker
          </h1>
          <p style={{ color: 'var(--gray-600)', margin: 0 }}>
            Manage your medications and track adherence
          </p>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm(true);
            setActiveView('add');
            setEditingMedication(null);
          }}
        >
          <Plus size={20} />
          Add Medication
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`nav-tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          <Activity size={16} />
          Today's Schedule
        </button>
        <button
          className={`nav-tab ${activeView === 'medications' ? 'active' : ''}`}
          onClick={() => setActiveView('medications')}
        >
          <Pill size={16} />
          My Medications
        </button>
        <button
          className={`nav-tab ${activeView === 'add' ? 'active' : ''}`}
          onClick={() => setActiveView('add')}
        >
          <Plus size={16} />
          {editingMedication ? 'Edit' : 'Add'} Medication
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

      {/* Today's Schedule View */}
      {activeView === 'overview' && (
        <div>
          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <CheckCircle size={32} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--success)',
                  marginBottom: '4px'
                }}>
                  {todaySchedule.filter(dose => dose.taken).length}
                </div>
                <div style={{ color: 'var(--gray-600)' }}>Doses Taken</div>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <AlertCircle size={32} style={{ color: 'var(--error)', marginBottom: '8px' }} />
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--error)',
                  marginBottom: '4px'
                }}>
                  {todaySchedule.filter(dose => dose.overdue).length}
                </div>
                <div style={{ color: 'var(--gray-600)' }}>Overdue</div>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <Clock size={32} style={{ color: 'var(--primary-600)', marginBottom: '8px' }} />
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--primary-600)',
                  marginBottom: '4px'
                }}>
                  {todaySchedule.filter(dose => !dose.taken && !dose.overdue).length}
                </div>
                <div style={{ color: 'var(--gray-600)' }}>Upcoming</div>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <Target size={32} style={{ color: 'var(--warning)', marginBottom: '8px' }} />
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--warning)',
                  marginBottom: '4px'
                }}>
                  {analytics ? `${analytics.adherenceRate}%` : '0%'}
                </div>
                <div style={{ color: 'var(--gray-600)' }}>Adherence Rate</div>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ margin: 0 }}>Today's Medication Schedule</h2>
            </div>
            <div className="card-body">
              {todaySchedule.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Pill size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                  <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Medications Scheduled</h3>
                  <p style={{ color: 'var(--gray-500)' }}>
                    Add your medications to start tracking your schedule.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveView('add')}
                    style={{ marginTop: '16px' }}
                  >
                    <Plus size={16} />
                    Add First Medication
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {todaySchedule.map((dose, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: dose.taken ? 'var(--success)' + '10' : 
                                     dose.overdue ? 'var(--error)' + '10' : 'var(--gray-50)',
                      borderRadius: 'var(--border-radius)',
                      border: `1px solid ${dose.taken ? 'var(--success)' : 
                                          dose.overdue ? 'var(--error)' : 'var(--gray-200)'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: dose.color
                        }} />
                        
                        <div>
                          <h4 style={{ margin: 0, marginBottom: '4px' }}>
                            {dose.medicationName}
                          </h4>
                          <div style={{ 
                            fontSize: 'var(--font-size-sm)', 
                            color: 'var(--gray-600)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <span>{dose.dosage}</span>
                            <span>•</span>
                            <span>{format(dose.time, 'h:mm a')}</span>
                            {dose.withFood && (
                              <>
                                <span>•</span>
                                <span>With food</span>
                              </>
                            )}
                          </div>
                          {dose.instructions && (
                            <div style={{ 
                              fontSize: 'var(--font-size-xs)', 
                              color: 'var(--gray-500)',
                              marginTop: '4px',
                              fontStyle: 'italic'
                            }}>
                              {dose.instructions}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {dose.taken ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--success)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: '500'
                          }}>
                            <CheckCircle size={16} />
                            Taken
                          </div>
                        ) : dose.overdue ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--error)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: '500'
                          }}>
                            <AlertCircle size={16} />
                            Overdue
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--primary-600)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: '500'
                          }}>
                            <Clock size={16} />
                            Upcoming
                          </div>
                        )}

                        {!dose.taken && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => markDoseTaken(dose.medicationId, dose.time)}
                          >
                            <CheckCircle size={14} />
                            Mark Taken
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* My Medications View */}
      {activeView === 'medications' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appData.medications.length === 0 ? (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Pill size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                  <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Medications Added</h3>
                  <p style={{ color: 'var(--gray-500)' }}>
                    Start by adding your medications to track your schedule.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveView('add')}
                    style={{ marginTop: '16px' }}
                  >
                    <Plus size={16} />
                    Add Your First Medication
                  </button>
                </div>
              </div>
            ) : (
              appData.medications.map(medication => (
                <div key={medication.id} className="card">
                  <div className="card-body">
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: medication.color || '#3b82f6'
                        }} />
                        
                        <div>
                          <h3 style={{ margin: 0, marginBottom: '4px' }}>
                            {medication.name}
                          </h3>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--gray-600)'
                          }}>
                            <span>{medication.dosage}</span>
                            <span>•</span>
                            <span style={{ textTransform: 'capitalize' }}>
                              {medication.schedule?.frequency?.replace('-', ' ') || 'As needed'}
                            </span>
                            {medication.schedule?.times && (
                              <>
                                <span>•</span>
                                <span>{medication.schedule.times.join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(medication)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDelete(medication.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Medication Details */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      {medication.purpose && (
                        <div>
                          <strong>Purpose:</strong> {medication.purpose}
                        </div>
                      )}
                      {medication.prescribedBy && (
                        <div>
                          <strong>Prescribed by:</strong> {medication.prescribedBy}
                        </div>
                      )}
                      {medication.schedule?.startDate && (
                        <div>
                          <strong>Started:</strong> {format(new Date(medication.schedule.startDate), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>

                    {/* Instructions */}
                    {medication.instructions && (
                      <div style={{
                        padding: '12px',
                        backgroundColor: 'var(--primary-50)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--primary-200)',
                        marginBottom: '12px'
                      }}>
                        <strong>Instructions:</strong> {medication.instructions}
                      </div>
                    )}

                    {/* Side Effects */}
                    {medication.sideEffects && medication.sideEffects.length > 0 && (
                      <div>
                        <strong>Potential Side Effects:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                          {medication.sideEffects.map((effect, index) => (
                            <span key={index} className="badge badge-warning">
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Medication View */}
      {activeView === 'add' && (
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0 }}>
              {editingMedication ? 'Edit Medication' : 'Add New Medication'}
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div className="form-group">
                  <label className="form-label">Medication Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Ibuprofen"
                    value={medicationForm.name}
                    onChange={(e) => setMedicationForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dosage *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., 200mg, 1 tablet"
                    value={medicationForm.dosage}
                    onChange={(e) => setMedicationForm(prev => ({ ...prev, dosage: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Frequency *</label>
                  <select
                    className="form-select"
                    value={medicationForm.frequency}
                    onChange={(e) => setMedicationForm(prev => ({ ...prev, frequency: e.target.value }))}
                    required
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {medicationColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: medicationForm.color === color ? '3px solid var(--gray-800)' : '2px solid var(--gray-300)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setMedicationForm(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Schedule Times */}
              {medicationForm.frequency !== 'as-needed' && (
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Schedule Times</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {medicationForm.times.map((time, index) => (
                      <input
                        key={index}
                        type="time"
                        className="form-input"
                        style={{ width: 'auto' }}
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...medicationForm.times];
                          newTimes[index] = e.target.value;
                          setMedicationForm(prev => ({ ...prev, times: newTimes }));
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Date Range */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={medicationForm.startDate}
                    onChange={(e) => setMedicationForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date (Optional)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={medicationForm.endDate}
                    onChange={(e) => setMedicationForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div className="form-group">
                  <label className="form-label">Purpose</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Back pain relief"
                    value={medicationForm.purpose}
                    onChange={(e) => setMedicationForm(prev => ({ ...prev, purpose: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Prescribed By</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Dr. Smith"
                    value={medicationForm.prescribedBy}
                    onChange={(e) => setMedicationForm(prev => ({ ...prev, prescribedBy: e.target.value }))}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Instructions</label>
                <textarea
                  className="form-textarea"
                  placeholder="Special instructions for taking this medication..."
                  value={medicationForm.instructions}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Side Effects */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Potential Side Effects</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '8px'
                }}>
                  {commonSideEffects.map(effect => (
                    <button
                      key={effect}
                      type="button"
                      className={`btn ${medicationForm.sideEffects.includes(effect) ? 'btn-warning' : 'btn-secondary'}`}
                      onClick={() => {
                        setMedicationForm(prev => ({
                          ...prev,
                          sideEffects: prev.sideEffects.includes(effect)
                            ? prev.sideEffects.filter(e => e !== effect)
                            : [...prev.sideEffects, effect]
                        }));
                      }}
                      style={{ fontSize: 'var(--font-size-sm)' }}
                    >
                      {effect}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={medicationForm.withFood}
                      onChange={(e) => setMedicationForm(prev => ({ ...prev, withFood: e.target.checked }))}
                    />
                    Take with food
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={medicationForm.reminderEnabled}
                      onChange={(e) => setMedicationForm(prev => ({ ...prev, reminderEnabled: e.target.checked }))}
                    />
                    Enable reminders
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Additional notes about this medication..."
                  value={medicationForm.notes}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Form Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMedication(null);
                    setActiveView('medications');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  {editingMedication ? 'Update' : 'Add'} Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History View */}
      {activeView === 'history' && (
        <div>
          {appData.medications.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Calendar size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Medication History</h3>
                <p style={{ color: 'var(--gray-500)' }}>
                  Add medications and start tracking to see your history.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {appData.medications
                .filter(med => med.dosageHistory && med.dosageHistory.length > 0)
                .map(medication => (
                  <div key={medication.id} className="card">
                    <div className="card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: medication.color || '#3b82f6'
                        }} />
                        <h3 style={{ margin: 0 }}>{medication.name}</h3>
                      </div>
                    </div>
                    <div className="card-body">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {medication.dosageHistory
                          .slice(-10) // Show last 10 doses
                          .reverse()
                          .map((dose, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px',
                              backgroundColor: 'var(--success)' + '10',
                              borderRadius: 'var(--border-radius)',
                              border: '1px solid var(--success)'
                            }}>
                              <div>
                                <div style={{ fontWeight: '500' }}>
                                  {dose.dosage}
                                </div>
                                <div style={{ 
                                  fontSize: 'var(--font-size-sm)', 
                                  color: 'var(--gray-600)' 
                                }}>
                                  {format(new Date(dose.timestamp), 'MMM d, yyyy h:mm a')}
                                </div>
                                {dose.notes && (
                                  <div style={{ 
                                    fontSize: 'var(--font-size-sm)', 
                                    color: 'var(--gray-600)',
                                    fontStyle: 'italic',
                                    marginTop: '4px'
                                  }}>
                                    {dose.notes}
                                  </div>
                                )}
                              </div>
                              <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                            </div>
                          ))}
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
                    <Pill size={32} style={{ color: 'var(--warning)', marginBottom: '8px' }} />
                    <div style={{
                      fontSize: 'var(--font-size-3xl)',
                      fontWeight: '700',
                      color: 'var(--warning)',
                      marginBottom: '4px'
                    }}>
                      {analytics.totalMedications}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Active Medications</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <Activity size={32} style={{ color: 'var(--primary-600)', marginBottom: '8px' }} />
                    <div style={{
                      fontSize: 'var(--font-size-3xl)',
                      fontWeight: '700',
                      color: 'var(--primary-600)',
                      marginBottom: '4px'
                    }}>
                      {analytics.totalDoses}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Total Doses</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <Target size={32} style={{ 
                      color: analytics.adherenceRate >= 80 ? 'var(--success)' : 
                             analytics.adherenceRate >= 60 ? 'var(--warning)' : 'var(--error)',
                      marginBottom: '8px' 
                    }} />
                    <div style={{
                      fontSize: 'var(--font-size-3xl)',
                      fontWeight: '700',
                      color: analytics.adherenceRate >= 80 ? 'var(--success)' : 
                             analytics.adherenceRate >= 60 ? 'var(--warning)' : 'var(--error)',
                      marginBottom: '4px'
                    }}>
                      {analytics.adherenceRate}%
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Adherence Rate</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <TrendingUp size={32} style={{ color: 'var(--secondary-600)', marginBottom: '8px' }} />
                    <div style={{
                      fontSize: 'var(--font-size-3xl)',
                      fontWeight: '700',
                      color: 'var(--secondary-600)',
                      marginBottom: '4px'
                    }}>
                      {analytics.averageDosesPerDay}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Daily Average</div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="card">
                <div className="card-header">
                  <h2 style={{ margin: 0 }}>Medication Insights</h2>
                </div>
                <div className="card-body">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                  }}>
                    <div>
                      <h4 style={{ marginBottom: '12px', color: 'var(--primary-600)' }}>
                        Adherence Status
                      </h4>
                      <div style={{
                        padding: '16px',
                        backgroundColor: analytics.adherenceRate >= 80 ? 'var(--success)' + '10' : 
                                         analytics.adherenceRate >= 60 ? 'var(--warning)' + '10' : 'var(--error)' + '10',
                        borderRadius: 'var(--border-radius)',
                        border: `1px solid ${analytics.adherenceRate >= 80 ? 'var(--success)' : 
                                             analytics.adherenceRate >= 60 ? 'var(--warning)' : 'var(--error)'}`
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {analytics.adherenceRate >= 80 ? 'Excellent' : 
                           analytics.adherenceRate >= 60 ? 'Good' : 'Needs Improvement'}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                          {analytics.adherenceRate >= 80 ? 'Keep up the great work!' : 
                           analytics.adherenceRate >= 60 ? 'Try to maintain consistency' : 'Consider setting more reminders'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ marginBottom: '12px', color: 'var(--warning)' }}>
                        Side Effects
                      </h4>
                      <div style={{
                        padding: '16px',
                        backgroundColor: '#fef3c7',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid #fcd34d'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {analytics.mostCommonSideEffect}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                          Most reported side effect
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ marginBottom: '12px', color: 'var(--secondary-600)' }}>
                        Recent Activity
                      </h4>
                      <div style={{
                        padding: '16px',
                        backgroundColor: 'var(--secondary-50)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--secondary-200)'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {analytics.last30Doses} doses
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                          Taken in last 30 days
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
                  Add medications and start tracking to see your analytics.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveView('add')}
                  style={{ marginTop: '16px' }}
                >
                  <Plus size={16} />
                  Add Medication
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicationTracker;