"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "@/stores/usePlayer";
import { useBuildManager } from "@/stores/useBuildManager";

export default function SoundEffects() {
  const settings = usePlayer((state) => state.settings);
  const pieces = useBuildManager((state) => state.pieces);
  const previousPiecesRef = useRef(pieces);

  // Sound effects
  const placeSoundRef = useRef<HTMLAudioElement | null>(null);
  const deleteSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize sound effects
  useEffect(() => {
    if (!placeSoundRef.current) {
      placeSoundRef.current = new Audio("/audio/place_lego.mp3");
    }
    if (!deleteSoundRef.current) {
      deleteSoundRef.current = new Audio("/audio/place_lego.mp3"); // Using same sound for now
    }

    return () => {
      if (placeSoundRef.current) {
        placeSoundRef.current.pause();
        placeSoundRef.current = null;
      }
      if (deleteSoundRef.current) {
        deleteSoundRef.current.pause();
        deleteSoundRef.current = null;
      }
    };
  }, []);

  // Play sounds when pieces change
  useEffect(() => {
    if (!settings.sound) return;

    const previousPieces = previousPiecesRef.current;
    const currentPieces = pieces;

    // Calculate volume based on settings
    const volume = settings.masterVolume / 100;

    // Piece was added
    if (currentPieces.length > previousPieces.length) {
      if (placeSoundRef.current) {
        placeSoundRef.current.volume = volume;
        placeSoundRef.current.play().catch(console.error);
      }
    }
    // Piece was removed
    else if (currentPieces.length < previousPieces.length) {
      if (deleteSoundRef.current) {
        deleteSoundRef.current.volume = volume;
        deleteSoundRef.current.play().catch(console.error);
      }
    }

    // Update previous pieces reference
    previousPiecesRef.current = currentPieces;
  }, [pieces, settings.sound, settings.masterVolume]);

  return null;
} 