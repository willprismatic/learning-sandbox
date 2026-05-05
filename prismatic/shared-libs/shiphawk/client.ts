import axios, { AxiosError } from "axios";
import type {
  Shipment,
  ResourceResponse,
  ResourceListResponse,
  MutationResponse,
} from "./types";
import type { Connection } from "@prismatic-io/spectral";

export class ShiphawkClient {
  private client;
  private resourceType: string;

  constructor({
    connection,
    resourceType = "order",
  }: {
    connection: Connection;
    resourceType?: string;
  }) {
    const baseUrl = connection.fields.baseUrl as string;
    const apiKey = connection.fields.apiKey as string;

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    this.resourceType = resourceType;
  }

  private handleError(error: unknown): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;
      if (data && typeof data === "object") {
        const message = data.message || data.error || JSON.stringify(data);
        throw new Error(`API Error ${status}: ${message}`);
      }
      if (data) {
        throw new Error(`API Error ${status}: ${String(data).slice(0, 200)}`);
      }
      throw new Error(`Network Error: ${error.message}`);
    }
    throw error;
  }

  public readonly shipment = {
    list: async (
      page?: number,
      pageSize?: number
    ): Promise<ResourceListResponse<Shipment>> => {
      try {
        const params = new URLSearchParams({ type: this.resourceType });
        if (page) params.append("page", String(page));
        if (pageSize) params.append("pageSize", String(pageSize));
        const response = await this.client.get<ResourceListResponse<Shipment>>(
          `/resources?${params.toString()}`
        );
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    },

    get: async (id: number): Promise<ResourceResponse<Shipment>> => {
      try {
        const response = await this.client.get<ResourceResponse<Shipment>>(
          `/resources/${id}`
        );
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    },

    create: async (data: Partial<Shipment>): Promise<MutationResponse> => {
      try {
        const response = await this.client.post<MutationResponse>(
          `/resources?type=${this.resourceType}`,
          { ...data }
        );
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    },

    update: async (
      id: number,
      data: Partial<Shipment>
    ): Promise<ResourceResponse<Shipment>> => {
      try {
        const response = await this.client.put<ResourceResponse<Shipment>>(
          `/resources/${id}`,
          { ...data }
        );
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    },

    delete: async (id: number): Promise<MutationResponse> => {
      try {
        const response = await this.client.delete<MutationResponse>(
          `/resources/${id}`
        );
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    },
  };
}
