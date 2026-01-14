import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Filter, Plus, Calendar, Pill } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";

const prescriptions = [
  {
    id: 1,
    name: "General Checkup",
    doctor: "Dr. Sarah Wilson",
    date: "Jan 10, 2025",
    medicines: 3,
    status: "active",
  },
  {
    id: 2,
    name: "Dental Treatment",
    doctor: "Dr. Michael Chen",
    date: "Jan 5, 2025",
    medicines: 2,
    status: "active",
  },
  {
    id: 3,
    name: "Allergy Treatment",
    doctor: "Dr. Emily Brown",
    date: "Dec 28, 2024",
    medicines: 1,
    status: "completed",
  },
  {
    id: 4,
    name: "Eye Checkup",
    doctor: "Dr. James Lee",
    date: "Dec 15, 2024",
    medicines: 2,
    status: "completed",
  },
];

const Prescriptions = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container bg-background">
      <PageTransition>
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-2xl font-bold text-foreground">My Prescriptions</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/upload")}
              className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg"
            >
              <Plus className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search prescriptions..."
                className="input-medical pl-12"
              />
            </div>
            <button className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Filter className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="glass-card-solid rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">8</p>
              <p className="text-xs text-muted-foreground">Total Meds</p>
            </div>
            <div className="glass-card-solid rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">✅</span>
              </div>
              <p className="text-2xl font-bold text-foreground">2</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="glass-card-solid rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">4</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </motion.div>
        </div>

        {/* Prescriptions List */}
        <div className="px-6">
          <h2 className="section-header">All Prescriptions</h2>

          <div className="space-y-4">
            {prescriptions.map((prescription, index) => (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate("/results")}
                className="glass-card-solid rounded-2xl p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        prescription.status === "active"
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}
                    >
                      <span className="text-2xl">📋</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{prescription.name}</h3>
                      <p className="text-sm text-muted-foreground">{prescription.doctor}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {prescription.date}
                        </span>
                        <span className="text-xs text-primary font-medium">
                          {prescription.medicines} medicines
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`status-badge ${
                      prescription.status === "active"
                        ? "status-success"
                        : "status-pending"
                    }`}
                  >
                    {prescription.status === "active" ? "Active" : "Completed"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </PageTransition>

      <BottomNav />
    </div>
  );
};

export default Prescriptions;
