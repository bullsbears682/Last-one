import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit3,
  Trash2,
  Save,
  Search,
  Filter,
  Star,
  Heart,
  Stethoscope,
  Building,
  CreditCard,
  Bell,
  ChevronRight,
  Download,
  Upload
} from 'lucide-react';
import { format, startOfDay, endOfDay, addDays, isToday, isTomorrow, isBefore, isAfter, parseISO } from 'date-fns';

const AppointmentManager = ({ appData, updateAppData }) => {
  const [activeView, setActiveView] = useState('upcoming'); // 'upcoming', 'providers', 'add', 'history'
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingProvider, setEditingProvider] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    providerId: '',
    type: '',
    dateTime: '',
    duration: 60,
    location: '',
    notes: '',
    preparation: [],
    insurance: '',
    copay: '',
    referralRequired: false,
    followUp: false,
    virtual: false,
    status: 'scheduled'
  });

  // Provider form state
  const [providerForm, setProviderForm] = useState({
    name: '',
    specialty: '',
    practice: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    notes: '',
    preferredProvider: false,
    acceptedInsurance: [],
    rating: 5
  });

  const appointmentTypes = [
    'General Consultation',
    'Follow-up Visit',
    'Physical Therapy',
    'Pain Management',
    'Orthopedic Consultation',
    'MRI/Imaging',
    'Injection Treatment',
    'Surgical Consultation',
    'Chiropractic Treatment',
    'Massage Therapy',
    'Acupuncture',
    'Second Opinion'
  ];

  const specialties = [
    'Primary Care',
    'Orthopedic Surgery',
    'Pain Management',
    'Physical Therapy',
    'Neurology',
    'Rheumatology',
    'Chiropractic',
    'Massage Therapy',
    'Acupuncture',
    'Psychology/Counseling'
  ];

  const commonInsurances = [
    'Blue Cross Blue Shield',
    'Aetna',
    'Cigna',
    'UnitedHealthcare',
    'Medicare',
    'Medicaid',
    'Kaiser Permanente',
    'Humana',
    'Anthem',
    'Self-Pay'
  ];

  const preparationChecklists = {
    'General Consultation': [
      'Bring current medication list',
      'Prepare list of symptoms and when they started',
      'Bring previous medical records',
      'Write down questions to ask',
      'Bring insurance card and ID'
    ],
    'Physical Therapy': [
      'Wear comfortable, loose-fitting clothes',
      'Bring athletic shoes',
      'Complete intake forms',
      'Bring prescription/referral',
      'Plan for post-treatment rest'
    ],
    'Pain Management': [
      'Keep pain diary for past week',
      'List all current medications',
      'Bring imaging results (X-rays, MRI)',
      'Note pain triggers and patterns',
      'Prepare treatment history'
    ],
    'MRI/Imaging': [
      'Remove all metal objects',
      'Wear comfortable clothes without metal',
      'Arrive 30 minutes early',
      'Bring previous imaging for comparison',
      'Inform about claustrophobia if applicable'
    ]
  };

  // Get upcoming appointments
  const getUpcomingAppointments = () => {
    const now = new Date();
    return appData.appointments
      .filter(apt => new Date(apt.dateTime) > now)
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  };

  // Get past appointments
  const getPastAppointments = () => {
    const now = new Date();
    return appData.appointments
      .filter(apt => new Date(apt.dateTime) <= now)
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
  };

  // Handle appointment form submission
  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    
    const provider = appData.providers?.find(p => p.id === appointmentForm.providerId);
    const newAppointment = {
      id: editingAppointment ? editingAppointment.id : Date.now().toString(),
      ...appointmentForm,
      providerName: provider?.name || 'Unknown Provider',
      providerSpecialty: provider?.specialty || '',
      createdAt: editingAppointment ? editingAppointment.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedAppointments;
    if (editingAppointment) {
      updatedAppointments = appData.appointments.map(apt => 
        apt.id === editingAppointment.id ? newAppointment : apt
      );
    } else {
      updatedAppointments = [...(appData.appointments || []), newAppointment];
    }

    updateAppData({ appointments: updatedAppointments });

    // Reset form
    setAppointmentForm({
      providerId: '',
      type: '',
      dateTime: '',
      duration: 60,
      location: '',
      notes: '',
      preparation: [],
      insurance: '',
      copay: '',
      referralRequired: false,
      followUp: false,
      virtual: false,
      status: 'scheduled'
    });
    
    setShowAddForm(false);
    setEditingAppointment(null);
    setActiveView('upcoming');
  };

  // Handle provider form submission
  const handleProviderSubmit = (e) => {
    e.preventDefault();
    
    const newProvider = {
      id: editingProvider ? editingProvider.id : Date.now().toString(),
      ...providerForm,
      createdAt: editingProvider ? editingProvider.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedProviders;
    if (editingProvider) {
      updatedProviders = (appData.providers || []).map(provider => 
        provider.id === editingProvider.id ? newProvider : provider
      );
    } else {
      updatedProviders = [...(appData.providers || []), newProvider];
    }

    updateAppData({ providers: updatedProviders });

    // Reset form
    setProviderForm({
      name: '',
      specialty: '',
      practice: '',
      phone: '',
      email: '',
      address: '',
      website: '',
      notes: '',
      preferredProvider: false,
      acceptedInsurance: [],
      rating: 5
    });
    
    setEditingProvider(null);
  };

  // Handle editing
  const handleEditAppointment = (appointment) => {
    setAppointmentForm({
      ...appointment,
      dateTime: format(new Date(appointment.dateTime), "yyyy-MM-dd'T'HH:mm")
    });
    setEditingAppointment(appointment);
    setShowAddForm(true);
    setActiveView('add');
  };

  const handleEditProvider = (provider) => {
    setProviderForm(provider);
    setEditingProvider(provider);
  };

  // Handle deletion
  const handleDeleteAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      const updatedAppointments = appData.appointments.filter(apt => apt.id !== appointmentId);
      updateAppData({ appointments: updatedAppointments });
    }
  };

  const handleDeleteProvider = (providerId) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      const updatedProviders = (appData.providers || []).filter(provider => provider.id !== providerId);
      updateAppData({ providers: updatedProviders });
    }
  };

  // Update preparation checklist based on appointment type
  useEffect(() => {
    if (appointmentForm.type && preparationChecklists[appointmentForm.type]) {
      setAppointmentForm(prev => ({
        ...prev,
        preparation: preparationChecklists[appointmentForm.type]
      }));
    }
  }, [appointmentForm.type]);

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();

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
            <Calendar size={28} style={{ color: 'var(--primary-600)' }} />
            Appointment Manager
          </h1>
          <p style={{ color: 'var(--gray-600)', margin: 0 }}>
            Manage your healthcare appointments and provider information
          </p>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm(true);
            setActiveView('add');
            setEditingAppointment(null);
          }}
        >
          <Plus size={20} />
          Schedule Appointment
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`nav-tab ${activeView === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveView('upcoming')}
        >
          <Calendar size={16} />
          Upcoming ({upcomingAppointments.length})
        </button>
        <button
          className={`nav-tab ${activeView === 'providers' ? 'active' : ''}`}
          onClick={() => setActiveView('providers')}
        >
          <Stethoscope size={16} />
          Providers ({(appData.providers || []).length})
        </button>
        <button
          className={`nav-tab ${activeView === 'add' ? 'active' : ''}`}
          onClick={() => setActiveView('add')}
        >
          <Plus size={16} />
          {editingAppointment ? 'Edit' : 'New'} Appointment
        </button>
        <button
          className={`nav-tab ${activeView === 'history' ? 'active' : ''}`}
          onClick={() => setActiveView('history')}
        >
          <FileText size={16} />
          History ({pastAppointments.length})
        </button>
      </div>

      {/* Upcoming Appointments View */}
      {activeView === 'upcoming' && (
        <div>
          {upcomingAppointments.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Calendar size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Upcoming Appointments</h3>
                <p style={{ color: 'var(--gray-500)' }}>
                  Schedule your first appointment to start managing your healthcare.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveView('add')}
                  style={{ marginTop: '16px' }}
                >
                  <Plus size={16} />
                  Schedule Appointment
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {upcomingAppointments.map(appointment => {
                const appointmentDate = new Date(appointment.dateTime);
                const isToday = new Date().toDateString() === appointmentDate.toDateString();
                const isTomorrow = new Date(Date.now() + 86400000).toDateString() === appointmentDate.toDateString();
                
                return (
                  <div key={appointment.id} className="card">
                    <div className="card-body">
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0, color: 'var(--primary-600)' }}>
                              {appointment.type}
                            </h3>
                            {isToday && (
                              <span className="badge badge-error">Today</span>
                            )}
                            {isTomorrow && (
                              <span className="badge badge-warning">Tomorrow</span>
                            )}
                            {appointment.virtual && (
                              <span className="badge badge-primary">Virtual</span>
                            )}
                          </div>
                          
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '12px',
                            marginBottom: '16px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Stethoscope size={16} style={{ color: 'var(--gray-500)' }} />
                              <span>{appointment.providerName}</span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Calendar size={16} style={{ color: 'var(--gray-500)' }} />
                              <span>{format(appointmentDate, 'MMM d, yyyy')}</span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Clock size={16} style={{ color: 'var(--gray-500)' }} />
                              <span>{format(appointmentDate, 'h:mm a')} ({appointment.duration} min)</span>
                            </div>
                            
                            {appointment.location && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={16} style={{ color: 'var(--gray-500)' }} />
                                <span>{appointment.location}</span>
                              </div>
                            )}
                          </div>

                          {appointment.notes && (
                            <div style={{
                              padding: '12px',
                              backgroundColor: 'var(--primary-50)',
                              borderRadius: 'var(--border-radius)',
                              border: '1px solid var(--primary-200)',
                              marginBottom: '16px'
                            }}>
                              <strong>Notes:</strong> {appointment.notes}
                            </div>
                          )}

                          {appointment.preparation && appointment.preparation.length > 0 && (
                            <div>
                              <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: '8px', color: 'var(--secondary-600)' }}>
                                Preparation Checklist:
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {appointment.preparation.map((item, index) => (
                                  <label key={index} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: 'var(--font-size-sm)',
                                    cursor: 'pointer'
                                  }}>
                                    <input type="checkbox" />
                                    <span>{item}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Providers View */}
      {activeView === 'providers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Healthcare Providers</h2>
            <button
              className="btn btn-success"
              onClick={() => setEditingProvider({ id: null })}
            >
              <Plus size={16} />
              Add Provider
            </button>
          </div>

          {editingProvider && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header">
                <h3 style={{ margin: 0 }}>
                  {editingProvider.id ? 'Edit Provider' : 'Add New Provider'}
                </h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleProviderSubmit}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div className="form-group">
                      <label className="form-label">Provider Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Dr. Smith"
                        value={providerForm.name}
                        onChange={(e) => setProviderForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Specialty</label>
                      <select
                        className="form-select"
                        value={providerForm.specialty}
                        onChange={(e) => setProviderForm(prev => ({ ...prev, specialty: e.target.value }))}
                      >
                        <option value="">Select specialty...</option>
                        {specialties.map(specialty => (
                          <option key={specialty} value={specialty}>{specialty}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Practice/Clinic</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="City Medical Center"
                        value={providerForm.practice}
                        onChange={(e) => setProviderForm(prev => ({ ...prev, practice: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="(555) 123-4567"
                        value={providerForm.phone}
                        onChange={(e) => setProviderForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="doctor@clinic.com"
                        value={providerForm.email}
                        onChange={(e) => setProviderForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Website</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://clinic.com"
                        value={providerForm.website}
                        onChange={(e) => setProviderForm(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Rating</label>
                      <select
                        className="form-select"
                        value={providerForm.rating}
                        onChange={(e) => setProviderForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                      >
                        {[1, 2, 3, 4, 5].map(rating => (
                          <option key={rating} value={rating}>
                            {rating} Star{rating !== 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-textarea"
                      placeholder="123 Main St, City, State 12345"
                      value={providerForm.address}
                      onChange={(e) => setProviderForm(prev => ({ ...prev, address: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Accepted Insurance</label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '8px'
                    }}>
                      {commonInsurances.map(insurance => (
                        <button
                          key={insurance}
                          type="button"
                          className={`btn ${providerForm.acceptedInsurance.includes(insurance) ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => {
                            setProviderForm(prev => ({
                              ...prev,
                              acceptedInsurance: prev.acceptedInsurance.includes(insurance)
                                ? prev.acceptedInsurance.filter(ins => ins !== insurance)
                                : [...prev.acceptedInsurance, insurance]
                            }));
                          }}
                          style={{ fontSize: 'var(--font-size-sm)' }}
                        >
                          {insurance}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Additional notes about this provider..."
                      value={providerForm.notes}
                      onChange={(e) => setProviderForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={providerForm.preferredProvider}
                        onChange={(e) => setProviderForm(prev => ({ ...prev, preferredProvider: e.target.checked }))}
                      />
                      Mark as preferred provider
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingProvider(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success">
                      <Save size={16} />
                      {editingProvider.id ? 'Update' : 'Add'} Provider
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(appData.providers || []).length === 0 ? (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Stethoscope size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                  <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Providers Added</h3>
                  <p style={{ color: 'var(--gray-500)' }}>
                    Add your healthcare providers to manage appointments more easily.
                  </p>
                </div>
              </div>
            ) : (
              (appData.providers || []).map(provider => (
                <div key={provider.id} className="card">
                  <div className="card-body">
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0 }}>{provider.name}</h3>
                          {provider.preferredProvider && (
                            <Star size={16} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                style={{
                                  color: i < provider.rating ? 'var(--warning)' : 'var(--gray-300)',
                                  fill: i < provider.rating ? 'var(--warning)' : 'var(--gray-300)'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '12px',
                          marginBottom: '16px'
                        }}>
                          {provider.specialty && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Stethoscope size={16} style={{ color: 'var(--gray-500)' }} />
                              <span>{provider.specialty}</span>
                            </div>
                          )}
                          
                          {provider.practice && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Building size={16} style={{ color: 'var(--gray-500)' }} />
                              <span>{provider.practice}</span>
                            </div>
                          )}
                          
                          {provider.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Phone size={16} style={{ color: 'var(--gray-500)' }} />
                              <span>{provider.phone}</span>
                            </div>
                          )}
                          
                          {provider.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Mail size={16} style={{ color: 'var(--gray-500)' }} />
                              <span>{provider.email}</span>
                            </div>
                          )}
                        </div>

                        {provider.address && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            marginBottom: '12px'
                          }}>
                            <MapPin size={16} style={{ color: 'var(--gray-500)', marginTop: '2px' }} />
                            <span style={{ fontSize: 'var(--font-size-sm)' }}>{provider.address}</span>
                          </div>
                        )}

                        {provider.acceptedInsurance && provider.acceptedInsurance.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <strong style={{ fontSize: 'var(--font-size-sm)' }}>Accepted Insurance:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                              {provider.acceptedInsurance.map((insurance, index) => (
                                <span key={index} className="badge badge-primary">
                                  {insurance}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {provider.notes && (
                          <div style={{
                            padding: '12px',
                            backgroundColor: 'var(--gray-50)',
                            borderRadius: 'var(--border-radius)',
                            fontSize: 'var(--font-size-sm)',
                            fontStyle: 'italic'
                          }}>
                            {provider.notes}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditProvider(provider)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDeleteProvider(provider.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Appointment View */}
      {activeView === 'add' && (
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0 }}>
              {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleAppointmentSubmit}>
              {/* Basic Information */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div className="form-group">
                  <label className="form-label">Provider *</label>
                  <select
                    className="form-select"
                    value={appointmentForm.providerId}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, providerId: e.target.value }))}
                    required
                  >
                    <option value="">Select provider...</option>
                    {(appData.providers || []).map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name} - {provider.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Appointment Type *</label>
                  <select
                    className="form-select"
                    value={appointmentForm.type}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, type: e.target.value }))}
                    required
                  >
                    <option value="">Select type...</option>
                    {appointmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={appointmentForm.dateTime}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, dateTime: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <select
                    className="form-select"
                    value={appointmentForm.duration}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>

              {/* Location and Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Clinic address or 'Virtual'"
                    value={appointmentForm.location}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Insurance</label>
                  <select
                    className="form-select"
                    value={appointmentForm.insurance}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, insurance: e.target.value }))}
                  >
                    <option value="">Select insurance...</option>
                    {commonInsurances.map(insurance => (
                      <option key={insurance} value={insurance}>{insurance}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Copay</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="$25"
                    value={appointmentForm.copay}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, copay: e.target.value }))}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Additional notes for this appointment..."
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Preparation Checklist */}
              {appointmentForm.preparation.length > 0 && (
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Preparation Checklist</label>
                  <div style={{
                    padding: '16px',
                    backgroundColor: 'var(--secondary-50)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--secondary-200)'
                  }}>
                    {appointmentForm.preparation.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <CheckCircle size={16} style={{ color: 'var(--secondary-600)' }} />
                        <span style={{ fontSize: 'var(--font-size-sm)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Options */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={appointmentForm.virtual}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, virtual: e.target.checked }))}
                    />
                    Virtual appointment
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={appointmentForm.referralRequired}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, referralRequired: e.target.checked }))}
                    />
                    Referral required
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={appointmentForm.followUp}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, followUp: e.target.checked }))}
                    />
                    Follow-up appointment
                  </label>
                </div>
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
                    setEditingAppointment(null);
                    setActiveView('upcoming');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  {editingAppointment ? 'Update' : 'Schedule'} Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History View */}
      {activeView === 'history' && (
        <div>
          {pastAppointments.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <FileText size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Appointment History</h3>
                <p style={{ color: 'var(--gray-500)' }}>
                  Your completed appointments will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pastAppointments.map(appointment => (
                <div key={appointment.id} className="card">
                  <div className="card-body">
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, marginBottom: '8px', color: 'var(--gray-700)' }}>
                          {appointment.type}
                        </h3>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '12px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Stethoscope size={16} style={{ color: 'var(--gray-500)' }} />
                            <span>{appointment.providerName}</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} style={{ color: 'var(--gray-500)' }} />
                            <span>{format(new Date(appointment.dateTime), 'MMM d, yyyy')}</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} style={{ color: 'var(--gray-500)' }} />
                            <span>{format(new Date(appointment.dateTime), 'h:mm a')}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div style={{
                            padding: '12px',
                            backgroundColor: 'var(--gray-50)',
                            borderRadius: 'var(--border-radius)',
                            fontSize: 'var(--font-size-sm)',
                            fontStyle: 'italic'
                          }}>
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>

                      <span className="badge badge-success">Completed</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;