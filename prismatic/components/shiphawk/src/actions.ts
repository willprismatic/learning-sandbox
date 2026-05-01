import { action, input, util } from "@prismatic-io/spectral";
import {
  inputs as httpClientInputs,
  sendRawRequest,
} from "@prismatic-io/spectral/dist/clients/http";
import { ShiphawkClient } from "@shiphawk/shiphawk-lib";

export const connectionInput = input({
  label: "ShipHawk Connection",
  required: true,
  type: "connection",
});

export const itemIdInput = input({
  label: "Item ID",
  required: true,
  type: "string",
  clean: util.types.toNumber,
});

const trackingNumberInput = input({
  label: "Tracking Number",
  type: "string",
  required: true,
  clean: util.types.toString,
});

const originInput = input({
  label: "Origin",
  type: "string",
  required: true,
  clean: util.types.toString,
});

const destinationInput = input({
  label: "Destination",
  type: "string",
  required: true,
  clean: util.types.toString,
});

const carrierInput = input({
  label: "Carrier",
  type: "string",
  required: false,
  clean: util.types.toString,
});

const estimatedDeliveryInput = input({
  label: "Estimated Delivery",
  type: "string",
  required: false,
  clean: util.types.toString,
});

const statusInput = input({
  label: "Status",
  type: "string",
  required: true,
  clean: util.types.toString,
  comments: "One of: pending, in-transit, delivered, returned",
});

const listItems = action({
  display: {
    label: "List Shipments",
    description: "List all shipments",
  },
  inputs: {
    connection: connectionInput,
  },
  perform: async (context, { connection }) => {
    const client = new ShiphawkClient({ connection });
    const response = await client.shipment.list();
    return { data: response };
  },
});

const getItem = action({
  display: {
    label: "Get Shipment",
    description: "Get a single shipment by ID",
  },
  inputs: {
    connection: connectionInput,
    itemId: itemIdInput,
  },
  perform: async (context, { connection, itemId }) => {
    const client = new ShiphawkClient({ connection });
    const response = await client.shipment.get(itemId);
    return { data: response };
  },
});

const createItem = action({
  display: {
    label: "Create Shipment",
    description: "Create a new shipment",
  },
  inputs: {
    connection: connectionInput,
    trackingNumber: trackingNumberInput,
    origin: originInput,
    destination: destinationInput,
    carrier: carrierInput,
    estimatedDelivery: estimatedDeliveryInput,
    status: statusInput,
  },
  perform: async (
    context,
    { connection, trackingNumber, origin, destination, carrier, estimatedDelivery, status }
  ) => {
    const client = new ShiphawkClient({ connection });
    const response = await client.shipment.create({
      trackingNumber,
      origin,
      destination,
      carrier: carrier || undefined,
      estimatedDelivery: estimatedDelivery || undefined,
      status: status as "pending" | "in-transit" | "delivered" | "returned",
    });
    return { data: response };
  },
});

const updateItem = action({
  display: {
    label: "Update Shipment",
    description: "Update an existing shipment",
  },
  inputs: {
    connection: connectionInput,
    itemId: itemIdInput,
    trackingNumber: trackingNumberInput,
    origin: originInput,
    destination: destinationInput,
    carrier: carrierInput,
    estimatedDelivery: estimatedDeliveryInput,
    status: statusInput,
  },
  perform: async (
    context,
    { connection, itemId, trackingNumber, origin, destination, carrier, estimatedDelivery, status }
  ) => {
    const client = new ShiphawkClient({ connection });
    const response = await client.shipment.update(itemId, {
      trackingNumber,
      origin,
      destination,
      carrier: carrier || undefined,
      estimatedDelivery: estimatedDelivery || undefined,
      status: status as "pending" | "in-transit" | "delivered" | "returned",
    });
    return { data: response };
  },
});

const deleteItem = action({
  display: {
    label: "Delete Shipment",
    description: "Delete a shipment by ID",
  },
  inputs: {
    connection: connectionInput,
    itemId: itemIdInput,
  },
  perform: async (context, { connection, itemId }) => {
    const client = new ShiphawkClient({ connection });
    const response = await client.shipment.delete(itemId);
    return { data: response };
  },
});

const rawRequest = action({
  display: {
    label: "Raw Request",
    description: "Send an HTTP request to any ShipHawk endpoint",
  },
  inputs: {
    connection: connectionInput,
    ...httpClientInputs,
    url: {
      ...httpClientInputs.url,
      comments:
        "The base URL from your connection is already included. For example, to call /api/resources, enter /resources here.",
      example: "/resources",
    },
  },
  perform: async (context, { connection, ...rest }) => {
    const { data } = await sendRawRequest(
      util.types.toString(connection.fields.baseUrl),
      rest,
      { Authorization: `Bearer ${connection.fields.apiKey}` }
    );
    return { data };
  },
});

export default { listItems, getItem, createItem, updateItem, deleteItem, rawRequest };
