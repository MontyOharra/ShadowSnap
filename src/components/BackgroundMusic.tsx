"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/stores/usePlayer";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef(false);
  const settings = usePlayer((state) => state.settings);
  const [hasStarted, setHasStarted] = useState(false);

  // Initialize audio element and click listener
  useEffect(() => {
    if (!initializedRef.current) {
      console.log("Initializing audio...");
      audioRef.current = new Audio("/audio/background.mp3");
      audioRef.current.loop = true;
      initializedRef.current = true;

      // Add click listener
      const handleClick = () => {
        console.log("Click detected, hasStarted:", hasStarted, "music enabled:", settings.music);
        if (!hasStarted && settings.music) {
          const volume = (settings.masterVolume / 100) * (settings.musicVolume / 100);
          console.log("Setting volume to:", volume);
          audioRef.current!.volume = volume;
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
        initializedRef.current = false;
      }
    };
  }, []);

  // Update volume and play with settings
  useEffect(() => {
    if (audioRef.current && hasStarted) {
      const volume = (settings.masterVolume / 100) * (settings.musicVolume / 100);
      console.log("Updating volume to:", volume);
      audioRef.current.volume = volume;

      if (!settings.music) {
        console.log("Pausing music");
        audioRef.current.pause();
      } else if (audioRef.current.paused) {
        console.log("Resuming music");
        audioRef.current.play().catch(error => {
          console.error("Error resuming background music:", error);
        });
      }
    }
  }, [settings.music, settings.masterVolume, settings.musicVolume, hasStarted]);

  return null;
} 