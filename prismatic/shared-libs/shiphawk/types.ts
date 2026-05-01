export interface ResourceResponse<T> {
  success: boolean;
  data: {
    id: number;
    type: string;
    data: T;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ResourceListResponse<T> {
  success: boolean;
  data: Array<{
    id: number;
    type: string;
    data: T;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface MutationResponse {
  success: boolean;
  id?: number;
  type?: string;
  message: string;
}

export interface Shipment {
  trackingNumber: string;
  origin: string;
  destination: string;
  carrier?: string;
  estimatedDelivery?: string;
  status: "pending" | "in-transit" | "delivered" | "returned";
}
