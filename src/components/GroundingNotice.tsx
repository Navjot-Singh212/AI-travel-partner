"use client";

import React from "react";
import { AlertCircle, ExternalLink, MapPin, BookOpen, ShieldAlert } from "lucide-react";
import type { GroundingSource } from "@/lib/gemini";

interface GroundingNoticeProps {
  identificationType?: "visual_estimate" | "tentative_match" | "sourced_reference";
  isUncertain: boolean;
  uncertaintyDisclaimer?: string;
  sources?: GroundingSource[];
  mapsSearchUrl: string;
  placeName: string;
}

export default function GroundingNotice({
  identificationType = "visual_estimate",
  isUncertain,
  uncertaintyDisclaimer,
  sources = [],
  mapsSearchUrl,
  placeName,
}: GroundingNoticeProps) {
  const hasSources = sources && sources.length > 0;

  return (
    <div className="space-y-3 pt-2">
      {/* Visual uncertainty & factual caution banner */}
      <div
        className={`rounded-xl p-3.5 border transition-all ${
          hasSources
            ? "bg-sky-50/70 border-sky-200 text-sky-950"
            : "bg-amber-50/80 border-amber-200 text-amber-950"
        }`}
      >
        <div className="flex items-start gap-2.5">
          {hasSources ? (
            <BookOpen className="w-4 h-4 text-sky-700 mt-0.5 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          )}
          <div className="space-y-1 text-xs">
            <div className="font-semibold flex items-center gap-1.5">
              <span>
                {hasSources
                  ? "AI Visual Estimate with Sourced References"
                  : "Visual / Architectural Estimate (Unconfirmed)"}
              </span>
              <span className="text-[10px] font-normal uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/70 border border-current">
                {hasSources ? "Reference Sources Attached" : "Requires Verification"}
              </span>
            </div>
            <p className="text-stone-700 leading-relaxed">
              {uncertaintyDisclaimer ||
                (hasSources
                  ? "Web citations provide background context, but AI visual recognition can misidentify structures. Verify details with on-site guides or official sources."
                  : "No definitive ground-truth sources were confirmed. This description outlines apparent architectural styles and visual features; historical facts are unverified.")}
            </p>
          </div>
        </div>
      </div>

      {/* Grounding Source Citations (Only rendered when available) */}
      {hasSources && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <span>Retrieved Grounding Sources ({sources.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 rounded-lg text-stone-800 shadow-2xs transition-colors group"
                title={source.url}
              >
                <span className="truncate max-w-[220px] font-medium text-stone-700 group-hover:text-heritage-700">
                  {source.title || "Reference Document"}
                </span>
                <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-heritage-600 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Direct Google Maps Verification Button */}
      {mapsSearchUrl && (
        <div className="pt-1">
          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            <span>Verify &quot;{placeName}&quot; on Google Maps</span>
            <ExternalLink className="w-3 h-3 text-stone-400 ml-0.5" />
          </a>
        </div>
      )}
    </div>
  );
}
