import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing browser notifications entirely offline
 * No external APIs required - uses only browser Notification API
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSupported, setIsSupported] = useState(
    typeof window !== 'undefined' && 'Notification' in window
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('Notification' in window);
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  // Show immediate notification
  const showNotification = useCallback((title, options = {}) => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Notifications not available or not permitted');
      return null;
    }

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: 'back-pain-app',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto close after 5 seconds if not interactive
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  // Schedule notification using setTimeout (no external APIs)
  const scheduleNotification = useCallback((title, options = {}, delayMs = 0) => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Notifications not available or not permitted');
      return null;
    }

    const timeoutId = setTimeout(() => {
      showNotification(title, options);
    }, delayMs);

    // Return cleanup function
    return () => clearTimeout(timeoutId);
  }, [isSupported, permission, showNotification]);

  // Medication reminder notifications
  const scheduleMedicationReminder = useCallback((medication, nextDoseTime) => {
    const now = new Date();
    const doseTime = new Date(nextDoseTime);
    const delayMs = doseTime.getTime() - now.getTime();

    if (delayMs <= 0) return null;

    return scheduleNotification(
      `💊 Medication Reminder`,
      {
        body: `Time to take your ${medication.name} (${medication.dosage})`,
        icon: '/icons/icon-192x192.png',
        tag: `medication-${medication.id}`,
        requireInteraction: true,
        actions: [
          { action: 'taken', title: 'Mark as Taken' },
          { action: 'snooze', title: 'Remind Later' }
        ]
      },
      delayMs
    );
  }, [scheduleNotification]);

  // Exercise reminder notifications
  const scheduleExerciseReminder = useCallback((exerciseName, reminderTime) => {
    const now = new Date();
    const exerciseTime = new Date(reminderTime);
    const delayMs = exerciseTime.getTime() - now.getTime();

    if (delayMs <= 0) return null;

    return scheduleNotification(
      `🏃‍♀️ Exercise Time!`,
      {
        body: `Time for your ${exerciseName} session`,
        icon: '/icons/icon-192x192.png',
        tag: `exercise-${exerciseName}`,
        requireInteraction: false
      },
      delayMs
    );
  }, [scheduleNotification]);

  // Pain tracking reminder
  const schedulePainTrackingReminder = useCallback((reminderTime) => {
    const now = new Date();
    const trackingTime = new Date(reminderTime);
    const delayMs = trackingTime.getTime() - now.getTime();

    if (delayMs <= 0) return null;

    return scheduleNotification(
      `📊 Pain Tracking Reminder`,
      {
        body: 'How are you feeling today? Track your pain level.',
        icon: '/icons/icon-192x192.png',
        tag: 'pain-tracking',
        requireInteraction: false
      },
      delayMs
    );
  }, [scheduleNotification]);

  // Appointment reminder
  const scheduleAppointmentReminder = useCallback((appointment, reminderTime) => {
    const now = new Date();
    const appointmentReminderTime = new Date(reminderTime);
    const delayMs = appointmentReminderTime.getTime() - now.getTime();

    if (delayMs <= 0) return null;

    return scheduleNotification(
      `📅 Upcoming Appointment`,
      {
        body: `${appointment.type} with ${appointment.provider} at ${new Date(appointment.dateTime).toLocaleTimeString()}`,
        icon: '/icons/icon-192x192.png',
        tag: `appointment-${appointment.id}`,
        requireInteraction: true
      },
      delayMs
    );
  }, [scheduleNotification]);

  // Motivational notifications
  const scheduleMotivationalReminder = useCallback(() => {
    const motivationalMessages = [
      "💪 Great job staying consistent with your health journey!",
      "🌟 Every small step counts towards better health!",
      "🎯 You're doing amazing managing your back pain!",
      "💚 Remember to take care of yourself today!",
      "🏆 Your dedication to health is inspiring!",
      "🌱 Progress, not perfection - you're doing great!",
      "✨ Your health is your greatest wealth!",
      "🌈 Better days are ahead - keep going!"
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    // Schedule for random time in next 24 hours
    const delayMs = Math.random() * 24 * 60 * 60 * 1000;

    return scheduleNotification(
      'Back Pain Manager',
      {
        body: randomMessage,
        icon: '/icons/icon-192x192.png',
        tag: 'motivation',
        requireInteraction: false
      },
      delayMs
    );
  }, [scheduleNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    scheduleNotification,
    scheduleMedicationReminder,
    scheduleExerciseReminder,
    schedulePainTrackingReminder,
    scheduleAppointmentReminder,
    scheduleMotivationalReminder
  };
};

/**
 * Hook for managing notification preferences and scheduling
 */
export const useNotificationScheduler = (settings) => {
  const notifications = useNotifications();
  const [scheduledNotifications, setScheduledNotifications] = useState([]);

  // Clear all scheduled notifications
  const clearAllNotifications = useCallback(() => {
    scheduledNotifications.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
    setScheduledNotifications([]);
  }, [scheduledNotifications]);

  // Setup daily reminders based on user preferences
  const setupDailyReminders = useCallback((preferences) => {
    if (!notifications.isSupported || !settings.notifications) return;

    clearAllNotifications();
    const newScheduled = [];

    // Pain tracking reminders
    if (preferences.painTracking?.enabled) {
      preferences.painTracking.times?.forEach(time => {
        const [hours, minutes] = time.split(':');
        const reminderTime = new Date();
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (reminderTime <= new Date()) {
          reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const cleanup = notifications.schedulePainTrackingReminder(reminderTime);
        if (cleanup) newScheduled.push(cleanup);
      });
    }

    // Exercise reminders
    if (preferences.exercises?.enabled) {
      preferences.exercises.times?.forEach(time => {
        const [hours, minutes] = time.split(':');
        const reminderTime = new Date();
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (reminderTime <= new Date()) {
          reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const cleanup = notifications.scheduleExerciseReminder('Daily Exercise', reminderTime);
        if (cleanup) newScheduled.push(cleanup);
      });
    }

    // Motivational reminders
    if (preferences.motivation?.enabled) {
      const cleanup = notifications.scheduleMotivationalReminder();
      if (cleanup) newScheduled.push(cleanup);
    }

    setScheduledNotifications(newScheduled);
  }, [notifications, settings.notifications, clearAllNotifications]);

  return {
    ...notifications,
    setupDailyReminders,
    clearAllNotifications,
    scheduledCount: scheduledNotifications.length
  };
};