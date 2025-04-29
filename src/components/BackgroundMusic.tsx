"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/stores/usePlayer";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const settings = usePlayer((state) => state.settings);
  const [hasStarted, setHasStarted] = useState(false);

  // Initialize audio element and click listener
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/background.mp3");
      audioRef.current.loop = true;

      // Add click listener
      const handleClick = () => {
        if (!hasStarted && settings.music) {
          audioRef.current!.volume = (settings.masterVolume / 100) * (settings.musicVolume / 100);
          audioRef.current!.play().catch(error => {
            console.error("Error playing background music:", error);
          });
          setHasStarted(true);
          document.removeEventListener("click", handleClick);
        }
      };

      document.addEventListener("click", handleClick);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [settings.music, settings.masterVolume, settings.musicVolume, hasStarted]);

  // Update volume and play with settings
  useEffect(() => {
    if (audioRef.current && hasStarted) {
      const volume = (settings.masterVolume / 100) * (settings.musicVolume / 100);
      audioRef.current.volume = volume;

      if (!settings.music) {
        audioRef.current.pause();
      } else if (audioRef.current.paused) {
        audioRef.current.play().catch(error => {
          console.error("Error resuming background music:", error);
        });
      }
    }
  }, [settings.music, settings.masterVolume, settings.musicVolume, hasStarted]);

  return null;
} 