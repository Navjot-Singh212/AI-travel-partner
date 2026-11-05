"use client";

import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Tag,
  Footprints,
  Info,
} from "lucide-react";
import type { VibePlaceResult, TripPlannerResult, GroundingSource } from "@/lib/gemini";

const POPULAR_VIBE_CHIPS = [
  { label: "Sandy", emoji: "🏖️" },
  { label: "Eerie", emoji: "🌫️" },
  { label: "Joyful", emoji: "✨" },
  { label: "Cute", emoji: "🌸" },
  { label: "Historic", emoji: "🏛️" },
  { label: "Serene", emoji: "🌿" },
  { label: "Mystical", emoji: "🔮" },
];

const INTEREST_OPTIONS = [
  "Architecture & Heritage",
  "Scenic Walking",
  "Local Food & Markets",
  "Nature & Green Spaces",
  "Photography Spots",
  "Art & History",
];

export default function ExploreSection() {
  const [activeTab, setActiveTab] = useState<"vibe" | "trip">("vibe");

  // Vibe Discovery State
  const [vibeArea, setVibeArea] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("eerie");
  const [customVibe, setCustomVibe] = useState("");
  const [isVibeLoading, setIsVibeLoading] = useState(false);
  const [vibeError, setVibeError] = useState<string | null>(null);
  const [vibeResults, setVibeResults] = useState<{
    area: string;
    vibe: string;
    places: VibePlaceResult[];
    sources: GroundingSource[];
  } | null>(null);

  // Trip Planner State
  const [tripDestination, setTripDestination] = useState("");
  const [tripDuration, setTripDuration] = useState(2);
  const [tripPace, setTripPace] = useState<"relaxed" | "moderate" | "fast">("moderate");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Architecture & Heritage",
    "Scenic Walking",
  ]);
  const [isTripLoading, setIsTripLoading] = useState(false);
  const [tripError, setTripError] = useState<string | null>(null);
  const [tripResult, setTripResult] = useState<TripPlannerResult | null>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleVibeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vibeArea.trim()) {
      setVibeError("Please enter an area, city, or neighborhood to search.");
      return;
    }

    const effectiveVibe = customVibe.trim() || selectedVibe;
    if (!effectiveVibe) {
      setVibeError("Please select or type a vibe.");
      return;
    }

    setIsVibeLoading(true);
    setVibeError(null);

    try {
      const response = await fetch("/api/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "vibe",
          area: vibeArea.trim(),
          vibe: effectiveVibe,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to discover places for this vibe.");
      }

      setVibeResults(data);
    } catch (err: unknown) {
      const e = err as Error;
      setVibeError(e.message || "An error occurred.");
    } finally {
      setIsVibeLoading(false);
    }
  };

  const handleTripSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripDestination.trim()) {
      setTripError("Please enter a destination city or region.");
      return;
    }

    setIsTripLoading(true);
    setTripError(null);

    try {
      const response = await fetch("/api/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "trip",
          destination: tripDestination.trim(),
          durationDays: tripDuration,
          pace: tripPace,
          interests: selectedInterests,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate itinerary.");
      }

      setTripResult(data);
    } catch (err: unknown) {
      const e = err as Error;
      setTripError(e.message || "An error occurred.");
    } finally {
      setIsTripLoading(false);
    }
  };

  return (
    <section id="explore-section" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Section Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold uppercase tracking-wider border border-stone-200">
          <Compass className="w-3.5 h-3.5 text-stone-600" />
          <span>Secondary Feature &bull; Explore &amp; Plan</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Vibe-Based Discovery &amp; Custom Trip Planner
        </h2>
        <p className="text-sm text-stone-600 max-w-xl mx-auto">
          Explore real locations matching emotional vibes or generate a day-by-day itinerary tailored to your duration and pace.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1 bg-stone-200/80 rounded-2xl border border-stone-300 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("vibe")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "vibe"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            ✨ Vibe-Based Discovery
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("trip")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "trip"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            🗺️ Smart Trip Planner
          </button>
        </div>
      </div>

      {/* TAB 1: Vibe-Based Discovery */}
      {activeTab === "vibe" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-8 space-y-6">
          <form onSubmit={handleVibeSearch} className="space-y-4">
            <div>
              <label htmlFor="vibeArea" className="block text-xs font-semibold text-stone-800 mb-1">
                Where are you exploring?
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  id="vibeArea"
                  type="text"
                  placeholder="Enter a city or area (e.g. Kyoto, Edinburgh, coastal Maine, Oaxaca)"
                  value={vibeArea}
                  onChange={(e) => setVibeArea(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-heritage-500/30 focus:border-heritage-500"
                />
              </div>
            </div>

            {/* Vibe Selection Chips */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                Choose or type a vibe:
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {POPULAR_VIBE_CHIPS.map((chip) => {
                  const isSelected = selectedVibe.toLowerCase() === chip.label.toLowerCase() && !customVibe;
                  return (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setSelectedVibe(chip.label.toLowerCase());
                        setCustomVibe("");
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                          : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      <span>{chip.emoji}</span>
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Vibe Input */}
              <input
                type="text"
                placeholder="Or type a custom mood (e.g. cyberpunk, bohemian, solitary, cozy)"
                value={customVibe}
                onChange={(e) => setCustomVibe(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-heritage-500/30 bg-stone-50/50"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isVibeLoading}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 active:scale-[0.99] disabled:bg-stone-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {isVibeLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching Grounded Places with Free-Tier Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Find Places Matching &quot;{customVibe.trim() || selectedVibe}&quot;
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {vibeError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{vibeError}</span>
            </div>
          )}

          {/* Vibe Results Grid */}
          {vibeResults && (
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    {vibeResults.places.length} Real Places in {vibeResults.area}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Vibe: <span className="capitalize font-semibold text-stone-800">{vibeResults.vibe}</span>
                  </p>
                </div>
                {vibeResults.sources && vibeResults.sources.length > 0 && (
                  <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Grounded with Search
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vibeResults.places.map((place, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 transition-all shadow-2xs flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">{place.name}</h4>
                        {place.neighborhoodOrArea && (
                          <span className="text-[10px] uppercase font-semibold text-stone-600 bg-stone-200/80 px-2 py-0.5 rounded shrink-0">
                            {place.neighborhoodOrArea}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed">
                        {place.vibeFitReason}
                      </p>

                      {/* Highlights */}
                      {place.highlights && place.highlights.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-stone-500">
                            Highlights:
                          </span>
                          <ul className="text-xs text-stone-600 list-disc list-inside space-y-0.5">
                            {place.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/80 space-y-2">
                      {place.verificationTip && (
                        <p className="text-[11px] text-amber-800 bg-amber-50/80 px-2 py-1 rounded">
                          Tip: {place.verificationTip}
                        </p>
                      )}

                      <a
                        href={place.mapsSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-heritage-700 hover:text-heritage-900 hover:underline"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Verify &amp; view on Google Maps</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Citations list */}
              {vibeResults.sources && vibeResults.sources.length > 0 && (
                <div className="text-xs text-stone-500 pt-2 space-y-1">
                  <span className="font-semibold text-stone-700">Source References:</span>
                  <div className="flex flex-wrap gap-2">
                    {vibeResults.sources.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-heritage-700 hover:underline inline-flex items-center gap-0.5"
                      >
                        {s.title} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Smart Trip Planner */}
      {activeTab === "trip" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-8 space-y-6">
          <form onSubmit={handleTripSearch} className="space-y-4">
            <div>
              <label htmlFor="tripDestination" className="block text-xs font-semibold text-stone-800 mb-1">
                Trip Destination
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  id="tripDestination"
                  type="text"
                  placeholder="e.g. Prague, Czechia or Kyoto, Japan"
                  value={tripDestination}
                  onChange={(e) => setTripDestination(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-heritage-500/30 focus:border-heritage-500"
                />
              </div>
            </div>

            {/* Duration & Pace */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Trip Duration
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTripDuration(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        tripDuration === d
                          ? "bg-heritage-600 text-white border-heritage-600 shadow-2xs"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {d} {d === 1 ? "Day" : "Days"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Travel Pace
                </label>
                <div className="flex gap-1.5">
                  {(["relaxed", "moderate", "fast"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTripPace(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        tripPace === p
                          ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Travel Interests Toggle */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                Preferences &amp; Interests
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map((interest) => {
                  const isChecked = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        isChecked
                          ? "bg-heritage-100 text-heritage-800 border-heritage-300 font-semibold"
                          : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {isChecked ? "✓ " : "+ "}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isTripLoading}
              className="w-full py-2.5 px-4 bg-heritage-600 hover:bg-heritage-700 active:scale-[0.99] disabled:bg-heritage-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {isTripLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Coherent Daily Itinerary...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Generate {tripDuration}-Day Grounded Plan</span>
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {tripError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{tripError}</span>
            </div>
          )}

          {/* Trip Result */}
          {tripResult && (
            <div className="space-y-6 pt-4 border-t border-stone-200">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-base">
                    {tripResult.destination} &bull; {tripResult.itinerary.length}-Day Outline
                  </h3>
                  <span className="text-[11px] font-semibold text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200 capitalize">
                    {tripPace} Pace
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">{tripResult.summary}</p>
                <div className="text-[11px] text-stone-500 pt-1 flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-stone-400" />
                  <span>{tripResult.pacingNote}</span>
                </div>
                {tripResult.unverifiedNote && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200/60">
                    Notice: {tripResult.unverifiedNote}
                  </p>
                )}
              </div>

              {/* Day-by-Day Outline */}
              <div className="space-y-4">
                {tripResult.itinerary.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="border border-stone-200 rounded-2xl p-4 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                      <span className="w-6 h-6 rounded-full bg-heritage-600 text-white text-xs font-bold flex items-center justify-center">
                        {day.dayNumber}
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm">
                        Day {day.dayNumber}: {day.theme}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Morning */}
                      <div className="p-3 bg-stone-50/70 rounded-xl border border-stone-200/70 space-y-1.5">
                        <span className="font-semibold text-stone-500 text-[10px] uppercase block">
                          Morning
                        </span>
                        <h5 className="font-bold text-stone-900">{day.morning?.place}</h5>
                        <p className="text-stone-700 leading-relaxed">{day.morning?.activity}</p>
                        {day.morning?.tip && (
                          <p className="text-[10px] text-stone-500 italic">Tip: {day.morning.tip}</p>
                        )}
                        {day.morning?.mapsUrl && (
                          <a
                            href={day.morning.mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-heritage-700 hover:underline pt-1"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Verify on Maps</span>
                          </a>
                        )}
                      </div>

                      {/* Afternoon */}
                      <div className="p-3 bg-stone-50/70 rounded-xl border border-stone-200/70 space-y-1.5">
                        <span className="font-semibold text-stone-500 text-[10px] uppercase block">
                          Afternoon
                        </span>
                        <h5 className="font-bold text-stone-900">{day.afternoon?.place}</h5>
                        <p className="text-stone-700 leading-relaxed">{day.afternoon?.activity}</p>
                        {day.afternoon?.tip && (
                          <p className="text-[10px] text-stone-500 italic">Tip: {day.afternoon.tip}</p>
                        )}
                        {day.afternoon?.mapsUrl && (
                          <a
                            href={day.afternoon.mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-heritage-700 hover:underline pt-1"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Verify on Maps</span>
                          </a>
                        )}
                      </div>

                      {/* Evening */}
                      <div className="p-3 bg-stone-50/70 rounded-xl border border-stone-200/70 space-y-1.5">
                        <span className="font-semibold text-stone-500 text-[10px] uppercase block">
                          Evening
                        </span>
                        <h5 className="font-bold text-stone-900">{day.evening?.place}</h5>
                        <p className="text-stone-700 leading-relaxed">{day.evening?.activity}</p>
                        {day.evening?.tip && (
                          <p className="text-[10px] text-stone-500 italic">Tip: {day.evening.tip}</p>
                        )}
                        {day.evening?.mapsUrl && (
                          <a
                            href={day.evening.mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-heritage-700 hover:underline pt-1"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Verify on Maps</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
