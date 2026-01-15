import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Medicine {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ScanResult {
  medicines: Medicine[];
  confidence: number;
  rawText: string;
}

export function usePrescriptionScan() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const scanPrescription = async (imageBase64: string) => {
    setIsScanning(true);
    setError(null);
    setProgress(0);
    setCurrentStep(0);

    try {
      // Step 1: Image preprocessing
      setCurrentStep(1);
      setProgress(15);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Starting OCR
      setCurrentStep(2);
      setProgress(30);

      const { data, error: fnError } = await supabase.functions.invoke('scan-prescription', {
        body: { imageBase64 }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to scan prescription');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Step 3: Text parsing
      setCurrentStep(3);
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 4: Medicine identification
      setCurrentStep(4);
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Add IDs to medicines
      const medicinesWithIds = (data.medicines || []).map((med: Omit<Medicine, 'id'>, index: number) => ({
        ...med,
        id: index + 1
      }));

      const scanResult: ScanResult = {
        medicines: medicinesWithIds,
        confidence: data.confidence || 0,
        rawText: data.rawText || ''
      };

      setResult(scanResult);
      setProgress(100);

      return scanResult;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsScanning(false);
    }
  };

  const reset = () => {
    setIsScanning(false);
    setProgress(0);
    setCurrentStep(0);
    setError(null);
    setResult(null);
  };

  return {
    scanPrescription,
    isScanning,
    progress,
    currentStep,
    error,
    result,
    reset
  };
}
