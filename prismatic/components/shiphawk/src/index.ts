import { component } from "@prismatic-io/spectral";
import actions from "./actions";
import triggers from "./triggers";
import connections from "./connections";

export default component({
  key: "shiphawk",
  public: false,
  display: {
    label: "ShipHawk",
    description: "ShipHawk Shipment Management Component",
    iconPath: "icon.png",
  },
  actions,
  triggers,
  connections,
});
