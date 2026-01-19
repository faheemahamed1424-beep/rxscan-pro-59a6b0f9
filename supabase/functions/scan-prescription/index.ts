import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  form?: string;
  route?: string;
}

interface OCRResult {
  medicines: Medicine[];
  confidence: number;
  rawText: string;
  doctorName?: string;
  patientName?: string;
  prescriptionDate?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Clean base64 string (remove data URL prefix if present)
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    // Use tool calling for structured output extraction
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are an expert medical prescription OCR and analysis system with deep knowledge of:
- Pharmaceutical drug names (brand names, generic names, and common abbreviations)
- Medical terminology and Latin abbreviations (e.g., BID=twice daily, TID=three times daily, QID=four times daily, PRN=as needed, PO=by mouth, HS=at bedtime, AC=before meals, PC=after meals)
- Standard dosage forms (tablets, capsules, syrup, injection, cream, ointment, drops, inhaler)
- Common prescription patterns and handwriting styles

Your task is to accurately extract ALL medicine information from prescription images with high precision.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Carefully analyze this prescription image and extract all medicine information.

ANALYSIS STEPS:
1. First, identify and read all text in the image, including handwritten content
2. Identify the prescription format (hospital/clinic/handwritten)
3. Look for medicine names - they may be abbreviated, handwritten, or in different languages
4. Extract dosage information (mg, ml, IU, etc.)
5. Identify frequency using medical abbreviations or plain text
6. Find duration/quantity prescribed
7. Note any special instructions

COMMON ABBREVIATIONS TO RECOGNIZE:
- Frequency: OD/QD (once daily), BID/BD (twice daily), TID (three times), QID (four times), PRN (as needed), SOS (if needed), HS (at bedtime), Q4H/Q6H/Q8H (every 4/6/8 hours)
- Timing: AC (before meals), PC (after meals), AM (morning), PM (evening)
- Route: PO (oral), IM (intramuscular), IV (intravenous), SC/SQ (subcutaneous), TOP (topical)
- Quantity: Tab (tablet), Cap (capsule), Amp (ampule), Vial, Syr (syrup)

IMPORTANT GUIDELINES:
- Be thorough - extract EVERY medicine mentioned
- For unclear handwriting, provide your best interpretation with confidence reflected in the score
- Expand all abbreviations to full meanings in the output
- If duration is given as quantity (e.g., "30 tablets"), calculate approximate duration based on frequency
- Standard medicine names should be capitalized properly
- Include any warnings or special notes (e.g., "avoid alcohol", "take with food")

Call the extract_prescription_data function with all extracted information.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${cleanBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_prescription_data',
              description: 'Extract structured prescription data from the analyzed image',
              parameters: {
                type: 'object',
                properties: {
                  medicines: {
                    type: 'array',
                    description: 'List of all medicines found in the prescription',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                          description: 'Full medicine name (brand or generic), properly capitalized'
                        },
                        dosage: {
                          type: 'string',
                          description: 'Dosage strength (e.g., "500mg", "10ml", "5mg/ml")'
                        },
                        frequency: {
                          type: 'string',
                          description: 'How often to take (expanded, e.g., "Twice daily" not "BID")'
                        },
                        duration: {
                          type: 'string',
                          description: 'How long to take (e.g., "7 days", "14 days", "Until finished")'
                        },
                        instructions: {
                          type: 'string',
                          description: 'Special instructions (e.g., "After meals", "With plenty of water")'
                        },
                        form: {
                          type: 'string',
                          description: 'Dosage form (tablet, capsule, syrup, cream, etc.)'
                        },
                        route: {
                          type: 'string',
                          description: 'Route of administration (oral, topical, injection, etc.)'
                        }
                      },
                      required: ['name', 'dosage', 'frequency', 'duration', 'instructions']
                    }
                  },
                  confidence: {
                    type: 'number',
                    description: 'Confidence score 0-100 based on image clarity, text legibility, and extraction certainty. 90+ for clear typed text, 70-89 for clear handwriting, 50-69 for partially legible, below 50 for poor quality'
                  },
                  rawText: {
                    type: 'string',
                    description: 'Complete raw text extracted from the prescription image'
                  },
                  doctorName: {
                    type: 'string',
                    description: 'Name of the prescribing doctor if visible'
                  },
                  patientName: {
                    type: 'string',
                    description: 'Name of the patient if visible'
                  },
                  prescriptionDate: {
                    type: 'string',
                    description: 'Date of the prescription if visible (format: YYYY-MM-DD)'
                  }
                },
                required: ['medicines', 'confidence', 'rawText']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_prescription_data' } },
        max_completion_tokens: 3000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    // Extract result from tool call
    let result: OCRResult;
    
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall && toolCall.function?.arguments) {
      try {
        result = JSON.parse(toolCall.function.arguments);
      } catch (parseError) {
        console.error('Failed to parse tool call arguments:', toolCall.function.arguments);
        throw new Error('Failed to parse AI response');
      }
    } else {
      // Fallback to content parsing if tool call not present
      const content = aiResponse.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }
      
      try {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                          content.match(/```\s*([\s\S]*?)\s*```/) ||
                          [null, content];
        const jsonStr = jsonMatch[1] || content;
        result = JSON.parse(jsonStr.trim());
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        result = {
          medicines: [],
          confidence: 0,
          rawText: content
        };
      }
    }

    // Validate and ensure structure
    if (!result.medicines || !Array.isArray(result.medicines)) {
      result.medicines = [];
    }

    // Ensure all medicines have required fields with defaults
    result.medicines = result.medicines.map(med => ({
      name: med.name || 'Unknown Medicine',
      dosage: med.dosage || 'Not specified',
      frequency: med.frequency || 'As directed',
      duration: med.duration || 'As prescribed',
      instructions: med.instructions || 'Follow doctor\'s instructions',
      form: med.form,
      route: med.route
    }));

    // Ensure confidence is within bounds
    result.confidence = Math.min(100, Math.max(0, result.confidence || 0));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scan-prescription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process prescription';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
