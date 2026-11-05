"use client";

import React, { useState } from "react";
import { Compass, Sparkles, ShieldCheck, Info, X, ExternalLink } from "lucide-react";

export default function Navbar() {
  const [showTierModal, setShowTierModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-heritage-600 to-heritage-800 text-white flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5 text-heritage-100" />
            </div>
            <div>
              <div className="font-bold text-lg text-stone-900 tracking-tight flex items-center gap-1.5">
                <span>Explore Local</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-heritage-100 text-heritage-800 border border-heritage-200">
                  AI Guide
                </span>
              </div>
              <p className="text-[11px] text-stone-700 hidden sm:block">
                Grounded Heritage Lens &amp; Mood-Based Exploration
              </p>
            </div>
          </div>

          {/* Quick Nav & Tier Indicator */}
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="#heritage-lens"
              className="text-xs font-semibold text-heritage-700 hover:text-heritage-900 px-2.5 py-1.5 rounded-lg bg-heritage-50/70 border border-heritage-200/60 transition-colors"
            >
              Heritage Lens
            </a>
            <a
              href="#explore-section"
              className="text-xs font-medium text-stone-600 hover:text-stone-900 px-2 py-1.5 rounded-lg transition-colors"
            >
              Explore &amp; Plan
            </a>

            {/* Free Tier Info Button */}
            <button
              type="button"
              onClick={() => setShowTierModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors"
              title="Click for Free Tier details"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Free Tier</span>
              <Info className="w-3 h-3 text-emerald-600 ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Free Tier Explanation Modal */}
      {showTierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Free Tier &amp; Cost Safeguards</h3>
                  <p className="text-xs text-stone-500">Zero charges &bull; No credit card required</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTierModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-2.5 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <p>
                <strong>How to verify your Free Tier in Google AI Studio:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-stone-700">
                <li>
                  Open{" "}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-heritage-600 underline font-medium inline-flex items-center gap-0.5"
                  >
                    Google AI Studio <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>Go to <strong>Settings</strong> &gt; <strong>Plan and billing</strong>.</li>
                <li>Verify your project is set to <strong>&quot;Free of charge&quot;</strong>.</li>
                <li>Do not attach a credit card or Google Cloud billing account.</li>
              </ol>
              <div className="pt-2 border-t border-stone-200 text-[11px] text-emerald-800">
                ✓ Explore Local runs on free-tier <code>gemini-3.5-flash</code> with zero paid tool calls or paid Maps lookups. If quotas are reached, it pauses and notifies you without overages.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTierModal(false)}
              className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
