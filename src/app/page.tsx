import React from "react";
import Navbar from "@/components/Navbar";
import HeritageLens from "@/components/HeritageLens";
import ExploreSection from "@/components/ExploreSection";
import { Compass, ShieldCheck, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#faf8f5]">
      {/* Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 space-y-4">
        {/* P0 Core Feature: AI Heritage Lens */}
        <HeritageLens />

        {/* Divider with subtle ornament */}
        <div className="max-w-4xl mx-auto px-6 py-2 flex items-center justify-center">
          <div className="w-full border-t border-stone-200/80 relative flex items-center justify-center">
            <span className="bg-[#faf8f5] px-4 text-xs text-stone-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-heritage-600" />
              <span>Explore More</span>
            </span>
          </div>
        </div>

        {/* Secondary Feature: Vibe Discovery & Trip Planner */}
        <ExploreSection />
      </main>

      {/* Site Footer */}
      <footer className="w-full border-t border-stone-200 bg-white py-8 mt-12 text-stone-600 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-heritage-600 text-white flex items-center justify-center text-[10px] font-bold">
              EL
            </div>
            <span className="font-semibold text-stone-800">Explore Local</span>
            <span className="text-stone-400">&bull;</span>
            <span className="text-stone-500">
              Grounded AI Heritage Lens &amp; Mood-Based Discovery
            </span>
          </div>

          <div className="flex items-center gap-4 text-stone-500 text-[11px]">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Free Tier Safeguard ($0 Cost Limit)
            </span>
            <span>&bull;</span>
            <span>Powered by Gemini 3.5 Flash &amp; Web Speech API</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4 pt-4 border-t border-stone-100 text-[11px] text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>
            Disclaimer: Historical summaries and visual classifications are AI estimations. Verify travel arrangements, museum hours, and entry regulations directly with official site administrators before visiting.
          </p>
          <p className="shrink-0">
            Crafted for Local Tourism &bull; Hackathon Edition
          </p>
        </div>
      </footer>
    </div>
  );
}
