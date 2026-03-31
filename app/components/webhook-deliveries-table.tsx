"use client";

import { useEffect, useState, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface WebhookDelivery {
  id: number;
  webhook_id: number;
  event: string;
  resource_id: number;
  resource_type: string;
  status_code: number | null;
  success: boolean;
  error_message: string | null;
  response_body: string | null;
  created_at: string;
}

interface WebhookDeliveriesTableProps {
  webhookId?: number;
  resourceType?: string;
  maxDeliveries?: number;
  showDetails?: boolean;
  className?: string;
}

export function WebhookDeliveriesTable({
  webhookId,
  resourceType,
  maxDeliveries = 10,
  showDetails = true,
  className,
}: WebhookDeliveriesTableProps) {
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDeliveries() {
      setIsLoading(true);
      try {
        let response;

        // Use resourceType endpoint if resourceType is provided
        if (resourceType) {
          response = await fetch(
            `/api/webhook-deliveries?resource_type=${resourceType}&limit=${maxDeliveries}`
          );
          if (response.ok) {
            const data = await response.json();
            setDeliveries(data.data || []);
          }
        }
        // Use webhookId endpoint if webhookId is provided (backward compatibility)
        else if (webhookId) {
          response = await fetch(`/api/webhooks/${webhookId}`);
          if (response.ok) {
            const data = await response.json();
            setDeliveries(data.data.deliveries || []);
          }
        }
      } catch (error) {
        console.error("Error fetching webhook deliveries:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (webhookId || resourceType) {
      fetchDeliveries();
    }
  }, [webhookId, resourceType, maxDeliveries]);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading deliveries...
      </p>
    );
  }

  if (deliveries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No deliveries yet
      </p>
    );
  }

  const displayedDeliveries = deliveries.slice(0, maxDeliveries);

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Event</TableHead>
            <TableHead className="w-20">Status</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedDeliveries.map((delivery) => (
            <Fragment key={delivery.id}>
              <TableRow>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {delivery.event}
                  </Badge>
                </TableCell>
                <TableCell>
                  {delivery.success ? (
                    <Badge
                      variant="default"
                      className="bg-green-500 text-xs"
                    >
                      {delivery.status_code}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      {delivery.status_code || "Error"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs">
                  {delivery.resource_type} #{delivery.resource_id}
                </TableCell>
                <TableCell className="text-xs">
                  {new Date(delivery.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
              {showDetails && (delivery.error_message || delivery.response_body) && (
                <TableRow>
                  <TableCell colSpan={4} className="bg-muted/50 p-3">
                    <div className="space-y-2 text-xs">
                      {delivery.error_message && (
                        <div>
                          <span className="font-semibold text-destructive">Error: </span>
                          <span className="text-muted-foreground">{delivery.error_message}</span>
                        </div>
                      )}
                      {delivery.response_body && (
                        <div>
                          <span className="font-semibold">Response: </span>
                          <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto">
                            {(() => {
                              try {
                                // Try to parse and pretty-print JSON
                                const parsed = JSON.parse(delivery.response_body);
                                return JSON.stringify(parsed, null, 2);
                              } catch {
                                // If not JSON, display as-is
                                return delivery.response_body;
                              }
                            })()}
                          </pre>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
