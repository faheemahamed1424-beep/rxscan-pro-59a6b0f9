import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DrugInfo {
  validated: boolean;
  brandName: string;
  genericName: string;
  manufacturer?: string;
  drugClass?: string;
  activeIngredients?: string[];
  dosageForms?: string[];
  route?: string[];
  warnings?: string[];
  indications?: string;
  contraindications?: string;
  sideEffects?: string[];
  interactions?: string[];
  storageInstructions?: string;
  fdaApproved?: boolean;
  message?: string;
}

export interface ValidationResult {
  originalName: string;
  validated: boolean;
  data?: DrugInfo;
}

export function useMedicineValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<Map<string, DrugInfo>>(new Map());
  const { toast } = useToast();

  const validateMedicine = async (medicineName: string): Promise<DrugInfo | null> => {
    // Check cache first
    if (validationResults.has(medicineName.toLowerCase())) {
      return validationResults.get(medicineName.toLowerCase()) || null;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-medicine', {
        body: { medicineName }
      });

      if (error) {
        console.error('Validation error:', error);
        toast({
          title: "Validation Error",
          description: "Could not validate medicine against FDA database.",
          variant: "destructive"
        });
        return null;
      }

      const drugInfo = data?.data as DrugInfo;
      
      // Cache the result
      setValidationResults(prev => {
        const newMap = new Map(prev);
        newMap.set(medicineName.toLowerCase(), drugInfo);
        return newMap;
      });

      return drugInfo;
    } catch (error) {
      console.error('Validation error:', error);
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const validateMedicines = async (medicines: Array<{ name: string }>): Promise<ValidationResult[]> => {
    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-medicine', {
        body: { medicines }
      });

      if (error) {
        console.error('Batch validation error:', error);
        return medicines.map(m => ({ originalName: m.name, validated: false }));
      }

      const results = data?.data as ValidationResult[];
      
      // Cache all results
      setValidationResults(prev => {
        const newMap = new Map(prev);
        results?.forEach(result => {
          if (result.validated && result.data) {
            newMap.set(result.originalName.toLowerCase(), result.data);
          }
        });
        return newMap;
      });

      return results || [];
    } catch (error) {
      console.error('Batch validation error:', error);
      return medicines.map(m => ({ originalName: m.name, validated: false }));
    } finally {
      setIsValidating(false);
    }
  };

  const getCachedInfo = (medicineName: string): DrugInfo | undefined => {
    return validationResults.get(medicineName.toLowerCase());
  };

  return {
    validateMedicine,
    validateMedicines,
    getCachedInfo,
    isValidating,
    validationResults
  };
}
