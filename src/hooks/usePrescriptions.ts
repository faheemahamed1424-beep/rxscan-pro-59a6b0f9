import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  user_id: string;
  medicines: Medicine[];
  confidence_score: number | null;
  raw_text: string | null;
  image_url: string | null;
  scan_date: string;
  created_at: string;
}

export const usePrescriptions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["prescriptions", user?.id],
    queryFn: async (): Promise<Prescription[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .order("scan_date", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        medicines: (item.medicines as unknown as Medicine[]) || []
      }));
    },
    enabled: !!user,
  });
};

export const useSavePrescription = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (prescription: {
      medicines: Medicine[];
      confidence_score: number;
      raw_text: string;
      image_url?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("prescriptions")
        .insert({
          user_id: user.id,
          medicines: JSON.parse(JSON.stringify(prescription.medicines)),
          confidence_score: prescription.confidence_score,
          raw_text: prescription.raw_text,
          image_url: prescription.image_url,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
};

export const useDeletePrescription = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (prescriptionId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("prescriptions")
        .delete()
        .eq("id", prescriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
};
