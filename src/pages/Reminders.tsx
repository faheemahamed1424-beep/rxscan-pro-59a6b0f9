import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Clock, ChevronLeft, ChevronRight, Bell, BellOff, Pill, Plus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { useNotifications } from "@/hooks/useNotifications";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { toast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

interface Reminder {
  id: string;
  time: string;
  medicines: string[];
  taken: boolean;
  notificationEnabled: boolean;
}

// Default reminder times based on frequency
const getTimesFromFrequency = (frequency: string): string[] => {
  const freq = frequency.toLowerCase();
  if (freq.includes("twice") || freq.includes("bid") || freq.includes("2")) {
    return ["9:00 AM", "9:00 PM"];
  }
  if (freq.includes("three") || freq.includes("tid") || freq.includes("3")) {
    return ["8:00 AM", "2:00 PM", "8:00 PM"];
  }
  if (freq.includes("four") || freq.includes("qid") || freq.includes("4")) {
    return ["8:00 AM", "12:00 PM", "4:00 PM", "8:00 PM"];
  }
  if (freq.includes("night") || freq.includes("bedtime") || freq.includes("hs")) {
    return ["9:00 PM"];
  }
  if (freq.includes("morning")) {
    return ["8:00 AM"];
  }
  // Default: once daily
  return ["9:00 AM"];
};

const Reminders = () => {
  const navigate = useNavigate();
  const { permission, requestPermission, scheduleReminder, cancelReminder, isGranted } = useNotifications();
  const { data: prescriptions = [], isLoading } = usePrescriptions();
  
  // Week navigation
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Generate reminders from prescriptions
  const [reminderStates, setReminderStates] = useState<Record<string, { taken: boolean; notificationEnabled: boolean }>>({});

  // Load saved reminder states
  useEffect(() => {
    const saved = localStorage.getItem("reminderStates");
    if (saved) {
      setReminderStates(JSON.parse(saved));
    }
  }, []);

  // Save reminder states
  useEffect(() => {
    if (Object.keys(reminderStates).length > 0) {
      localStorage.setItem("reminderStates", JSON.stringify(reminderStates));
    }
  }, [reminderStates]);

  // Build reminders from prescriptions
  const reminders = useMemo(() => {
    const reminderMap = new Map<string, Reminder>();
    const dateKey = format(selectedDate, "yyyy-MM-dd");

    prescriptions.forEach(prescription => {
      prescription.medicines.forEach(medicine => {
        const times = getTimesFromFrequency(medicine.frequency || "once daily");
        times.forEach(time => {
          const id = `${dateKey}-${time}-${medicine.name}`;
          const existing = reminderMap.get(time);
          const state = reminderStates[id] || { taken: false, notificationEnabled: false };
          
          if (existing) {
            existing.medicines.push(`${medicine.name} ${medicine.dosage || ""}`);
          } else {
            reminderMap.set(time, {
              id: `${dateKey}-${time}`,
              time,
              medicines: [`${medicine.name} ${medicine.dosage || ""}`],
              taken: state.taken,
              notificationEnabled: state.notificationEnabled,
            });
          }
        });
      });
    });

    // Sort by time
    return Array.from(reminderMap.values()).sort((a, b) => {
      const timeA = new Date(`2000-01-01 ${a.time}`);
      const timeB = new Date(`2000-01-01 ${b.time}`);
      return timeA.getTime() - timeB.getTime();
    });
  }, [prescriptions, selectedDate, reminderStates]);

  // Schedule notifications for enabled reminders
  useEffect(() => {
    if (isGranted && isSameDay(selectedDate, new Date())) {
      reminders.forEach((reminder) => {
        if (reminder.notificationEnabled && !reminder.taken) {
          scheduleReminder(reminder.id, reminder.time, reminder.medicines);
        }
      });
    }
  }, [isGranted, reminders, selectedDate, scheduleReminder]);

  const handleToggleNotification = async (id: string) => {
    if (!isGranted) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setReminderStates(prev => {
      const current = prev[id] || { taken: false, notificationEnabled: false };
      const newEnabled = !current.notificationEnabled;
      
      if (newEnabled) {
        const reminder = reminders.find(r => r.id === id);
        if (reminder) {
          scheduleReminder(id, reminder.time, reminder.medicines);
          toast({
            title: "Reminder Set",
            description: `You'll be notified at ${reminder.time}`,
          });
        }
      } else {
        cancelReminder(id);
        toast({
          title: "Reminder Cancelled",
          description: "Notification disabled for this reminder",
        });
      }
      
      return { ...prev, [id]: { ...current, notificationEnabled: newEnabled } };
    });
  };

  const handleMarkTaken = (id: string) => {
    cancelReminder(id);
    setReminderStates(prev => ({
      ...prev,
      [id]: { taken: true, notificationEnabled: false }
    }));
    toast({
      title: "Medicine Taken",
      description: "Great job staying on track!",
    });
  };

  const completedCount = reminders.filter(r => reminderStates[r.id]?.taken).length;
  const totalCount = reminders.length;

  const navigateWeek = (direction: "prev" | "next") => {
    setWeekStart(prev => addDays(prev, direction === "next" ? 7 : -7));
  };

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
            <button 
              onClick={() => navigateWeek("prev")}
              className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="flex gap-2">
              {weekDays.map((day) => (
                <motion.button
                  key={day.toISOString()}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDate(day)}
                  className={`w-10 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                    isSameDay(selectedDate, day)
                      ? "bg-white text-primary shadow-lg"
                      : "bg-white/20 text-white"
                  }`}
                >
                  <span className="text-xs font-medium">{format(day, "EEE")}</span>
                  <span className="text-sm font-bold">{format(day, "d")}</span>
                </motion.button>
              ))}
            </div>
            <button 
              onClick={() => navigateWeek("next")}
              className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"
            >
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
              <h3 className="font-semibold text-foreground">
                {isSameDay(selectedDate, new Date()) ? "Today's Progress" : format(selectedDate, "MMMM d") + "'s Progress"}
              </h3>
              <span className="text-primary font-bold">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%" }}
                className="h-full gradient-bg rounded-full"
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Today's Schedule */}
        <div className="px-6 mt-6">
          <h2 className="section-header">
            {isSameDay(selectedDate, new Date()) ? "Today's Schedule" : format(selectedDate, "EEEE") + "'s Schedule"}
          </h2>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : reminders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-solid rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Pill className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No Medicines Scheduled</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Scan a prescription to add medicines to your schedule
              </p>
              <button
                onClick={() => navigate("/upload")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium"
              >
                <Plus className="w-4 h-4" />
                Scan Prescription
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {reminders.map((reminder, index) => {
                  const state = reminderStates[reminder.id] || { taken: false, notificationEnabled: false };
                  return (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`glass-card-solid rounded-2xl p-4 border-l-4 ${
                        state.taken ? "border-l-success" : "border-l-primary"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              state.taken ? "bg-success/10" : "bg-primary/10"
                            }`}
                          >
                            {state.taken ? (
                              <Check className="w-6 h-6 text-success" />
                            ) : (
                              <Clock className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{reminder.time}</span>
                              {state.taken && (
                                <span className="status-badge status-success text-xs">✓ Taken</span>
                              )}
                            </div>
                            <div className="mt-2 space-y-1">
                              {reminder.medicines.map((med, i) => (
                                <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span>💊</span> {med}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>

                        {!state.taken && (
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleToggleNotification(reminder.id)}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                state.notificationEnabled
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                              title={state.notificationEnabled ? "Disable notification" : "Enable notification"}
                            >
                              {state.notificationEnabled ? (
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
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Weekly Overview */}
        {reminders.length > 0 && (
          <div className="px-6 mt-8 mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card-solid rounded-2xl p-5"
            >
              <h3 className="font-semibold text-foreground mb-4">This Week</h3>
              <div className="flex justify-between">
                {weekDays.map((day) => {
                  const dayKey = format(day, "yyyy-MM-dd");
                  const isPast = day < new Date() && !isSameDay(day, new Date());
                  const isToday = isSameDay(day, new Date());
                  const progress = isPast ? 100 : isToday ? (totalCount > 0 ? (completedCount / totalCount) * 100 : 0) : 0;
                  
                  return (
                    <div key={dayKey} className="flex flex-col items-center gap-2">
                      <div className="w-8 h-24 bg-muted rounded-full relative overflow-hidden">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${progress}%` }}
                          transition={{ duration: 0.5, delay: 0.7 }}
                          className="absolute bottom-0 left-0 right-0 gradient-bg rounded-full"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{format(day, "EEE")}</span>
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
        )}
      </PageTransition>

      <BottomNav />
    </div>
  );
};

export default Reminders;
