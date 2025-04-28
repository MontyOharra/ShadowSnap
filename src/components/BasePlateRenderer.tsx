import { useBasePlateStore } from "@/stores/useBasePlateStore";
import { getLegoBasePlate } from "./Lego";

export default function BasePlateRenderer() {
  const { pieceId, color, rotation } = useBasePlateStore();
  return getLegoBasePlate(pieceId, "baseplate", {
    position: [0, 0, 0],
    rotation,
    color,
  });
}
