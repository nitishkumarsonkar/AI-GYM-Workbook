// Supabase Edge Function: recommend-exercises
// Calls Gemini API server-side and returns goal-based exercise recommendations.

// NOTE: This file runs on Supabase Edge Runtime (Deno).
// Declaring Deno keeps TypeScript in the Expo app (tsc) from erroring.
declare const Deno: {
  env: { get: (key: string) => string | undefined };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

type GoalType =
  | 'mass_gain'
  | 'fat_loss'
  | 'muscle_gain'
  | 'strength'
  | 'endurance'
  | 'mobility';

type GoalRecommendation = {
  name: string;
  category: 'gym' | 'cardio' | 'mobility' | 'mixed';
  primaryMuscles?: string[];
  equipment?: string[];
  sets?: string;
  duration?: string;
  steps?: string[];
  safetyTips?: string[];
  rationale?: string;
};

type RequestBody = {
  goal?: GoalType;
  count?: number;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

function clampCount(count: unknown) {
  const n = typeof count === 'number' ? count : Number(count);
  if (!Number.isFinite(n)) return 5;
  return Math.max(1, Math.min(10, Math.floor(n)));
}

function isGoalType(goal: unknown): goal is GoalType {
  return (
    goal === 'mass_gain' ||
    goal === 'fat_loss' ||
    goal === 'muscle_gain' ||
    goal === 'strength' ||
    goal === 'endurance' ||
    goal === 'mobility'
  );
}

function coerceCategory(v: unknown): GoalRecommendation['category'] {
  if (v === 'gym' || v === 'cardio' || v === 'mobility' || v === 'mixed') return v;
  return 'mixed';
}

function sanitizeRecommendations(input: unknown): GoalRecommendation[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      const obj = item && typeof item === 'object' ? (item as Record<string, unknown>) : null;
      const name = obj?.name;
      if (typeof name !== 'string' || name.trim().length === 0) return null;

      const rec: GoalRecommendation = {
        name: name.trim(),
        category: coerceCategory(obj?.category),
      };

      const maybeStringArray = (v: unknown) =>
        Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined;

      const primaryMuscles = maybeStringArray(obj?.primaryMuscles);
      if (primaryMuscles?.length) rec.primaryMuscles = primaryMuscles;

      const equipment = maybeStringArray(obj?.equipment);
      if (equipment?.length) rec.equipment = equipment;

      if (typeof obj?.sets === 'string' && obj.sets.trim()) rec.sets = obj.sets.trim();
      if (typeof obj?.duration === 'string' && obj.duration.trim()) rec.duration = obj.duration.trim();

      const steps = maybeStringArray(obj?.steps);
      if (steps?.length) rec.steps = steps;

      const safetyTips = maybeStringArray(obj?.safetyTips);
      if (safetyTips?.length) rec.safetyTips = safetyTips;

      if (typeof obj?.rationale === 'string' && obj.rationale.trim()) rec.rationale = obj.rationale.trim();

      return rec;
    })
    .filter((x): x is GoalRecommendation => !!x);
}

async function callGemini(params: { apiKey: string; prompt: string }) {
  const { apiKey, prompt } = params;

  // Using Gemini REST API (Generative Language API)
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
    encodeURIComponent(apiKey);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 900,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini request failed: ${res.status} ${text}`);
  }

  return (await res.json()) as any;
}

function buildPrompt(params: { goal: GoalType; count: number }) {
  const { goal, count } = params;
  return `You are a certified personal trainer.

Goal: ${goal}
Return exactly ${count} exercise recommendations.

Rules:
- Output MUST be valid JSON only (no markdown, no code fences).
- Each recommendation should be safe for a general healthy adult.
- Include a short rationale for why it fits the goal.
- Category must be one of: "gym", "cardio", "mobility", "mixed".

JSON schema:
{
  "goal": string,
  "recommendations": [
    {
      "name": string,
      "category": "gym"|"cardio"|"mobility"|"mixed",
      "primaryMuscles": string[] (optional),
      "equipment": string[] (optional),
      "sets": string (optional),
      "duration": string (optional),
      "steps": string[] (optional),
      "safetyTips": string[] (optional),
      "rationale": string (optional)
    }
  ]
}
`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return jsonResponse(
        { error: 'Missing GEMINI_API_KEY secret on Edge Function.' },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;
    if (!isGoalType(body.goal)) {
      return jsonResponse(
        {
          error:
            'Invalid goal. Expected one of: mass_gain, fat_loss, muscle_gain, strength, endurance, mobility.',
        },
        { status: 400 }
      );
    }

    const count = clampCount(body.count);
    const prompt = buildPrompt({ goal: body.goal, count });

    const raw = await callGemini({ apiKey, prompt });

    // Gemini returns text inside candidates[0].content.parts[0].text
    const text =
      raw?.candidates?.[0]?.content?.parts?.[0]?.text ??
      raw?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join('') ??
      '';

    const parsed = typeof text === 'string' ? JSON.parse(text) : text;

    const recommendations = sanitizeRecommendations(parsed?.recommendations);
    return jsonResponse({ goal: body.goal, recommendations });
  } catch (e) {
    return jsonResponse(
      {
        error: 'Failed to generate recommendations',
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
});
