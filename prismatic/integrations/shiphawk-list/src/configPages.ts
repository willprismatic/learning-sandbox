/**
 * When a customer deploys an instance of your integration,
 * they will walk through a configuration wizard. Define your
 * configuration pages here.
 *
 * For more information on the code-native config wizards, see
 * https://prismatic.io/docs/integrations/code-native/config-wizard/
 */

import { configPage } from "@prismatic-io/spectral";
import { shiphawkApiKey } from "./manifests/shiphawk/connections/apiKey";

export const configPages = {
  Connections: configPage({
    elements: {
      "ShipHawk Connection": shiphawkApiKey("shiphawk-connection", {
        baseUrl: { value: "https://taekwondo-relapsing-backlash.ngrok-free.dev/api" },
        apiKey: { value: "Orby2026" },
      }),
    },
  }),
};
