import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  FileText,
  Share2,
  Filter,
  Eye,
  Activity,
  Target,
  Award,
  Clock,
  Heart,
  Zap,
  AlertCircle,
  CheckCircle,
  Users,
  Pill,
  Dumbbell,
  BookOpen,
  Settings,
  RefreshCw,
  Printer,
  Mail
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, isWithinInterval, parseISO } from 'date-fns';

const ReportsAnalytics = ({ appData, updateAppData }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'pain', 'exercise', 'medication', 'reports'
  const [timeRange, setTimeRange] = useState('30days'); // '7days', '30days', '3months', '6months', '1year'
  const [selectedMetrics, setSelectedMetrics] = useState(['pain', 'exercise', 'medication']);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const chartRef = useRef(null);

  const timeRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' }
  ];

  const availableMetrics = [
    { id: 'pain', label: 'Pain Tracking', icon: Heart, color: 'var(--error)' },
    { id: 'exercise', label: 'Exercise Activity', icon: Dumbbell, color: 'var(--secondary-600)' },
    { id: 'medication', label: 'Medication Adherence', icon: Pill, color: 'var(--warning)' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, color: 'var(--primary-600)' }
  ];

  // Get date range based on selection
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case '3months':
        return { start: subMonths(now, 3), end: now };
      case '6months':
        return { start: subMonths(now, 6), end: now };
      case '1year':
        return { start: subMonths(now, 12), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  // Filter data by date range
  const filterDataByRange = (data, dateField = 'timestamp') => {
    const { start, end } = getDateRange();
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return isWithinInterval(itemDate, { start, end });
    });
  };

  // Get pain analytics
  const getPainAnalytics = () => {
    const painEntries = filterDataByRange(appData.painEntries || []);
    
    if (painEntries.length === 0) return null;

    const avgPainLevel = painEntries.reduce((sum, entry) => sum + entry.level, 0) / painEntries.length;
    const maxPainLevel = Math.max(...painEntries.map(entry => entry.level));
    const minPainLevel = Math.min(...painEntries.map(entry => entry.level));
    
    // Pain trends
    const sortedEntries = painEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const recentEntries = sortedEntries.slice(-7);
    const olderEntries = sortedEntries.slice(-14, -7);
    
    const recentAvg = recentEntries.length > 0 ? 
      recentEntries.reduce((sum, entry) => sum + entry.level, 0) / recentEntries.length : 0;
    const olderAvg = olderEntries.length > 0 ? 
      olderEntries.reduce((sum, entry) => sum + entry.level, 0) / olderEntries.length : 0;
    
    const trend = recentAvg > olderAvg ? 'increasing' : recentAvg < olderAvg ? 'decreasing' : 'stable';
    
    // Common triggers
    const triggerCounts = {};
    painEntries.forEach(entry => {
      entry.triggers?.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
    });
    
    const topTriggers = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([trigger, count]) => ({ trigger, count }));

    // Pain by time of day
    const timeOfDayData = {};
    painEntries.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      const timeOfDay = hour < 6 ? 'Night' : 
                       hour < 12 ? 'Morning' : 
                       hour < 18 ? 'Afternoon' : 'Evening';
      
      if (!timeOfDayData[timeOfDay]) {
        timeOfDayData[timeOfDay] = { total: 0, count: 0 };
      }
      timeOfDayData[timeOfDay].total += entry.level;
      timeOfDayData[timeOfDay].count += 1;
    });

    const timeOfDayAnalysis = Object.entries(timeOfDayData).map(([time, data]) => ({
      time,
      avgPain: data.total / data.count
    })).sort((a, b) => b.avgPain - a.avgPain);

    return {
      totalEntries: painEntries.length,
      avgPainLevel: Math.round(avgPainLevel * 10) / 10,
      maxPainLevel,
      minPainLevel,
      trend,
      trendValue: Math.round((recentAvg - olderAvg) * 10) / 10,
      topTriggers,
      timeOfDayAnalysis,
      entriesThisWeek: painEntries.filter(entry => 
        isWithinInterval(new Date(entry.timestamp), {
          start: startOfWeek(new Date()),
          end: endOfWeek(new Date())
        })
      ).length
    };
  };

  // Get exercise analytics
  const getExerciseAnalytics = () => {
    const exercises = appData.exercises || [];
    const allSessions = exercises.reduce((acc, exercise) => {
      return acc.concat((exercise.completedSessions || []).map(session => ({
        ...session,
        exerciseName: exercise.name,
        exerciseCategory: exercise.category
      })));
    }, []);

    const filteredSessions = filterDataByRange(allSessions, 'completedAt');
    
    if (filteredSessions.length === 0) return null;

    const totalSessions = filteredSessions.length;
    const totalMinutes = Math.round(filteredSessions.reduce((sum, session) => sum + session.duration, 0) / 60);
    const totalCalories = filteredSessions.reduce((sum, session) => sum + session.caloriesBurned, 0);
    
    // Category breakdown
    const categoryData = {};
    filteredSessions.forEach(session => {
      const category = session.exerciseCategory || 'Unknown';
      if (!categoryData[category]) {
        categoryData[category] = { sessions: 0, minutes: 0, calories: 0 };
      }
      categoryData[category].sessions += 1;
      categoryData[category].minutes += Math.round(session.duration / 60);
      categoryData[category].calories += session.caloriesBurned;
    });

    const topCategories = Object.entries(categoryData)
      .sort(([,a], [,b]) => b.sessions - a.sessions)
      .slice(0, 5)
      .map(([category, data]) => ({ category, ...data }));

    // Weekly consistency
    const weeksInRange = Math.ceil((getDateRange().end - getDateRange().start) / (7 * 24 * 60 * 60 * 1000));
    const avgSessionsPerWeek = Math.round(totalSessions / weeksInRange);

    // Most popular exercises
    const exerciseCounts = {};
    filteredSessions.forEach(session => {
      exerciseCounts[session.exerciseName] = (exerciseCounts[session.exerciseName] || 0) + 1;
    });

    const topExercises = Object.entries(exerciseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([exercise, count]) => ({ exercise, count }));

    return {
      totalSessions,
      totalMinutes,
      totalCalories,
      avgSessionsPerWeek,
      topCategories,
      topExercises,
      avgSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      sessionsThisWeek: filteredSessions.filter(session => 
        isWithinInterval(new Date(session.completedAt), {
          start: startOfWeek(new Date()),
          end: endOfWeek(new Date())
        })
      ).length
    };
  };

  // Get medication analytics
  const getMedicationAnalytics = () => {
    const medications = appData.medications || [];
    const allDoses = medications.reduce((acc, medication) => {
      return acc.concat((medication.dosageHistory || []).map(dose => ({
        ...dose,
        medicationName: medication.name,
        medicationId: medication.id
      })));
    }, []);

    const filteredDoses = filterDataByRange(allDoses);
    
    if (filteredDoses.length === 0) return null;

    // Calculate adherence rate
    const { start, end } = getDateRange();
    const daysInRange = Math.ceil((end - start) / (24 * 60 * 60 * 1000));
    
    const expectedDoses = medications.reduce((total, medication) => {
      if (!medication.schedule?.times) return total;
      const medicationDays = Math.min(daysInRange, 
        Math.ceil((new Date() - new Date(medication.schedule.startDate)) / (24 * 60 * 60 * 1000))
      );
      return total + (medication.schedule.times.length * medicationDays);
    }, 0);

    const adherenceRate = expectedDoses > 0 ? Math.round((filteredDoses.length / expectedDoses) * 100) : 0;

    // Medication breakdown
    const medicationData = {};
    filteredDoses.forEach(dose => {
      const medName = dose.medicationName;
      if (!medicationData[medName]) {
        medicationData[medName] = { doses: 0, onTime: 0 };
      }
      medicationData[medName].doses += 1;
      
      // Check if dose was taken on time (within 30 minutes of scheduled time)
      const scheduledTime = new Date(dose.scheduledTime);
      const actualTime = new Date(dose.timestamp);
      const timeDiff = Math.abs(actualTime - scheduledTime) / (1000 * 60); // minutes
      if (timeDiff <= 30) {
        medicationData[medName].onTime += 1;
      }
    });

    const medicationStats = Object.entries(medicationData).map(([name, data]) => ({
      name,
      doses: data.doses,
      onTimeRate: Math.round((data.onTime / data.doses) * 100)
    }));

    // Side effects tracking
    const sideEffectCounts = {};
    filteredDoses.forEach(dose => {
      dose.sideEffects?.forEach(effect => {
        sideEffectCounts[effect] = (sideEffectCounts[effect] || 0) + 1;
      });
    });

    const topSideEffects = Object.entries(sideEffectCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([effect, count]) => ({ effect, count }));

    return {
      totalDoses: filteredDoses.length,
      adherenceRate,
      medicationStats,
      topSideEffects,
      avgDosesPerDay: Math.round(filteredDoses.length / daysInRange),
      activeMedications: medications.length,
      dosesThisWeek: filteredDoses.filter(dose => 
        isWithinInterval(new Date(dose.timestamp), {
          start: startOfWeek(new Date()),
          end: endOfWeek(new Date())
        })
      ).length
    };
  };

  // Get appointment analytics
  const getAppointmentAnalytics = () => {
    const appointments = filterDataByRange(appData.appointments || [], 'dateTime');
    
    if (appointments.length === 0) return null;

    const upcomingAppointments = appointments.filter(apt => new Date(apt.dateTime) > new Date()).length;
    const completedAppointments = appointments.filter(apt => new Date(apt.dateTime) <= new Date()).length;

    // Appointment types
    const typeCounts = {};
    appointments.forEach(appointment => {
      typeCounts[appointment.type] = (typeCounts[appointment.type] || 0) + 1;
    });

    const topTypes = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    // Provider breakdown
    const providerCounts = {};
    appointments.forEach(appointment => {
      const provider = appointment.providerName || 'Unknown';
      providerCounts[provider] = (providerCounts[provider] || 0) + 1;
    });

    const topProviders = Object.entries(providerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([provider, count]) => ({ provider, count }));

    return {
      totalAppointments: appointments.length,
      upcomingAppointments,
      completedAppointments,
      topTypes,
      topProviders,
      appointmentsThisMonth: appointments.filter(apt => 
        isWithinInterval(new Date(apt.dateTime), {
          start: startOfMonth(new Date()),
          end: endOfMonth(new Date())
        })
      ).length
    };
  };

  // Generate comprehensive report
  const generatePDFReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      // Import jsPDF and html2canvas dynamically
      const { default: jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Back Pain Management Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Date range
      const { start, end } = getDateRange();
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Period: ${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Summary section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 20, yPosition);
      yPosition += 10;

      const painAnalytics = getPainAnalytics();
      const exerciseAnalytics = getExerciseAnalytics();
      const medicationAnalytics = getMedicationAnalytics();
      const appointmentAnalytics = getAppointmentAnalytics();

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      if (painAnalytics) {
        doc.text(`• Pain Tracking: ${painAnalytics.totalEntries} entries, average pain level ${painAnalytics.avgPainLevel}/10`, 25, yPosition);
        yPosition += 7;
        doc.text(`  Trend: Pain levels are ${painAnalytics.trend}`, 25, yPosition);
        yPosition += 10;
      }

      if (exerciseAnalytics) {
        doc.text(`• Exercise Activity: ${exerciseAnalytics.totalSessions} sessions, ${exerciseAnalytics.totalMinutes} minutes total`, 25, yPosition);
        yPosition += 7;
        doc.text(`  Average: ${exerciseAnalytics.avgSessionsPerWeek} sessions per week`, 25, yPosition);
        yPosition += 10;
      }

      if (medicationAnalytics) {
        doc.text(`• Medication Adherence: ${medicationAnalytics.adherenceRate}% adherence rate`, 25, yPosition);
        yPosition += 7;
        doc.text(`  Total doses taken: ${medicationAnalytics.totalDoses}`, 25, yPosition);
        yPosition += 10;
      }

      if (appointmentAnalytics) {
        doc.text(`• Appointments: ${appointmentAnalytics.totalAppointments} appointments scheduled`, 25, yPosition);
        yPosition += 7;
        doc.text(`  ${appointmentAnalytics.upcomingAppointments} upcoming, ${appointmentAnalytics.completedAppointments} completed`, 25, yPosition);
        yPosition += 15;
      }

      // Pain Analysis Section
      if (painAnalytics) {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Pain Analysis', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        // Pain statistics
        doc.text(`Total pain entries: ${painAnalytics.totalEntries}`, 25, yPosition);
        yPosition += 7;
        doc.text(`Average pain level: ${painAnalytics.avgPainLevel}/10`, 25, yPosition);
        yPosition += 7;
        doc.text(`Pain range: ${painAnalytics.minPainLevel} - ${painAnalytics.maxPainLevel}`, 25, yPosition);
        yPosition += 10;

        // Top triggers
        if (painAnalytics.topTriggers.length > 0) {
          doc.text('Most Common Pain Triggers:', 25, yPosition);
          yPosition += 7;
          painAnalytics.topTriggers.forEach((trigger, index) => {
            doc.text(`${index + 1}. ${trigger.trigger} (${trigger.count} times)`, 30, yPosition);
            yPosition += 6;
          });
          yPosition += 10;
        }

        // Time of day analysis
        if (painAnalytics.timeOfDayAnalysis.length > 0) {
          doc.text('Pain by Time of Day:', 25, yPosition);
          yPosition += 7;
          painAnalytics.timeOfDayAnalysis.forEach(timeData => {
            doc.text(`${timeData.time}: ${timeData.avgPain.toFixed(1)}/10 average`, 30, yPosition);
            yPosition += 6;
          });
          yPosition += 15;
        }
      }

      // Exercise Analysis Section
      if (exerciseAnalytics) {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Exercise Analysis', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        doc.text(`Total exercise sessions: ${exerciseAnalytics.totalSessions}`, 25, yPosition);
        yPosition += 7;
        doc.text(`Total exercise time: ${exerciseAnalytics.totalMinutes} minutes`, 25, yPosition);
        yPosition += 7;
        doc.text(`Calories burned: ${exerciseAnalytics.totalCalories}`, 25, yPosition);
        yPosition += 7;
        doc.text(`Average session length: ${exerciseAnalytics.avgSessionLength} minutes`, 25, yPosition);
        yPosition += 10;

        // Top exercise categories
        if (exerciseAnalytics.topCategories.length > 0) {
          doc.text('Exercise Categories:', 25, yPosition);
          yPosition += 7;
          exerciseAnalytics.topCategories.forEach((category, index) => {
            doc.text(`${index + 1}. ${category.category}: ${category.sessions} sessions, ${category.minutes} minutes`, 30, yPosition);
            yPosition += 6;
          });
          yPosition += 15;
        }
      }

      // Medication Analysis Section
      if (medicationAnalytics) {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Medication Analysis', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        doc.text(`Adherence rate: ${medicationAnalytics.adherenceRate}%`, 25, yPosition);
        yPosition += 7;
        doc.text(`Total doses taken: ${medicationAnalytics.totalDoses}`, 25, yPosition);
        yPosition += 7;
        doc.text(`Active medications: ${medicationAnalytics.activeMedications}`, 25, yPosition);
        yPosition += 7;
        doc.text(`Average doses per day: ${medicationAnalytics.avgDosesPerDay}`, 25, yPosition);
        yPosition += 10;

        // Medication statistics
        if (medicationAnalytics.medicationStats.length > 0) {
          doc.text('Medication Performance:', 25, yPosition);
          yPosition += 7;
          medicationAnalytics.medicationStats.forEach(med => {
            doc.text(`${med.name}: ${med.doses} doses, ${med.onTimeRate}% on-time`, 30, yPosition);
            yPosition += 6;
          });
          yPosition += 15;
        }
      }

      // Recommendations section
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      // Generate recommendations based on data
      const recommendations = [];

      if (painAnalytics) {
        if (painAnalytics.trend === 'increasing') {
          recommendations.push('• Consider consulting with your healthcare provider about increasing pain levels');
        }
        if (painAnalytics.avgPainLevel > 6) {
          recommendations.push('• High average pain levels may require medical attention');
        }
        if (painAnalytics.topTriggers.length > 0) {
          recommendations.push(`• Focus on managing your top pain trigger: ${painAnalytics.topTriggers[0].trigger}`);
        }
      }

      if (exerciseAnalytics) {
        if (exerciseAnalytics.avgSessionsPerWeek < 3) {
          recommendations.push('• Try to increase exercise frequency to at least 3 sessions per week');
        }
        if (exerciseAnalytics.avgSessionLength < 15) {
          recommendations.push('• Consider extending exercise sessions for better benefits');
        }
      }

      if (medicationAnalytics) {
        if (medicationAnalytics.adherenceRate < 80) {
          recommendations.push('• Work on improving medication adherence - consider setting reminders');
        }
      }

      if (recommendations.length === 0) {
        recommendations.push('• Keep up the excellent work with your back pain management!');
        recommendations.push('• Continue tracking your progress and maintaining healthy habits');
      }

      recommendations.forEach(rec => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(rec, 25, yPosition);
        yPosition += 8;
      });

      // Footer
      const timestamp = format(new Date(), 'PPpp');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Generated on ${timestamp}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save the PDF
      doc.save(`back-pain-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const painAnalytics = getPainAnalytics();
  const exerciseAnalytics = getExerciseAnalytics();
  const medicationAnalytics = getMedicationAnalytics();
  const appointmentAnalytics = getAppointmentAnalytics();

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
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
            <BarChart3 size={28} style={{ color: 'var(--primary-600)' }} />
            Reports & Analytics
          </h1>
          <p style={{ color: 'var(--gray-600)', margin: 0 }}>
            Comprehensive insights into your back pain management progress
          </p>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={generatePDFReport}
          disabled={isGeneratingReport}
        >
          {isGeneratingReport ? (
            <RefreshCw size={20} className="animate-spin" />
          ) : (
            <Download size={20} />
          )}
          {isGeneratingReport ? 'Generating...' : 'Download Report'}
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            alignItems: 'end'
          }}>
            {/* Time Range */}
            <div className="form-group mb-0">
              <label className="form-label">Time Range</label>
              <select
                className="form-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Metrics Selection */}
            <div className="form-group mb-0">
              <label className="form-label">Include Metrics</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableMetrics.map(metric => (
                  <button
                    key={metric.id}
                    className={`btn btn-sm ${selectedMetrics.includes(metric.id) ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      setSelectedMetrics(prev => 
                        prev.includes(metric.id) 
                          ? prev.filter(m => m !== metric.id)
                          : [...prev, metric.id]
                      );
                    }}
                    style={{ fontSize: 'var(--font-size-xs)' }}
                  >
                    <metric.icon size={12} />
                    {metric.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`nav-tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          <Eye size={16} />
          Overview
        </button>
        <button
          className={`nav-tab ${activeView === 'pain' ? 'active' : ''}`}
          onClick={() => setActiveView('pain')}
        >
          <Heart size={16} />
          Pain Analysis
        </button>
        <button
          className={`nav-tab ${activeView === 'exercise' ? 'active' : ''}`}
          onClick={() => setActiveView('exercise')}
        >
          <Dumbbell size={16} />
          Exercise Insights
        </button>
        <button
          className={`nav-tab ${activeView === 'medication' ? 'active' : ''}`}
          onClick={() => setActiveView('medication')}
        >
          <Pill size={16} />
          Medication Tracking
        </button>
        <button
          className={`nav-tab ${activeView === 'correlations' ? 'active' : ''}`}
          onClick={() => setActiveView('correlations')}
        >
          <TrendingUp size={16} />
          Correlations
        </button>
      </div>

      {/* Overview */}
      {activeView === 'overview' && (
        <div>
          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {/* Pain Metric */}
            {painAnalytics && (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <Heart size={32} style={{ color: 'var(--error)', marginBottom: '8px' }} />
                  <div style={{
                    fontSize: 'var(--font-size-3xl)',
                    fontWeight: '700',
                    color: 'var(--error)',
                    marginBottom: '4px'
                  }}>
                    {painAnalytics.avgPainLevel}/10
                  </div>
                  <div style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>Average Pain Level</div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    {painAnalytics.trend === 'decreasing' ? (
                      <TrendingDown size={16} style={{ color: 'var(--success)' }} />
                    ) : painAnalytics.trend === 'increasing' ? (
                      <TrendingUp size={16} style={{ color: 'var(--error)' }} />
                    ) : (
                      <Activity size={16} style={{ color: 'var(--gray-500)' }} />
                    )}
                    <span style={{
                      color: painAnalytics.trend === 'decreasing' ? 'var(--success)' : 
                             painAnalytics.trend === 'increasing' ? 'var(--error)' : 'var(--gray-500)'
                    }}>
                      {painAnalytics.trend}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Exercise Metric */}
            {exerciseAnalytics && (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <Dumbbell size={32} style={{ color: 'var(--secondary-600)', marginBottom: '8px' }} />
                  <div style={{
                    fontSize: 'var(--font-size-3xl)',
                    fontWeight: '700',
                    color: 'var(--secondary-600)',
                    marginBottom: '4px'
                  }}>
                    {exerciseAnalytics.totalSessions}
                  </div>
                  <div style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>Exercise Sessions</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    {exerciseAnalytics.totalMinutes} minutes total
                  </div>
                </div>
              </div>
            )}

            {/* Medication Metric */}
            {medicationAnalytics && (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <Pill size={32} style={{ color: 'var(--warning)', marginBottom: '8px' }} />
                  <div style={{
                    fontSize: 'var(--font-size-3xl)',
                    fontWeight: '700',
                    color: 'var(--warning)',
                    marginBottom: '4px'
                  }}>
                    {medicationAnalytics.adherenceRate}%
                  </div>
                  <div style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>Adherence Rate</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    {medicationAnalytics.totalDoses} doses taken
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Metric */}
            {appointmentAnalytics && (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <Calendar size={32} style={{ color: 'var(--primary-600)', marginBottom: '8px' }} />
                  <div style={{
                    fontSize: 'var(--font-size-3xl)',
                    fontWeight: '700',
                    color: 'var(--primary-600)',
                    marginBottom: '4px'
                  }}>
                    {appointmentAnalytics.totalAppointments}
                  </div>
                  <div style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>Appointments</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    {appointmentAnalytics.upcomingAppointments} upcoming
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {/* Pain Summary */}
            {painAnalytics && (
              <div className="card">
                <div className="card-header">
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Heart size={20} style={{ color: 'var(--error)' }} />
                    Pain Summary
                  </h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Entries:</span>
                      <strong>{painAnalytics.totalEntries}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Pain Range:</span>
                      <strong>{painAnalytics.minPainLevel} - {painAnalytics.maxPainLevel}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>This Week:</span>
                      <strong>{painAnalytics.entriesThisWeek} entries</strong>
                    </div>
                    
                    {painAnalytics.topTriggers.length > 0 && (
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Top Trigger:</div>
                        <div style={{
                          padding: '8px',
                          backgroundColor: 'var(--error)' + '10',
                          borderRadius: 'var(--border-radius)',
                          border: '1px solid var(--error)'
                        }}>
                          {painAnalytics.topTriggers[0].trigger} ({painAnalytics.topTriggers[0].count} times)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Exercise Summary */}
            {exerciseAnalytics && (
              <div className="card">
                <div className="card-header">
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Dumbbell size={20} style={{ color: 'var(--secondary-600)' }} />
                    Exercise Summary
                  </h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Weekly Average:</span>
                      <strong>{exerciseAnalytics.avgSessionsPerWeek} sessions</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Avg Session:</span>
                      <strong>{exerciseAnalytics.avgSessionLength} minutes</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Calories Burned:</span>
                      <strong>{exerciseAnalytics.totalCalories}</strong>
                    </div>
                    
                    {exerciseAnalytics.topCategories.length > 0 && (
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Top Category:</div>
                        <div style={{
                          padding: '8px',
                          backgroundColor: 'var(--secondary-50)',
                          borderRadius: 'var(--border-radius)',
                          border: '1px solid var(--secondary-200)'
                        }}>
                          {exerciseAnalytics.topCategories[0].category} ({exerciseAnalytics.topCategories[0].sessions} sessions)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Medication Summary */}
            {medicationAnalytics && (
              <div className="card">
                <div className="card-header">
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pill size={20} style={{ color: 'var(--warning)' }} />
                    Medication Summary
                  </h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Active Medications:</span>
                      <strong>{medicationAnalytics.activeMedications}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Daily Average:</span>
                      <strong>{medicationAnalytics.avgDosesPerDay} doses</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>This Week:</span>
                      <strong>{medicationAnalytics.dosesThisWeek} doses</strong>
                    </div>
                    
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '8px' }}>Adherence Status:</div>
                      <div style={{
                        padding: '8px',
                        backgroundColor: medicationAnalytics.adherenceRate >= 80 ? 'var(--success)' + '10' : 'var(--warning)' + '10',
                        borderRadius: 'var(--border-radius)',
                        border: `1px solid ${medicationAnalytics.adherenceRate >= 80 ? 'var(--success)' : 'var(--warning)'}`
                      }}>
                        {medicationAnalytics.adherenceRate >= 80 ? 'Excellent' : 
                         medicationAnalytics.adherenceRate >= 60 ? 'Good' : 'Needs Improvement'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pain Analysis View */}
      {activeView === 'pain' && (
        <div>
          {painAnalytics ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Pain Statistics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '700',
                      color: 'var(--error)',
                      marginBottom: '4px'
                    }}>
                      {painAnalytics.totalEntries}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Total Entries</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '700',
                      color: 'var(--error)',
                      marginBottom: '4px'
                    }}>
                      {painAnalytics.avgPainLevel}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Average Level</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '700',
                      color: 'var(--error)',
                      marginBottom: '4px'
                    }}>
                      {painAnalytics.maxPainLevel}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Peak Level</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '700',
                      color: painAnalytics.trend === 'decreasing' ? 'var(--success)' : 
                             painAnalytics.trend === 'increasing' ? 'var(--error)' : 'var(--gray-600)',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}>
                      {painAnalytics.trend === 'decreasing' ? (
                        <TrendingDown size={24} />
                      ) : painAnalytics.trend === 'increasing' ? (
                        <TrendingUp size={24} />
                      ) : (
                        <Activity size={24} />
                      )}
                      {Math.abs(painAnalytics.trendValue)}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Trend</div>
                  </div>
                </div>
              </div>

              {/* Pain Triggers */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ margin: 0 }}>Most Common Pain Triggers</h3>
                </div>
                <div className="card-body">
                  {painAnalytics.topTriggers.length === 0 ? (
                    <p style={{ color: 'var(--gray-500)', textAlign: 'center' }}>
                      No triggers recorded yet
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {painAnalytics.topTriggers.map((trigger, index) => (
                        <div key={trigger.trigger} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          backgroundColor: 'var(--gray-50)',
                          borderRadius: 'var(--border-radius)',
                          border: '1px solid var(--gray-200)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--error)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: '600'
                            }}>
                              {index + 1}
                            </div>
                            <span style={{ fontWeight: '500' }}>{trigger.trigger}</span>
                          </div>
                          <span className="badge badge-error">
                            {trigger.count} times
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pain by Time of Day */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ margin: 0 }}>Pain Levels by Time of Day</h3>
                </div>
                <div className="card-body">
                  {painAnalytics.timeOfDayAnalysis.length === 0 ? (
                    <p style={{ color: 'var(--gray-500)', textAlign: 'center' }}>
                      Not enough data for time analysis
                    </p>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '16px'
                    }}>
                      {painAnalytics.timeOfDayAnalysis.map(timeData => (
                        <div key={timeData.time} style={{
                          padding: '16px',
                          textAlign: 'center',
                          backgroundColor: 'var(--gray-50)',
                          borderRadius: 'var(--border-radius)',
                          border: '1px solid var(--gray-200)'
                        }}>
                          <div style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: '600',
                            color: 'var(--error)',
                            marginBottom: '4px'
                          }}>
                            {timeData.avgPain.toFixed(1)}/10
                          </div>
                          <div style={{ color: 'var(--gray-600)' }}>
                            {timeData.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Heart size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Pain Data Available</h3>
                <p style={{ color: 'var(--gray-500)' }}>
                  Start tracking your pain levels to see detailed analytics.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Exercise Analysis View */}
      {activeView === 'exercise' && (
        <div>
          {exerciseAnalytics ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Exercise Statistics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '700',
                      color: 'var(--secondary-600)',
                      marginBottom: '4px'
                    }}>
                      {exerciseAnalytics.totalSessions}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Total Sessions</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '700',
                      color: 'var(--secondary-600)',
                      marginBottom: '4px'
                    }}>
                      {exerciseAnalytics.totalMinutes}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Minutes</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '700',
                      color: 'var(--secondary-600)',
                      marginBottom: '4px'
                    }}>
                      {exerciseAnalytics.totalCalories}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Calories</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '700',
                      color: 'var(--secondary-600)',
                      marginBottom: '4px'
                    }}>
                      {exerciseAnalytics.avgSessionsPerWeek}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Weekly Average</div>
                  </div>
                </div>
              </div>

              {/* Exercise Categories */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ margin: 0 }}>Exercise Categories</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {exerciseAnalytics.topCategories.map((category, index) => (
                      <div key={category.category} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--gray-200)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--secondary-600)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: '600'
                          }}>
                            {index + 1}
                          </div>
                          <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                            {category.category}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <span className="badge badge-secondary">
                            {category.sessions} sessions
                          </span>
                          <span className="badge badge-secondary">
                            {category.minutes} min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Exercises */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ margin: 0 }}>Most Popular Exercises</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {exerciseAnalytics.topExercises.map((exercise, index) => (
                      <div key={exercise.exercise} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--gray-200)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--success)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: '600'
                          }}>
                            {index + 1}
                          </div>
                          <span style={{ fontWeight: '500' }}>{exercise.exercise}</span>
                        </div>
                        <span className="badge badge-success">
                          {exercise.count} times
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Dumbbell size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Exercise Data Available</h3>
                <p style={{ color: 'var(--gray-500)' }}>
                  Complete some exercises to see detailed analytics.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Medication Analysis View */}
      {activeView === 'medication' && (
        <div>
          {medicationAnalytics ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Medication Statistics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '700',
                      color: medicationAnalytics.adherenceRate >= 80 ? 'var(--success)' : 
                             medicationAnalytics.adherenceRate >= 60 ? 'var(--warning)' : 'var(--error)',
                      marginBottom: '4px'
                    }}>
                      {medicationAnalytics.adherenceRate}%
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Adherence Rate</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '700',
                      color: 'var(--warning)',
                      marginBottom: '4px'
                    }}>
                      {medicationAnalytics.totalDoses}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Total Doses</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '700',
                      color: 'var(--warning)',
                      marginBottom: '4px'
                    }}>
                      {medicationAnalytics.activeMedications}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Active Medications</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '700',
                      color: 'var(--warning)',
                      marginBottom: '4px'
                    }}>
                      {medicationAnalytics.avgDosesPerDay}
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>Daily Average</div>
                  </div>
                </div>
              </div>

              {/* Medication Performance */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ margin: 0 }}>Medication Performance</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {medicationAnalytics.medicationStats.map((med, index) => (
                      <div key={med.name} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--gray-200)'
                      }}>
                        <div>
                          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                            {med.name}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                            {med.doses} doses taken
                          </div>
                        </div>
                        <div style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--border-radius-full)',
                          backgroundColor: med.onTimeRate >= 80 ? 'var(--success)' + '10' : 
                                          med.onTimeRate >= 60 ? 'var(--warning)' + '10' : 'var(--error)' + '10',
                          border: `1px solid ${med.onTimeRate >= 80 ? 'var(--success)' : 
                                                med.onTimeRate >= 60 ? 'var(--warning)' : 'var(--error)'}`,
                          color: med.onTimeRate >= 80 ? 'var(--success)' : 
                                 med.onTimeRate >= 60 ? 'var(--warning)' : 'var(--error)',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: '600'
                        }}>
                          {med.onTimeRate}% on-time
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side Effects */}
              {medicationAnalytics.topSideEffects.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ margin: 0 }}>Reported Side Effects</h3>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {medicationAnalytics.topSideEffects.map((effect, index) => (
                        <div key={effect.effect} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          backgroundColor: 'var(--warning)' + '10',
                          borderRadius: 'var(--border-radius)',
                          border: '1px solid var(--warning)'
                        }}>
                          <span style={{ fontWeight: '500' }}>{effect.effect}</span>
                          <span className="badge badge-warning">
                            {effect.count} times
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Pill size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Medication Data Available</h3>
                <p style={{ color: 'var(--gray-500)' }}>
                  Add medications and start tracking to see analytics.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Correlations View */}
      {activeView === 'correlations' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Data Correlations & Insights</h3>
          </div>
          <div className="card-body">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <TrendingUp size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
              <h4 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>Correlation Analysis</h4>
              <p style={{ color: 'var(--gray-500)' }}>
                Advanced correlation analysis between pain levels, exercise activity, and medication adherence will be available with more data points.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginTop: '24px'
              }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--primary-50)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--primary-200)'
                }}>
                  <h5 style={{ margin: 0, marginBottom: '8px', color: 'var(--primary-600)' }}>
                    Pain vs Exercise
                  </h5>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                    Track how exercise frequency affects your pain levels over time.
                  </p>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--secondary-50)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--secondary-200)'
                }}>
                  <h5 style={{ margin: 0, marginBottom: '8px', color: 'var(--secondary-600)' }}>
                    Medication Timing
                  </h5>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                    Analyze the relationship between medication adherence and pain relief.
                  </p>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--success)' + '10',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--success)'
                }}>
                  <h5 style={{ margin: 0, marginBottom: '8px', color: 'var(--success)' }}>
                    Trigger Patterns
                  </h5>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                    Identify patterns between pain triggers and daily activities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;