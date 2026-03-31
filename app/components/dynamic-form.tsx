"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

interface DynamicFormProps {
  config: ResourceTypeConfig;
  onSuccess?: (data: any) => void;
}

export function DynamicForm({ config, onSuccess }: DynamicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: config.fields.reduce(
      (acc, field) => {
        // Set appropriate default values based on field type
        if (field.type === "number") {
          acc[field.name] = undefined;
        } else if (field.type === "select") {
          acc[field.name] = "";
        } else {
          acc[field.name] = "";
        }
        return acc;
      },
      {} as Record<string, any>
    ),
  });

  async function onSubmit(values: any) {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`/api/resources?type=${config.type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit form");
      }

      const data = await response.json();
      setSubmitStatus({
        type: "success",
        message: `${config.displayName} created successfully! ID: ${data.id}`,
      });
      form.reset();

      if (onSuccess) {
        onSuccess(data);
      }
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
                <FormDescription>
                  Enter your {field.label.toLowerCase()}
                </FormDescription>
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
                <FormDescription>
                  Select the {field.label.toLowerCase()}
                </FormDescription>
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
                <FormDescription>
                  Enter the {field.label.toLowerCase()}
                </FormDescription>
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
                <FormDescription>
                  Select the {field.label.toLowerCase()}
                </FormDescription>
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
                <FormDescription>
                  Enter your {field.label.toLowerCase()}
                </FormDescription>
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
                <FormDescription>
                  Enter your {field.label.toLowerCase()}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : `Submit ${config.displayName}`}
        </Button>
      </form>
    </Form>
  );
}
