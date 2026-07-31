"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import FormControl from "@/components/universal/form-control";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { Button } from "@/components/ui/button";
import FormCard from "@/components/dashboard/create-listing/form-card"; 

export type ProfileFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bio: string;
  company_name: string;
  address: string;
};

type Props = {
  initialData?: Partial<ProfileFormValues> | null;
  onFormSubmit: (data: ProfileFormValues) => void;
  isPending?: boolean;
};

export default function ProfileForm({ initialData, onFormSubmit, isPending }: Props) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      phone_number: initialData?.phone_number || "",
      bio: initialData?.bio || "",
      company_name: initialData?.company_name || "",
      address: initialData?.address || "",
    },
    mode: "onChange",
  });

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 md:space-y-7.5 mt-8">
      
      {/* Personal Information Section */}
      <FormCard title="Personal Information">
        <div className="space-y-6">
          <div className="w-full flex flex-col md:flex-row gap-6">
            <Controller
              name="first_name"
              control={control}
              rules={{ required: "First name is required" }}
              render={({ field }) => (
                <FormControl
                  as="input"
                  labelText="First Name *"
                  placeholder="Enter first name"
                  type="text"
                  containerClass="w-full"
                  {...field}
                  disabled={isPending}
                  error={getErrorMessage(errors.first_name)}
                />
              )}
            />
            <Controller
              name="last_name"
              control={control}
              rules={{ required: "Last name is required" }}
              render={({ field }) => (
                <FormControl
                  as="input"
                  labelText="Last Name *"
                  placeholder="Enter last name"
                  type="text"
                  containerClass="w-full"
                  {...field}
                  disabled={isPending}
                  error={getErrorMessage(errors.last_name)}
                />
              )}
            />
          </div>

          <div className="w-full flex flex-col md:flex-row gap-6">
            <Controller
              name="email"
              control={control}
              rules={{ 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              }}
              render={({ field }) => (
                <FormControl
                  as="input"
                  labelText="Email Address *"
                  placeholder="name@example.com"
                  type="email"
                  containerClass="w-full"
                  {...field}
                  disabled={isPending}
                  error={getErrorMessage(errors.email)}
                />
              )}
            />
            <Controller
              name="phone_number"
              control={control}
              render={({ field }) => (
                <FormControl
                  as="input"
                  labelText="Phone Number"
                  placeholder="+234..."
                  type="tel"
                  containerClass="w-full"
                  {...field}
                  disabled={isPending}
                  error={getErrorMessage(errors.phone_number)}
                />
              )}
            />
          </div>

          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <FormControl
                as="textarea"
                labelText="Bio"
                placeholder="Brief summary about yourself or agency"
                containerClass="w-full"
                {...field}
                disabled={isPending}
                error={getErrorMessage(errors.bio)}
              />
            )}
          />
        </div>
      </FormCard>

      {/* Business Details Section */}
      <FormCard title="Business Details">
        <div className="space-y-6">
          <div className="w-full flex flex-col md:flex-row gap-6">
            <Controller
              name="company_name"
              control={control}
              render={({ field }) => (
                <FormControl
                  as="input"
                  labelText="Company / Agency Name"
                  placeholder="Enter company name"
                  type="text"
                  containerClass="w-full"
                  {...field}
                  disabled={isPending}
                  error={getErrorMessage(errors.company_name)}
                />
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <FormControl
                  as="input"
                  labelText="Office Address"
                  placeholder="Enter address"
                  type="text"
                  containerClass="w-full"
                  {...field}
                  disabled={isPending}
                  error={getErrorMessage(errors.address)}
                />
              )}
            />
          </div>
        </div>
      </FormCard>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          type="button" 
          className="md:min-w-30"
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="md:min-w-30"
          disabled={isPending}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}