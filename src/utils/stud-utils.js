// utils/stud-utils.js
import * as THREE from "three";
import { getPieceFromType, pieceDetails } from "./pieceDetails.js";

/* ------------------------------------------------------------------ */
/* Re‑usable helpers                                                  */
/* ------------------------------------------------------------------ */
const v = new THREE.Vector3(); // scratch vector
const quat = new THREE.Quaternion(); // scratch quaternion

/* ½‑stud grid snapping – every stud centre lies on …‑1.5,‑1,‑0.5,0… */
const GRID = 0.5;
const snap = (n) => Math.round(n / GRID) * GRID; // → ‑0.5, 1, …
const keyXZ = (x, z) => `${Math.round(x / GRID)}|${Math.round(z / GRID)}`;

/* ------------------------------------------------------------------ */
/* Convert local stud / hollow coords to world‑space                  */
/* ------------------------------------------------------------------ */
function worldStuds(piece, kind) {
  const def = getPieceFromType(piece.type);
  if (!def) {
    console.error("Unknown piece type:", piece.type);
    return [];
  }

  const list = kind === "top" ? def.topStudPositions : def.bottomStudPositions;

  /* build quaternion for yaw rotation */
  quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), piece.rot[1]);
  
  return list.map(([lx, ly, lz]) => {
    v.set(lx + 0.5, ly, lz + 0.5) // centre of stud / hole
      .applyQuaternion(quat) // rotate
      .add(new THREE.Vector3(...piece.pos)); // translate

    /* snap X & Z to exact ½‑stud grid so keys always match */
    return { x: snap(v.x), y: v.y, z: snap(v.z), localY: ly };
  });
}

/* ------------------------------------------------------------------ */
/* Given placed pieces + a candidate, return { y, valid }             */
/* ------------------------------------------------------------------ */
export function snapAndValidate(all, candidate) {
  /* --- 1. build map: (x|z) -> highest top‑stud Y ------------------ */
  const map = {};
  all.forEach((p) =>
    worldStuds(p, "top").forEach((s) => {
      const k = keyXZ(s.x, s.z);
      map[k] = map[k] === undefined ? s.y : Math.max(map[k], s.y);
    })
  );

  /* --- 2. check candidate’s bottom holes -------------------------- */
  let valid = false;
  let targetY = -Infinity;

  worldStuds(candidate, "bottom").forEach((s) => {
    const k = keyXZ(s.x, s.z);
    if (map[k] !== undefined) {
      valid = true;
      /* place brick so this hole’s world‑Y == stud’s world‑Y */
      const desiredPieceY = map[k] - s.localY;
      targetY = Math.max(targetY, desiredPieceY);
    }
  });

  return { y: valid ? targetY : candidate.pos[1], valid };
}

export function attemptPlace(pieces, type, gridPosXZ, rotY) {
  const candidate = {
    id: 9999, // temp
    type,
    pos: [gridPosXZ[0], 0, gridPosXZ[1]],
    rot: [0, rotY, 0],
  };

  const { y, valid } = snapAndValidate(pieces, candidate);
  if (!valid) return null;

  return {
    ...candidate,
    pos: [gridPosXZ[0], y, gridPosXZ[1]],
  };
}
