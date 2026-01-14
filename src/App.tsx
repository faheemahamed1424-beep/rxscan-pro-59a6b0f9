import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/Upload";
import Processing from "./pages/Processing";
import Results from "./pages/Results";
import MedicineDetails from "./pages/MedicineDetails";
import Reminders from "./pages/Reminders";
import Prescriptions from "./pages/Prescriptions";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/processing" element={<Processing />} />
            <Route path="/results" element={<Results />} />
            <Route path="/medicine-details" element={<MedicineDetails />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
