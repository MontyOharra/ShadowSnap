// utils/stud-utils.js
import * as THREE from "three";
import { pieceDetails } from "./pieceDetails.js";

const v = new THREE.Vector3();
const quat = new THREE.Quaternion();

function worldStuds(piece, kind) {
  const def = pieceDetails[piece.type];
  if (!def) {
    console.error("Unknown piece type:", piece.type);
    return []; // return empty array instead of object
  }
  const list = kind === "top" ? def.topStudPositions : def.bottomStudPositions;

  quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), piece.rot[1]);

  return list.map(([lx, ly, lz]) => {
    v.set(lx + 0.5, ly, lz + 0.5)
      .applyQuaternion(quat)
      .add(new THREE.Vector3(...piece.pos));
    return { x: v.x, y: v.y, z: v.z, localY: ly };
  });
}

/* returns { y, valid } */
export function snapAndValidate(all, candidate) {
  // Build (x|z) -> highest top stud Y
  const map = {};
  all.forEach((p) =>
    worldStuds(p, "top").forEach((s) => {
      const k = `${s.x}|${s.z}`;
      map[k] = map[k] === undefined ? s.y : Math.max(map[k], s.y);
    })
  );

  // Check candidate bottom holes
  let valid = false,
    targetY = -Infinity;
  worldStuds(candidate, "bottom").forEach((s) => {
    const k = `${s.x}|${s.z}`;
    if (map[k] !== undefined) {
      valid = true;
      // y we must set so that this hole's world y equals the stud's y
      const desiredPieceY = map[k] - s.localY;
      targetY = Math.max(targetY, desiredPieceY);
    }
  });

  return { y: valid ? targetY : candidate.pos[1], valid };
}
