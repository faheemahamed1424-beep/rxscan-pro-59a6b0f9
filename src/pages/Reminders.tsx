import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Clock, ChevronLeft, ChevronRight, Bell, BellOff } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "@/hooks/use-toast";

interface Reminder {
  id: number;
  time: string;
  medicines: string[];
  taken: boolean;
  notificationEnabled: boolean;
}

const Reminders = () => {
  const navigate = useNavigate();
  const { permission, requestPermission, scheduleReminder, cancelReminder, isGranted } = useNotifications();
  
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: 1, time: "9:00 AM", medicines: ["Amoxicillin 500mg", "Paracetamol 650mg"], taken: true, notificationEnabled: false },
    { id: 2, time: "3:00 PM", medicines: ["Paracetamol 650mg"], taken: false, notificationEnabled: false },
    { id: 3, time: "9:00 PM", medicines: ["Amoxicillin 500mg"], taken: false, notificationEnabled: false },
  ]);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [selectedDay, setSelectedDay] = useState(2);

  // Schedule notifications for enabled reminders
  useEffect(() => {
    if (isGranted) {
      reminders.forEach((reminder) => {
        if (reminder.notificationEnabled && !reminder.taken) {
          scheduleReminder(String(reminder.id), reminder.time, reminder.medicines);
        }
      });
    }
  }, [isGranted, reminders, scheduleReminder]);

  const handleToggleNotification = async (id: number) => {
    if (!isGranted) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newEnabled = !r.notificationEnabled;
          if (newEnabled) {
            scheduleReminder(String(id), r.time, r.medicines);
            toast({
              title: "Reminder Set",
              description: `You'll be notified at ${r.time}`,
            });
          } else {
            cancelReminder(String(id));
            toast({
              title: "Reminder Cancelled",
              description: "Notification disabled for this reminder",
            });
          }
          return { ...r, notificationEnabled: newEnabled };
        }
        return r;
      })
    );
  };

  const handleMarkTaken = (id: number) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          cancelReminder(String(id));
          return { ...r, taken: true, notificationEnabled: false };
        }
        return r;
      })
    );
  };

  const completedCount = reminders.filter((r) => r.taken).length;
  const totalCount = reminders.length;

  return (
    <div className="page-container bg-background">
      <PageTransition>
        {/* Header */}
        <div className="gradient-bg px-6 pt-12 pb-8 rounded-b-[2.5rem]">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Reminders</h1>
              <p className="text-white/70 text-sm">Stay on track with your medication</p>
            </div>
          </div>

          {/* Week Selector */}
          <div className="flex items-center justify-between">
            <button className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="flex gap-2">
              {weekDays.map((day, index) => (
                <motion.button
                  key={day}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDay(index)}
                  className={`w-10 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                    selectedDay === index
                      ? "bg-white text-primary shadow-lg"
                      : "bg-white/20 text-white"
                  }`}
                >
                  <span className="text-xs font-medium">{day}</span>
                  <span className="text-sm font-bold">{15 + index}</span>
                </motion.button>
              ))}
            </div>
            <button className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 -mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-solid rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Today's Progress</h3>
              <span className="text-primary font-bold">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                className="h-full gradient-bg rounded-full"
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Today's Schedule */}
        <div className="px-6 mt-6">
          <h2 className="section-header">Today's Schedule</h2>

          <div className="space-y-4">
            <AnimatePresence>
              {reminders.map((reminder, index) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`glass-card-solid rounded-2xl p-4 border-l-4 ${
                    reminder.taken
                      ? "border-l-success"
                      : "border-l-primary"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          reminder.taken
                            ? "bg-success/10"
                            : "bg-primary/10"
                        }`}
                      >
                        {reminder.taken ? (
                          <Check className="w-6 h-6 text-success" />
                        ) : (
                          <Clock className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{reminder.time}</span>
                          {reminder.taken && (
                            <span className="status-badge status-success text-xs">✓ Taken</span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          {reminder.medicines.map((med) => (
                            <p key={med} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>💊</span> {med}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {!reminder.taken && (
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleNotification(reminder.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            reminder.notificationEnabled
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                          title={reminder.notificationEnabled ? "Disable notification" : "Enable notification"}
                        >
                          {reminder.notificationEnabled ? (
                            <Bell className="w-5 h-5" />
                          ) : (
                            <BellOff className="w-5 h-5" />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleMarkTaken(reminder.id)}
                          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Mark Taken
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="px-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card-solid rounded-2xl p-5"
          >
            <h3 className="font-semibold text-foreground mb-4">Weekly Overview</h3>
            <div className="flex justify-between">
              {weekDays.map((day, index) => {
                const progress = index <= selectedDay ? (index === selectedDay ? 33 : 100) : 0;
                return (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div className="w-8 h-24 bg-muted rounded-full relative overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${progress}%` }}
                        transition={{ duration: 0.5, delay: 0.7 + index * 0.05 }}
                        className="absolute bottom-0 left-0 right-0 gradient-bg rounded-full"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{day}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        progress === 100
                          ? "bg-success"
                          : progress > 0
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </PageTransition>

      <BottomNav />
    </div>
  );
};

export default Reminders;
