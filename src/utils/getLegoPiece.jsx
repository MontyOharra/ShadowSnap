import * as LegoBrick from "../components/legoPieces/LegoBrick";
import { LegoBasePlate16x16 } from "../components/legoPieces/LegoPlate";
import { LegoSlant1 } from "../components/legoPieces/LegoSlant";

export function getLegoPiece(type, key, props) {
  switch (type) {
    case "brick-1x1x1":
      return <LegoBrick.LegoBrick1x1x1 key={key} {...props} />;
    case "brick-2x2x1":
      return <LegoBrick.LegoBrick2x2x1 key={key} {...props} />;
    case "brick-3x3x.5":
      return <LegoBrick.LegoBrick3x3xmed key={key} {...props} />;
    case "base-plate-16x16":
      return <LegoBasePlate16x16 key={key} {...props} />;
    case "slant-1":
      return <LegoSlant1 key={key} {...props} />;
    default:
      return <></>;
  }
}
