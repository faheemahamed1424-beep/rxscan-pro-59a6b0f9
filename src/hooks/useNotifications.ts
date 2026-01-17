import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface ScheduledReminder {
  id: string;
  time: string;
  medicines: string[];
  timeoutId?: ReturnType<typeof setTimeout>;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive reminders for your medications.",
        });
        return true;
      } else if (result === "denied") {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
        return false;
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== "granted") {
      console.log("Notifications not permitted");
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }, [permission]);

  const scheduleReminder = useCallback((id: string, time: string, medicines: string[]) => {
    const [hours, minutes] = time.replace(/\s?(AM|PM)/i, "").split(":").map(Number);
    const isPM = time.toLowerCase().includes("pm");
    
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours);
    reminderTime.setMinutes(minutes);
    reminderTime.setSeconds(0);

    // If the time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      sendNotification("💊 Medicine Reminder", {
        body: `Time to take: ${medicines.join(", ")}`,
        tag: id,
        requireInteraction: true,
      });
    }, delay);

    setScheduledReminders((prev) => [
      ...prev.filter((r) => r.id !== id),
      { id, time, medicines, timeoutId },
    ]);

    return timeoutId;
  }, [sendNotification]);

  const cancelReminder = useCallback((id: string) => {
    setScheduledReminders((prev) => {
      const reminder = prev.find((r) => r.id === id);
      if (reminder?.timeoutId) {
        clearTimeout(reminder.timeoutId);
      }
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const cancelAllReminders = useCallback(() => {
    scheduledReminders.forEach((reminder) => {
      if (reminder.timeoutId) {
        clearTimeout(reminder.timeoutId);
      }
    });
    setScheduledReminders([]);
  }, [scheduledReminders]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      scheduledReminders.forEach((reminder) => {
        if (reminder.timeoutId) {
          clearTimeout(reminder.timeoutId);
        }
      });
    };
  }, []);

  return {
    permission,
    isSupported: "Notification" in window,
    isGranted: permission === "granted",
    isDenied: permission === "denied",
    requestPermission,
    sendNotification,
    scheduleReminder,
    cancelReminder,
    cancelAllReminders,
    scheduledReminders,
  };
};
