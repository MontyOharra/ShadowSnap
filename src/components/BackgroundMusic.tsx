"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "@/stores/usePlayer";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const settings = usePlayer((state) => state.settings);

  // Initialize audio element only once
  useEffect(() => {
    if (!audioRef.current) {
      console.log("Creating new audio element");
      audioRef.current = new Audio("/audio/background.mp3");
      audioRef.current.loop = true;
      
      // Add event listeners for debugging
      audioRef.current.addEventListener("canplay", () => {
        console.log("Audio can play");
      });
      
      audioRef.current.addEventListener("error", (e) => {
        console.error("Audio error:", e);
      });
      
      audioRef.current.addEventListener("play", () => {
        console.log("Audio started playing");
      });

      // Initial play if music is enabled
      if (settings.music) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing background music:", error);
          });
        }
      }
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        console.log("Cleaning up audio");
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); 

  // Update volume and play state when settings change
  useEffect(() => {
    if (audioRef.current) {
      // Calculate actual volume (master volume * music volume)
      const volume = (settings.masterVolume / 100) * (settings.musicVolume / 100);
      console.log("Setting volume to:", volume);
      audioRef.current.volume = volume;

      // Update play/pause state
      if (settings.music && audioRef.current.paused) {
        console.log("Resuming music");
        audioRef.current.play().catch(error => {
          console.error("Error resuming background music:", error);
        });
      } else if (!settings.music && !audioRef.current.paused) {
        console.log("Pausing music");
        audioRef.current.pause();
      }
    }
  }, [settings.music, settings.masterVolume, settings.musicVolume]);

  return null; // This component doesn't render anything
} 