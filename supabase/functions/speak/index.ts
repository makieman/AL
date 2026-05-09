import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Referral {
  referralId: string;
  doctorWallet: string;
  patientWallet: string;
  fromFacility: string;
  toFacility: string;
  toFacilityWallet: string;
  notes: string;
  urgency: 'low' | 'medium' | 'urgent';
  timestamp: number;
  status: 'pending' | 'paid' | 'completed';
  paymentTx?: string;
  app: 'afyalink';
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { referral } = (await req.json()) as { referral: Referral };

    if (!referral || !referral.toFacility) {
      return new Response(
        JSON.stringify({ error: "Missing referral data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const text = `You have been referred to ${referral.toFacility} from ${referral.fromFacility} for ${referral.notes}. This referral is marked ${referral.urgency} priority. Your referral ID begins with ${referral.referralId.slice(0, 8)}. Please show the QR code at reception.`;

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const elevenLabsResponse = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('ElevenLabs error:', errorText);
      return new Response(
        JSON.stringify({ error: "Voice synthesis failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await elevenLabsResponse.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error('Speak function error:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
