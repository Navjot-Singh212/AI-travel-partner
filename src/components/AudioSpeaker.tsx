"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Pause, Play, RotateCcw } from "lucide-react";

interface AudioSpeakerProps {
  text: string;
  title?: string;
}

export default function AudioSpeaker({ text, title }: AudioSpeakerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    // Cancel any previous speech on unmount or text change
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  const handlePlay = () => {
    if (!isSupported || !text) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Stop any existing speech before starting new
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Premium"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.rate = 0.95; // Slightly measured pace for storytelling
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
      setIsPlaying(false);
    };

    utterance.onresume = () => {
      setIsPaused(false);
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis notice:", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-100 rounded-lg px-3 py-1.5">
        <VolumeX className="w-4 h-4 text-stone-400" />
        <span>Audio narration is not supported in this browser.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-heritage-50/80 border border-heritage-200/60 rounded-xl p-3 text-stone-800 transition-all">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-heritage-600 text-white flex items-center justify-center shadow-sm">
          <Volume2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-900 flex items-center gap-2">
            <span>Audio Storyteller</span>
            {isPlaying && (
              <span className="flex items-center gap-0.5 h-3">
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-500">
            {isPlaying ? "Narration in progress..." : isPaused ? "Audio paused" : "Listen to this heritage summary"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {!isPlaying ? (
          <button
            type="button"
            onClick={handlePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-heritage-600 hover:bg-heritage-700 active:scale-95 text-white text-xs font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-heritage-500/40"
            aria-label="Play audio narration"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPaused ? "Resume" : "Listen"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            aria-label="Pause audio narration"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            type="button"
            onClick={handleStop}
            className="flex items-center gap-1 p-1.5 bg-stone-200 hover:bg-stone-300 active:scale-95 text-stone-700 text-xs font-medium rounded-lg transition-all focus:outline-none"
            aria-label="Stop audio"
            title="Stop audio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
