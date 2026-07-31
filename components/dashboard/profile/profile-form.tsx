"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileForm() {
    const [formData, setFormData] = useState({
        fullName: 'Precious Ekong',
        email: 'precious@gmail.com',
        mobile: '',
        whatsapp: '',
        sameAsMobile: false,
        avatarUrl: '/images/avatar-placeholder.jpg',
        isVerified: true,
    });

    const [isPending, setIsPending] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === 'mobile' && prev.sameAsMobile) {
                updated.whatsapp = value;
            }
            return updated;
        });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setFormData((prev) => ({
            ...prev,
            sameAsMobile: checked,
            whatsapp: checked ? prev.mobile : prev.whatsapp,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        
        try {
            // Replace with your API mutation handler
            console.log('Profile submission:', formData);
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update profile.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header Avatar Card */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        <Image
                            src={formData.avatarUrl}
                            alt={formData.fullName}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900">{formData.fullName}</h2>
                            {formData.isVerified && (
                                <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-600/10" />
                            )}
                        </div>
                        <p className="text-sm text-gray-500">{formData.email}</p>
                    </div>
                </div>

                <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                        <Camera className="w-4 h-4 text-gray-500" />
                        <span>Change Picture</span>
                        <input type="file" accept="image/*" className="hidden" />
                    </label>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Fields Card */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-5">
                    <h3 className="text-lg font-semibold text-gray-900">Profile</h3>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="johndoe@example.com"
                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Details Card */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-5">
                    <h3 className="text-lg font-semibold text-gray-900">Contact</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Mobile <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="+234 xxxxx xxxxx"
                                required
                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    WhatsApp <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="whatsapp"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                    disabled={formData.sameAsMobile}
                                    placeholder="+234 xxxxx xxxxx"
                                    required
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="sameAsMobile"
                                    checked={formData.sameAsMobile}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="sameAsMobile" className="text-sm text-gray-600 select-none cursor-pointer">
                                    Same as mobile?
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Action */}
                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Updating...' : 'Update Profile'}
                    </Button>
                </div>
            </form>
        </div>
    );
}