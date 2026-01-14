import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image, Upload as UploadIcon, X, ArrowLeft, Scan } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";

const UploadPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (selectedImage) {
      navigate("/processing");
    }
  };

  return (
    <div className="page-container bg-background">
      <PageTransition>
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Upload Prescription</h1>
              <p className="text-muted-foreground text-sm">Take a photo or choose from gallery</p>
            </div>
          </div>

          {/* Upload Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="action-card gradient-bg text-center"
            >
              <Camera className="w-8 h-8 text-white mx-auto mb-2" />
              <span className="font-semibold text-white">Camera</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="action-card bg-gradient-to-br from-emerald-500 to-teal-600 text-center"
            >
              <Image className="w-8 h-8 text-white mx-auto mb-2" />
              <span className="font-semibold text-white">Gallery</span>
            </motion.button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Drop Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 ${
              isDragging
                ? "border-primary bg-primary/5"
                : selectedImage
                ? "border-success bg-success/5"
                : "border-border bg-muted/30"
            }`}
          >
            <AnimatePresence mode="wait">
              {selectedImage ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative p-4"
                >
                  <img
                    src={selectedImage}
                    alt="Selected prescription"
                    className="w-full h-64 object-contain rounded-2xl"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-6 right-6 w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="status-badge status-success inline-flex items-center gap-2">
                      ✅ Image ready for analysis
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 px-8 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📋</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Drop prescription here
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    or click the buttons above to upload
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 glass-card-solid rounded-2xl p-5"
          >
            <h3 className="font-semibold text-foreground mb-3">📝 Tips for best results</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Ensure good lighting and clear focus
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Include the entire prescription in frame
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Avoid shadows and reflections
              </li>
            </ul>
          </motion.div>

          {/* Analyze Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={selectedImage ? { scale: 1.02 } : {}}
            whileTap={selectedImage ? { scale: 0.98 } : {}}
            onClick={handleAnalyze}
            disabled={!selectedImage}
            className={`w-full mt-6 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
              selectedImage
                ? "btn-gradient"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            <Scan className="w-5 h-5" />
            🔍 Analyze Prescription
          </motion.button>
        </div>
      </PageTransition>

      <BottomNav />
    </div>
  );
};

export default UploadPage;
