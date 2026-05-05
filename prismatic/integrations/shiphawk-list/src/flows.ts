/**
 * Your integration will contain one or more flows that each perform different functions.
 * When the flow is invoked, the onTrigger function runs first, followed by the onExecution
 * function.
 */

import { flow } from "@prismatic-io/spectral";

export const listShipmentsFlow = flow({
  name: "List Shipments",
  stableKey: "b2b8baa4-3cc4-45a2-a516-9d56d1140001",
  description: "Fetch all shipments from ShipHawk",
  onTrigger: async (context, payload) => {
    return Promise.resolve({ payload });
  },
  onExecution: async (context, params) => {
    const connection = context.configVars["ShipHawk Connection"];
    const result = await context.components.shiphawk.listItems({ connection });
    return { data: result };
  },
});

export default [listShipmentsFlow];
