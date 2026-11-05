import { NextRequest, NextResponse } from "next/server";
import {
  callGeminiFlash,
  extractJsonFromText,
  HeritageAnalysisResult,
} from "@/lib/gemini";
import { validateServerPayload } from "@/lib/imageUtils";

export const maxDuration = 60; // Allow sufficient time for multimodal reasoning and search grounding

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, placeNameHint, locationHint } = body;

    // 1. Strict server-side image payload validation
    const validation = validateServerPayload(imageBase64, mimeType);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 2. Build system instruction and multimodal prompt
    const systemInstruction = `You are a respectful, objective cultural heritage analyst and architectural guide for Explore Local.
CRITICAL ACCURACY & GROUNDING RULES:
1. Photos can be ambiguous, obscured, or taken from unusual angles. Citations and visual recognition DO NOT guarantee ground truth.
2. If you are not 100% certain of the specific landmark, or if it is a general building/sculpture, classify it as "visual_estimate" or "tentative_match" with isUncertain = true.
3. NEVER invent historical claims, false dates, or fictitious legends as verified facts. If specific documented history is not grounded in reliable records, state the apparent architectural style, period characteristics, and construction methods instead, and explicitly disclaim the absence of verified historical archives.
4. If search sources are retrieved, use them for accurate context and do not contradict them.
5. Provide a captivating, respectful story suitable for audio narration.

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "placeName": "Name of landmark or 'Architectural Study: [Style / Structure Type]'",
  "isUncertain": true | false,
  "identificationType": "visual_estimate" | "tentative_match" | "sourced_reference",
  "uncertaintyDisclaimer": "Clear, honest statement about whether this is a visual estimate or has corroborating records.",
  "story": "Engaging, vivid 2-3 paragraph narrative covering visual highlights, architectural aesthetics, and verified or tentative background.",
  "architecturalStyle": "Identified or apparent architectural style (e.g. Gothic Revival, Mughal, Art Deco, Vernacular)",
  "observedFeatures": ["List 3-5 distinct visible physical features observable in the photo"],
  "historicalContext": "Documented historical period or era characteristics without invented claims",
  "visitorCautionNote": "Practical visitor note, e.g. dress code, conservation respect, or reminder to verify hours locally"
}`;

    let userPromptText = `Analyze this heritage or architectural photo.`;
    if (placeNameHint && placeNameHint.trim()) {
      userPromptText += ` The user indicates this might be or relates to: "${placeNameHint.trim()}".`;
    }
    if (locationHint && locationHint.trim()) {
      userPromptText += ` The user reports the location / region as: "${locationHint.trim()}".`;
    }
    userPromptText += ` Identify the structure or architectural style, assess certainty, describe the visible features, and explain its significance without fabricating unverified history.`;

    // 3. Multimodal call to Gemini 3.5 Flash
    const { text, sources } = await callGeminiFlash({
      systemInstruction,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            {
              text: userPromptText,
            },
          ],
        },
      ],
      enableSearchGrounding: true,
    });

    // 4. Parse structured JSON from model
    let parsed: Omit<HeritageAnalysisResult, "groundingSources" | "mapsSearchUrl">;
    try {
      parsed = extractJsonFromText(text);
    } catch {
      // Fallback if model returned plain text narrative
      parsed = {
        placeName: placeNameHint || "Architectural Observation",
        isUncertain: true,
        identificationType: "visual_estimate",
        uncertaintyDisclaimer:
          "Visual identification could not be conclusively verified against ground truth archives.",
        story: text,
        architecturalStyle: "Historic / Regional Architecture",
        observedFeatures: ["Visual elements visible in the provided photograph"],
        historicalContext: "Historical details require independent on-site corroboration.",
        visitorCautionNote: "Please consult local heritage authorities for verified access information.",
      };
    }

    // 5. Construct Maps verification search query
    const searchTarget = parsed.placeName || placeNameHint || "heritage landmark";
    const locationSuffix = locationHint ? ` ${locationHint}` : "";
    const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      searchTarget + locationSuffix
    )}`;

    const result: HeritageAnalysisResult = {
      ...parsed,
      groundingSources: sources,
      mapsSearchUrl,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Heritage Lens API Error:", error.message);

    // Differentiate client-friendly error messages
    const isMissingKey = error.message.includes("GEMINI_API_KEY");
    const isQuota = error.message.includes("quota") || error.message.includes("429");

    return NextResponse.json(
      {
        error: error.message || "Failed to analyze heritage image.",
        isMissingKey,
        isQuota,
      },
      { status: isMissingKey ? 503 : isQuota ? 429 : 500 }
    );
  }
}
