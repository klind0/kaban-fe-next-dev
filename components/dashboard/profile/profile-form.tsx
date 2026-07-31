"use client";

import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Image from "next/image";
import FormControl from "@/components/universal/form-control";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { Button } from "@/components/ui/button";
import FormCard from "@/components/dashboard/create-listing/form-card";

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

  const mobileNumberValue = watch("mobile_number");

  // Sync WhatsApp number when "Same as mobile?" is checked
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
      <FormCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
              {previewPic ? (
                <Image
                  src={previewPic}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                  {initialData?.full_name ? initialData.full_name[0] : "P"}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xl font-bold text-slate-900">
                  {initialData?.full_name || "Precious Ekong"}
                </h3>
                <span className="text-blue-600">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </span>
              </div>
              <p className="text-sm text-slate-500">
                {initialData?.email || "precious@gmail.com"}
              </p>
            </div>
          </div>

          <div>
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
              className="border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
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
                disabled={isPending}
                error={getErrorMessage(errors.email)}
              />
            )}
          />
        </div>
      </FormCard>

      {/* Contact Card */}
      <FormCard title="Contact">
        <div className="space-y-4">
          <div className="w-full flex flex-col md:flex-row gap-6">
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
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="sameAsMobile"
              checked={sameAsMobile}
              onChange={(e) => setSameAsMobile(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="sameAsMobile" className="text-sm text-slate-600 cursor-pointer">
              Same as mobile?
            </label>
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