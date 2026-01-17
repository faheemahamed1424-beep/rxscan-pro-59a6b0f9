import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Filter, Plus, Calendar, Pill, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { usePrescriptions, useDeletePrescription } from "@/hooks/usePrescriptions";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const Prescriptions = () => {
  const navigate = useNavigate();
  const { data: prescriptions = [], isLoading } = usePrescriptions();
  const deletePrescription = useDeletePrescription();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");

  const totalMedicines = prescriptions.reduce((acc, p) => acc + p.medicines.length, 0);

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setDeleteId(id);
    setDeleteName(name);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deletePrescription.mutateAsync(deleteId);
      toast({
        title: "Prescription Deleted",
        description: "The prescription has been removed from your history.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
      setDeleteName("");
    }
  };

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
              <p className="text-2xl font-bold text-foreground">{totalMedicines}</p>
              <p className="text-xs text-muted-foreground">Total Meds</p>
            </div>
            <div className="glass-card-solid rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">✅</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{prescriptions.length}</p>
              <p className="text-xs text-muted-foreground">Scans</p>
            </div>
            <div className="glass-card-solid rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {prescriptions.length > 0 
                  ? Math.round(prescriptions.reduce((acc, p) => acc + (p.confidence_score || 0), 0) / prescriptions.length)
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Conf.</p>
            </div>
          </motion.div>
        </div>

        {/* Prescriptions List */}
        <div className="px-6">
          <h2 className="section-header">All Prescriptions</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground mt-4">Loading prescriptions...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-12 glass-card-solid rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-muted-foreground mb-4">No prescriptions yet</p>
              <button
                onClick={() => navigate("/upload")}
                className="btn-gradient px-6 py-3 rounded-xl font-medium"
              >
                Scan Your First Prescription
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription, index) => (
                <motion.div
                  key={prescription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => {
                    sessionStorage.setItem('scanResult', JSON.stringify({
                      medicines: prescription.medicines.map((m, i) => ({ ...m, id: i })),
                      confidence: prescription.confidence_score,
                      rawText: prescription.raw_text,
                    }));
                    navigate("/results");
                  }}
                  className="glass-card-solid rounded-2xl p-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl">📋</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {prescription.medicines[0]?.name || "Prescription"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {prescription.medicines.length} medicine{prescription.medicines.length !== 1 ? "s" : ""}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(prescription.scan_date), "MMM d, yyyy")}
                          </span>
                          <span className="text-xs text-primary font-medium">
                            {prescription.confidence_score}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="status-badge status-success">
                        Saved
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleDeleteClick(e, prescription.id, prescription.medicines[0]?.name || "Prescription")}
                        className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </PageTransition>

      <BottomNav />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prescription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePrescription.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Prescriptions;
