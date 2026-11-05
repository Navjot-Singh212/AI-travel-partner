import { NextRequest, NextResponse } from "next/server";
import {
  callGeminiFlash,
  extractJsonFromText,
  VibePlaceResult,
  TripPlannerResult,
} from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, area, vibe, destination, durationDays, pace, interests } = body;

    if (mode === "vibe") {
      if (!area || typeof area !== "string" || !area.trim()) {
        return NextResponse.json(
          { error: "Please provide an area, city, or neighborhood to explore." },
          { status: 400 }
        );
      }
      if (!vibe || typeof vibe !== "string" || !vibe.trim()) {
        return NextResponse.json(
          { error: "Please enter or select a vibe (e.g. sandy, eerie, joyful, cute)." },
          { status: 400 }
        );
      }

      const cleanArea = area.trim();
      const cleanVibe = vibe.trim();

      const systemInstruction = `You are a perceptive local travel curator for Explore Local.
CRITICAL DATA & ACCURACY INSTRUCTIONS:
1. Recommend ONLY genuine, verifiable real-world locations, parks, architecture, streets, or landmarks in or very close to "${cleanArea}".
2. NEVER invent fake business names, imaginary ruins, or fictitious cafes. If you cannot find multiple verified places matching the vibe in this specific area, return fewer places or indicate that the vibe is rare in this area rather than inventing fictional spots.
3. NEVER claim real-time live crowd levels, current admission fees, or exact daily operating hours without a verifiable source. Instead, provide a verification reminder.
4. Explain clearly and vividly why each real location embodies the vibe: "${cleanVibe}".

Respond ONLY with a valid JSON object matching this schema:
{
  "places": [
    {
      "name": "Actual Real Place or Landmark Name",
      "neighborhoodOrArea": "Neighborhood or specific part of ${cleanArea}",
      "vibeFitReason": "Why this real location matches the '${cleanVibe}' atmosphere",
      "vibeKeywords": ["3-4 descriptive mood words"],
      "highlights": ["2-3 specific real features to look out for"],
      "verificationTip": "Helpful tip for visitors (e.g., recommend checking daylight hours or local transport)"
    }
  ]
}`;

      const userPrompt = `Find real, grounded places in "${cleanArea}" that evoke a "${cleanVibe}" vibe. Return 3 to 4 distinct real places.`;

      const { text, sources } = await callGeminiFlash({
        systemInstruction,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        enableSearchGrounding: true,
      });

      let parsed: { places: Omit<VibePlaceResult, "mapsSearchUrl" | "sources">[] };
      try {
        parsed = extractJsonFromText(text);
      } catch {
        parsed = { places: [] };
      }

      const places: VibePlaceResult[] = (parsed.places || []).map((p) => ({
        ...p,
        mapsSearchUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${p.name} ${cleanArea}`
        )}`,
        sources,
      }));

      return NextResponse.json({
        area: cleanArea,
        vibe: cleanVibe,
        places,
        sources,
      });
    }

    if (mode === "trip") {
      if (!destination || typeof destination !== "string" || !destination.trim()) {
        return NextResponse.json(
          { error: "Please enter a destination for the trip planner." },
          { status: 400 }
        );
      }

      const cleanDest = destination.trim();
      const days = Math.min(Math.max(Number(durationDays) || 1, 1), 5); // 1 to 5 days
      const travelPace = pace || "moderate";
      const interestList = Array.isArray(interests) && interests.length > 0 ? interests.join(", ") : "general culture and sightseeing";

      const systemInstruction = `You are an expert itinerary architect for Explore Local.
CRITICAL GROUNDING RULES:
1. Use ONLY real, geographically coherent attractions, landmarks, districts, and walking routes in "${cleanDest}".
2. Group morning, afternoon, and evening stops so the traveler does not waste hours traveling back and forth.
3. DO NOT claim live wait times, current opening hours, or crowd predictions without verified sources.
4. Adapt the itinerary to the requested duration of ${days} day(s), a ${travelPace} pace, focusing on: ${interestList}.

Respond ONLY with a valid JSON object matching this schema:
{
  "destination": "${cleanDest}",
  "summary": "1-2 sentence overview of the journey's focus",
  "pacingNote": "Explanation of how this plan balances travel time at a ${travelPace} pace",
  "unverifiedNote": "Reminder to verify opening days, seasonal closures, and ticket bookings locally",
  "itinerary": [
    {
      "dayNumber": 1,
      "theme": "Descriptive Day Title",
      "morning": {
        "place": "Real landmark or neighborhood",
        "activity": "What to explore or experience",
        "tip": "Practical travel tip"
      },
      "afternoon": {
        "place": "Real landmark or district",
        "activity": "What to explore or experience",
        "tip": "Practical travel tip"
      },
      "evening": {
        "place": "Real landmark, promenade, or cultural district",
        "activity": "What to explore or experience",
        "tip": "Practical travel tip"
      }
    }
  ]
}`;

      const userPrompt = `Create a realistic ${days}-day itinerary for ${cleanDest}. Pace: ${travelPace}. Interests: ${interestList}.`;

      const { text, sources } = await callGeminiFlash({
        systemInstruction,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        enableSearchGrounding: true,
      });

      let parsed: TripPlannerResult;
      try {
        const raw = extractJsonFromText<TripPlannerResult>(text);
        parsed = {
          ...raw,
          destination: cleanDest,
          sources,
          itinerary: (raw.itinerary || []).map((day) => ({
            ...day,
            morning: {
              ...day.morning,
              mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${day.morning?.place || cleanDest} ${cleanDest}`
              )}`,
            },
            afternoon: {
              ...day.afternoon,
              mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${day.afternoon?.place || cleanDest} ${cleanDest}`
              )}`,
            },
            evening: {
              ...day.evening,
              mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${day.evening?.place || cleanDest} ${cleanDest}`
              )}`,
            },
          })),
        };
      } catch {
        throw new Error("Unable to parse structured itinerary from Gemini response. Please try again.");
      }

      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: "Invalid mode specified. Choose 'vibe' or 'trip'." }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Explore API Error:", error.message);

    const isMissingKey = error.message.includes("GEMINI_API_KEY");
    const isQuota = error.message.includes("quota") || error.message.includes("429");

    return NextResponse.json(
      {
        error: error.message || "Failed to process request.",
        isMissingKey,
        isQuota,
      },
      { status: isMissingKey ? 503 : isQuota ? 429 : 500 }
    );
  }
}
