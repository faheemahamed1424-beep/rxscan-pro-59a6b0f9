import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DrugInfo {
  validated: boolean;
  brandName: string;
  genericName: string;
  manufacturer: string;
  drugClass: string;
  activeIngredients: string[];
  dosageForms: string[];
  route: string[];
  warnings: string[];
  indications: string;
  contraindications: string;
  sideEffects: string[];
  interactions: string[];
  storageInstructions: string;
  fdaApproved: boolean;
}

async function searchOpenFDA(medicineName: string): Promise<DrugInfo | null> {
  const cleanName = medicineName.trim().toLowerCase();
  
  // Try multiple search strategies
  const searchQueries = [
    `openfda.brand_name:"${cleanName}"`,
    `openfda.generic_name:"${cleanName}"`,
    `openfda.substance_name:"${cleanName}"`,
  ];

  for (const query of searchQueries) {
    try {
      const url = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(query)}&limit=1`;
      console.log('Searching OpenFDA:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) continue; // No results, try next query
        console.error('OpenFDA error:', response.status);
        continue;
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const drug = data.results[0];
        const openfda = drug.openfda || {};

        return {
          validated: true,
          brandName: openfda.brand_name?.[0] || medicineName,
          genericName: openfda.generic_name?.[0] || 'Not available',
          manufacturer: openfda.manufacturer_name?.[0] || 'Not available',
          drugClass: openfda.pharm_class_epc?.[0] || openfda.pharm_class_moa?.[0] || 'Not classified',
          activeIngredients: openfda.substance_name || [],
          dosageForms: openfda.dosage_form || [],
          route: openfda.route || [],
          warnings: extractSection(drug.warnings) || extractSection(drug.boxed_warning) || [],
          indications: extractText(drug.indications_and_usage) || 'See package insert',
          contraindications: extractText(drug.contraindications) || 'See package insert',
          sideEffects: extractSection(drug.adverse_reactions) || [],
          interactions: extractSection(drug.drug_interactions) || [],
          storageInstructions: extractText(drug.storage_and_handling) || 'Store as directed',
          fdaApproved: true,
        };
      }
    } catch (error) {
      console.error('OpenFDA search error:', error);
      continue;
    }
  }

  return null;
}

function extractText(field: string[] | undefined): string {
  if (!field || field.length === 0) return '';
  // Get first entry and clean it up
  let text = field[0];
  // Remove excessive whitespace
  text = text.replace(/\s+/g, ' ').trim();
  // Limit length for display
  if (text.length > 500) {
    text = text.substring(0, 500) + '...';
  }
  return text;
}

function extractSection(field: string[] | undefined): string[] {
  if (!field || field.length === 0) return [];
  
  const text = field[0];
  // Split by common delimiters and clean up
  const items = text
    .split(/[•\n\r]+/)
    .map(item => item.replace(/\s+/g, ' ').trim())
    .filter(item => item.length > 10 && item.length < 200)
    .slice(0, 5); // Limit to 5 items
  
  return items;
}

async function searchRxNorm(medicineName: string): Promise<{ rxcui: string; name: string } | null> {
  try {
    const url = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(medicineName)}&search=2`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const rxcui = data.idGroup?.rxnormId?.[0];
    
    if (rxcui) {
      // Get drug properties
      const propsUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`;
      const propsResponse = await fetch(propsUrl);
      
      if (propsResponse.ok) {
        const propsData = await propsResponse.json();
        return {
          rxcui,
          name: propsData.properties?.name || medicineName
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('RxNorm search error:', error);
    return null;
  }
}

async function getDrugInteractions(rxcui: string): Promise<string[]> {
  try {
    const url = `https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=${rxcui}`;
    const response = await fetch(url);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const interactions: string[] = [];
    
    const groups = data.interactionTypeGroup || [];
    for (const group of groups) {
      for (const type of group.interactionType || []) {
        for (const pair of type.interactionPair || []) {
          if (pair.description && interactions.length < 5) {
            interactions.push(pair.description);
          }
        }
      }
    }
    
    return interactions;
  } catch (error) {
    console.error('Drug interaction search error:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { medicineName, medicines } = await req.json();

    // Handle single medicine validation
    if (medicineName) {
      console.log('Validating medicine:', medicineName);
      
      // Try OpenFDA first
      let drugInfo = await searchOpenFDA(medicineName);
      
      // If not found in OpenFDA, try RxNorm for basic validation
      if (!drugInfo) {
        const rxnormResult = await searchRxNorm(medicineName);
        if (rxnormResult) {
          const interactions = await getDrugInteractions(rxnormResult.rxcui);
          drugInfo = {
            validated: true,
            brandName: rxnormResult.name,
            genericName: rxnormResult.name,
            manufacturer: 'Not available',
            drugClass: 'Not classified',
            activeIngredients: [],
            dosageForms: [],
            route: [],
            warnings: [],
            indications: 'Consult your healthcare provider',
            contraindications: 'Consult your healthcare provider',
            sideEffects: [],
            interactions,
            storageInstructions: 'Store as directed',
            fdaApproved: false, // Can't confirm via RxNorm
          };
        }
      }

      if (drugInfo) {
        return new Response(
          JSON.stringify({ success: true, data: drugInfo }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          data: {
            validated: false,
            brandName: medicineName,
            genericName: 'Not found in database',
            message: 'Medicine not found in FDA database. Please verify the spelling or consult your pharmacist.'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle batch validation
    if (medicines && Array.isArray(medicines)) {
      const results = await Promise.all(
        medicines.map(async (med: { name: string }) => {
          const drugInfo = await searchOpenFDA(med.name);
          return {
            originalName: med.name,
            ...drugInfo,
            validated: !!drugInfo
          };
        })
      );

      return new Response(
        JSON.stringify({ success: true, data: results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'No medicine name or medicines array provided' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-medicine:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to validate medicine';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
