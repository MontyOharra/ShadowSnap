import { snapAndValidate } from "./stud-utils";

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
