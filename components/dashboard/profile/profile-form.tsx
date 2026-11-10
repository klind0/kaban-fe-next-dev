"use client";

import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import FormControl from "@/components/universal/form-control";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { Button } from "@/components/ui/button";
import FormCard from "@/components/dashboard/create-listing/form-card";
import RealtorAvatar from "@/components/shared/realtor-avatar";

export type ProfileFormValues = {
  full_name: string;
  email: string;
  mobile_number: string;
  whatsapp_number: string;
  realtor_pic?: File | null;
};

type Props = {
  initialData?: {
    full_name?: string;
    email?: string;
    mobile_number?: string;
    whatsapp_number?: string;
    realtor_pic?: string;
    is_founding_realtor?: boolean;
  } | null;
  onFormSubmit: (data: ProfileFormValues) => void;
  isPending?: boolean;
};

export default function ProfileForm({ initialData, onFormSubmit, isPending }: Props) {
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [previewPic, setPreviewPic] = useState<string | null>(initialData?.realtor_pic || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: initialData?.full_name || "",
      email: initialData?.email || "",
      mobile_number: initialData?.mobile_number || "",
      whatsapp_number: initialData?.whatsapp_number || "",
      realtor_pic: null,
    },
    mode: "onChange",
  });

  // Automatically update form fields if initialData loads asynchronously (e.g. via API/Auth session)
  useEffect(() => {
    if (initialData) {
      reset({
        full_name: initialData.full_name || "",
        email: initialData.email || "",
        mobile_number: initialData.mobile_number || "",
        whatsapp_number: initialData.whatsapp_number || "",
      });
      if (initialData.realtor_pic) {
        setPreviewPic(initialData.realtor_pic);
      }
    }
  }, [initialData, reset]);

  const mobileNumberValue = watch("mobile_number");

  useEffect(() => {
    if (sameAsMobile) {
      setValue("whatsapp_number", mobileNumberValue || "", { shouldValidate: true });
    }
  }, [sameAsMobile, mobileNumberValue, setValue]);

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("realtor_pic", file);
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 mt-6">
      
      {/* Profile Header Card */}
      <FormCard title="">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <RealtorAvatar
              src={previewPic}
              alt={initialData?.full_name || "Profile"}
              size={64}
              isFoundingRealtor={Boolean(initialData?.is_founding_realtor)}
              fallbackClassName="bg-slate-100 text-slate-400 font-bold text-xl"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {initialData?.full_name || "Precious Ekong"}
              </h3>
              <p className="text-sm text-slate-500 truncate">
                {initialData?.email || "precious@gmail.com"}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePictureChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              Change Picture
            </Button>
          </div>
        </div>
      </FormCard>

      {/* Profile Details Card */}
      <FormCard title="Profile">
        <div className="space-y-5">
          {/* Full Name */}
          <Controller
            name="full_name"
            control={control}
            render={({ field }) => (
              <FormControl
                as="input"
                labelText="Full Name"
                placeholder="John Doe"
                type="text"
                containerClass="w-full"
                {...field}
                disabled={isPending}
                error={getErrorMessage(errors.full_name)}
              />
            )}
          />

          {/* Email Address (Non-editable) */}
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormControl
                as="input"
                labelText="Email Address"
                placeholder="johndoe@example.com"
                type="email"
                containerClass="w-full"
                {...field}
                disabled={true} // Hard-disabled so users cannot edit email
                readOnly={true}
                className="bg-slate-100 text-slate-500 cursor-not-allowed" // Visual hint for read-only state
                error={getErrorMessage(errors.email)}
              />
            )}
          />
        </div>
      </FormCard>

      {/* Contact Card */}
      <FormCard title="Contact">
        <div className="w-full flex flex-col md:flex-row gap-6">
          <div className="w-full">
            <Controller
              name="mobile_number"
              control={control}
              rules={{ required: "Mobile number is required" }}
              render={({ field }) => (
                <FormControl
                  as="input"
                  labelText="Mobile *"
                  placeholder="+234 xxxxx xxxxx"
                  type="text"
                  containerClass="w-full"
                  {...field}
                  disabled={isPending}
                  error={getErrorMessage(errors.mobile_number)}
                />
              )}
            />
          </div>

          <div className="w-full space-y-2">
            <Controller
              name="whatsapp_number"
              control={control}
              rules={{ required: "WhatsApp number is required" }}
              render={({ field }) => (
                <FormControl
                  as="input"
                  labelText="WhatsApp *"
                  placeholder="+234 xxxxx xxxxx"
                  type="text"
                  containerClass="w-full"
                  {...field}
                  disabled={isPending || sameAsMobile}
                  error={getErrorMessage(errors.whatsapp_number)}
                />
              )}
            />

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="sameAsMobile"
                checked={sameAsMobile}
                onChange={(e) => setSameAsMobile(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="sameAsMobile" className="text-sm text-slate-600 cursor-pointer">
                Same as mobile?
              </label>
            </div>
          </div>
        </div>
      </FormCard>

      {/* Primary Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg"
          disabled={isPending}
        >
          {isPending ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </form>
  );
}