import {
  createConnection,
  createHarness,
} from "@prismatic-io/spectral/dist/testing";
import dotenv from "dotenv";
import myComponent from ".";
import connections from "@shiphawk/shiphawk-lib/connections";
import type {
  MutationResponse,
  ResourceResponse,
  Shipment,
} from "@shiphawk/shiphawk-lib";

dotenv.config({ path: ".env.testing" });

const harness = createHarness(myComponent);

const testConnection = createConnection(connections[0], {
  baseUrl: "https://shiphawk.ngrok-free.app/api",
  apiKey: process.env.API_KEY,
});

let createdId: number;

describe("Test Actions", () => {
  test("listItems returns data successfully", async () => {
    const result = await harness.action("listItems", {
      connection: testConnection,
    });
    expect(result?.data).toBeDefined();
  });

  test("createItem creates a shipment successfully", async () => {
    const result = await harness.action("createItem", {
      connection: testConnection,
      trackingNumber: "TEST-SHIPHAWK-001",
      origin: "Chicago, IL",
      destination: "New York, NY",
      carrier: "UPS",
      estimatedDelivery: "2026-05-15",
      status: "pending",
    });
    const data = result?.data as MutationResponse;
    expect(data).toBeDefined();
    expect(data.success).toBe(true);
    createdId = data.id as number;
  });

  test("getItem retrieves a shipment by ID", async () => {
    const result = await harness.action("getItem", {
      connection: testConnection,
      itemId: String(createdId),
    });
    const data = result?.data as ResourceResponse<Shipment>;
    expect(data).toBeDefined();
    expect(data.success).toBe(true);
  });

  test("updateItem updates a shipment successfully", async () => {
    const result = await harness.action("updateItem", {
      connection: testConnection,
      itemId: String(createdId),
      trackingNumber: "TEST-SHIPHAWK-001",
      origin: "Chicago, IL",
      destination: "New York, NY",
      carrier: "FedEx",
      estimatedDelivery: "2026-05-16",
      status: "in-transit",
    });
    const data = result?.data as ResourceResponse<Shipment>;
    expect(data).toBeDefined();
    expect(data.success).toBe(true);
  });

  test("deleteItem deletes a shipment successfully", async () => {
    const result = await harness.action("deleteItem", {
      connection: testConnection,
      itemId: String(createdId),
    });
    const data = result?.data as MutationResponse;
    expect(data).toBeDefined();
    expect(data.success).toBe(true);
  });
});
