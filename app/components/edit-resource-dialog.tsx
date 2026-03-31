"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ResourceTypeConfig } from "@/lib/resource-config";

interface EditResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ResourceTypeConfig;
  resourceId: number;
  currentData: Record<string, any>;
  onSuccess?: () => void;
}

export function EditResourceDialog({
  open,
  onOpenChange,
  config,
  resourceId,
  currentData,
  onSuccess,
}: EditResourceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: currentData,
  });

  // Reset form when currentData changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset(currentData);
      setSubmitStatus(null);
    }
  }, [open, currentData, form]);

  async function onSubmit(values: any) {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update resource");
      }

      const data = await response.json();
      setSubmitStatus({
        type: "success",
        message: `${config.displayName} updated successfully!`,
      });

      // Close dialog and call success callback after a brief delay
      setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 1000);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderField = (field: ResourceTypeConfig["fields"][0]) => {
    switch (field.type) {
      case "textarea":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "select":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  value={formField.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Select ${field.label.toLowerCase()}`}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "number":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    {...formField}
                    onChange={(e) => {
                      const value = e.target.value;
                      formField.onChange(value === "" ? undefined : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "date":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    placeholder={`Select ${field.label.toLowerCase()}`}
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "email":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "text":
      default:
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit {config.displayName}</DialogTitle>
          <DialogDescription>
            Make changes to the {config.displayName.toLowerCase()} below. Click
            save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {config.fields.map((field) => renderField(field))}

            {submitStatus && (
              <div
                className={`rounded-md p-4 text-sm ${
                  submitStatus.type === "success"
                    ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                    : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
