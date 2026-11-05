"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Layers,
  HelpCircle,
  KeyRound,
  Compass,
} from "lucide-react";
import {
  validateImageFile,
  compressAndEncodeImage,
  CompressionResult,
} from "@/lib/imageUtils";
import type { HeritageAnalysisResult } from "@/lib/gemini";
import AudioSpeaker from "./AudioSpeaker";
import GroundingNotice from "./GroundingNotice";

export default function HeritageLens() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedData, setCompressedData] = useState<CompressionResult | null>(null);
  const [placeNameHint, setPlaceNameHint] = useState("");
  const [locationHint, setLocationHint] = useState("");

  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ isMissingKey?: boolean; isQuota?: boolean }>({});
  const [analysisResult, setAnalysisResult] = useState<HeritageAnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection and client-side compression
  const handleFileChange = async (file: File) => {
    setErrorMessage(null);
    setErrorDetails({});
    setAnalysisResult(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Invalid image file.");
      return;
    }

    setSelectedFile(file);
    setIsProcessingImage(true);

    try {
      const result = await compressAndEncodeImage(file, 1600, 1600, 0.82);
      setCompressedData(result);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to process image.");
      setSelectedFile(null);
      setCompressedData(null);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCompressedData(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setErrorDetails({});
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!compressedData) {
      setErrorMessage("Please select or capture a photo first.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setErrorDetails({});

    try {
      const response = await fetch("/api/heritage-lens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: compressedData.base64Data,
          mimeType: compressedData.mimeType,
          placeNameHint: placeNameHint.trim(),
          locationHint: locationHint.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorDetails({
          isMissingKey: data.isMissingKey,
          isQuota: data.isQuota,
        });
        throw new Error(data.error || "Analysis failed.");
      }

      setAnalysisResult(data as HeritageAnalysisResult);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "An error occurred while analyzing the image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section id="heritage-lens" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Feature Title Card */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-heritage-100 text-heritage-800 text-xs font-semibold uppercase tracking-wider border border-heritage-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Core Feature &bull; AI Heritage Lens</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Uncover the Story Behind Any Landmark
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Snap or upload a photo of a monument, temple, facade, or historic street.
          Explore Local analyzes the architectural style and delivers an engaging, audio-narrated story.
        </p>
      </div>

      {/* Main Interactive Grid */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        <div className="p-5 sm:p-8 space-y-6">
          {/* Photo Selection / Drop Area */}
          {!compressedData ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-heritage-300 hover:border-heritage-500 rounded-2xl p-6 sm:p-10 text-center bg-heritage-50/40 hover:bg-heritage-50/70 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-heritage-100 text-heritage-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Camera className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-semibold text-stone-900">
                    Click to upload a landmark photo or drag &amp; drop
                  </p>
                  <p className="text-xs text-stone-500">
                    Supports JPG, PNG, and WebP (up to 15MB &bull; auto-compressed locally)
                  </p>
                </div>

                {/* Mobile Camera Shutter Button */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-transform active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Photo (Camera)</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse Files</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Selected & Compressed Preview */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="relative w-full sm:w-48 h-44 rounded-xl overflow-hidden bg-stone-900 shrink-0 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={compressedData.dataUrl}
                    alt="Uploaded landmark preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-xs font-mono">
                    {compressedData.dimensions.width}×{compressedData.dimensions.height}
                  </div>
                </div>

                <div className="flex-1 w-full space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900 text-sm truncate max-w-[200px]">
                      {selectedFile?.name || "Captured Photo"}
                    </span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Compression stats guarantee safely under Vercel limit */}
                  <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Optimized for fast transfer:{" "}
                      <strong>{(compressedData.compressedSize / 1024).toFixed(0)} KB</strong>{" "}
                      <span className="text-emerald-700">
                        (reduced from {(compressedData.originalSize / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </span>
                  </div>

                  <p className="text-stone-500 text-[11px]">
                    Photo is held in browser memory only and never stored on disk.
                  </p>
                </div>
              </div>

              {/* Optional Hints to guide identification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label htmlFor="placeNameHint" className="block text-xs font-medium text-stone-700 mb-1">
                    Suspected Place Name <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="placeNameHint"
                    type="text"
                    placeholder="e.g. Pantheon, Amber Fort, Old Mill"
                    value={placeNameHint}
                    onChange={(e) => setPlaceNameHint(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-heritage-500/30 focus:border-heritage-500 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="locationHint" className="block text-xs font-medium text-stone-700 mb-1">
                    City, Region, or Country <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="locationHint"
                    type="text"
                    placeholder="e.g. Rome, Italy or Kyoto, Japan"
                    value={locationHint}
                    onChange={(e) => setLocationHint(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-heritage-500/30 focus:border-heritage-500 bg-white"
                  />
                </div>
              </div>

              {/* Analyze Trigger Button */}
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={handleAnalyze}
                className="w-full py-3 px-4 bg-heritage-600 hover:bg-heritage-700 active:scale-[0.99] disabled:bg-heritage-400 text-white text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Architectural Heritage with Gemini 3.5 Flash...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Landmark &amp; Discover Story</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isAnalyzing && (
            <div className="space-y-4 pt-4 border-t border-stone-200 animate-pulse">
              <div className="h-6 bg-stone-200 rounded-md w-3/4" />
              <div className="h-4 bg-stone-200 rounded-md w-1/2" />
              <div className="h-24 bg-stone-100 rounded-xl w-full" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 bg-stone-200 rounded-lg" />
                <div className="h-8 bg-stone-200 rounded-lg" />
                <div className="h-8 bg-stone-200 rounded-lg" />
              </div>
            </div>
          )}

          {/* Error States */}
          {errorMessage && (
            <div className="rounded-2xl p-4 bg-red-50 border border-red-200 text-red-950 space-y-2">
              <div className="flex items-start gap-2.5">
                {errorDetails.isMissingKey ? (
                  <KeyRound className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-red-900">
                    {errorDetails.isMissingKey
                      ? "Gemini API Key Required"
                      : errorDetails.isQuota
                      ? "Free Tier Quota Notice"
                      : "Analysis Notice"}
                  </h4>
                  <p className="text-red-800 leading-relaxed">{errorMessage}</p>

                  {errorDetails.isMissingKey && (
                    <div className="pt-2 text-[11px] text-stone-700 space-y-1 bg-white/80 p-2.5 rounded-lg border border-red-200">
                      <p>
                        To run the app locally, add your free key to <code>.env.local</code>:
                      </p>
                      <pre className="p-1.5 bg-stone-900 text-stone-100 rounded text-[10px] overflow-x-auto">
                        GEMINI_API_KEY=your_gemini_api_key_here
                      </pre>
                      <p className="text-stone-500">
                        Get a free key from Google AI Studio. Never share or paste your key in chat.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="pt-6 border-t border-stone-200 space-y-6">
              {/* Header with Title & Architectural Style */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                    {analysisResult.placeName}
                  </h2>
                  {analysisResult.architecturalStyle && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      {analysisResult.architecturalStyle}
                    </span>
                  )}
                </div>

                {/* Grounding & Uncertainty Warning Component */}
                <GroundingNotice
                  identificationType={analysisResult.identificationType}
                  isUncertain={analysisResult.isUncertain}
                  uncertaintyDisclaimer={analysisResult.uncertaintyDisclaimer}
                  sources={analysisResult.groundingSources}
                  mapsSearchUrl={analysisResult.mapsSearchUrl}
                  placeName={analysisResult.placeName}
                />
              </div>

              {/* Native Web Speech Audio Speaker Bar */}
              <AudioSpeaker
                text={`${analysisResult.placeName}. ${analysisResult.story} Historical notes: ${analysisResult.historicalContext}`}
                title={analysisResult.placeName}
              />

              {/* Engaging Story & Architectural Narrative */}
              <div className="space-y-4 text-stone-800 text-sm leading-relaxed">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-heritage-800 mb-2 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-heritage-600" />
                    <span>The Heritage Narrative</span>
                  </h3>
                  <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200 whitespace-pre-line space-y-3">
                    {analysisResult.story}
                  </div>
                </div>

                {/* Visible Features Observed */}
                {analysisResult.observedFeatures && analysisResult.observedFeatures.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-stone-500" />
                      <span>Observable Architectural Elements</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.observedFeatures.map((feat, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 shadow-2xs"
                        >
                          &bull; {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historical Context & Visitor Caution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {analysisResult.historicalContext && (
                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                      <span className="font-bold text-stone-900 block mb-1">
                        Historical Context (Uncorroborated)
                      </span>
                      <p className="text-stone-600 leading-relaxed">
                        {analysisResult.historicalContext}
                      </p>
                    </div>
                  )}

                  {analysisResult.visitorCautionNote && (
                    <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs">
                      <span className="font-bold text-amber-950 block mb-1">
                        Visitor Note &amp; Etiquette
                      </span>
                      <p className="text-amber-900 leading-relaxed">
                        {analysisResult.visitorCautionNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
