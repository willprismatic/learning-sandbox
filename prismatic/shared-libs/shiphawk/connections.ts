import { connection } from "@prismatic-io/spectral";

export const shiphawkConnection = connection({
  key: "apiKey",
  display: {
    label: "ShipHawk Connection",
    description: "Connect to ShipHawk API using an API key",
  },
  inputs: {
    baseUrl: {
      label: "Base URL",
      type: "string",
      required: true,
      default: "https://shiphawk.ngrok-free.app/api",
      example: "https://your-domain.ngrok-free.app/api",
    },
    apiKey: {
      label: "API Key",
      placeholder: "API Key",
      type: "password",
      required: true,
      comments: "Bearer token for ShipHawk API authentication",
    },
  },
});

export default [shiphawkConnection];
