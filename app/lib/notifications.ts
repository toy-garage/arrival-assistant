export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }
}

export function scheduleDepartureNotification(
  appointmentTitle: string,
  departureTime: Date,
  location: string
) {
  const now = new Date();
  const timeUntilDeparture = departureTime.getTime() - now.getTime();

  if (timeUntilDeparture <= 0) {
    // 즉시 알림
    sendNotification('지금 출발하세요! 🚗', {
      body: `${appointmentTitle} - ${location}`,
      tag: 'departure',
      requireInteraction: true,
    });
  } else if (timeUntilDeparture <= 15 * 60 * 1000) {
    // 15분 이내면 타이머 설정
    setTimeout(() => {
      sendNotification('출발 시간입니다! 🚗', {
        body: `${appointmentTitle} - ${location}`,
        tag: 'departure',
        requireInteraction: true,
      });
    }, timeUntilDeparture);
  }
}

export function scheduleReminderNotification(
  appointmentTitle: string,
  reminderTime: Date,
  message: string
) {
  const now = new Date();
  const timeUntilReminder = reminderTime.getTime() - now.getTime();

  if (timeUntilReminder > 0 && timeUntilReminder <= 24 * 60 * 60 * 1000) {
    setTimeout(() => {
      sendNotification(appointmentTitle, {
        body: message,
        tag: 'reminder',
      });
    }, timeUntilReminder);
  }
}
