"use client"
import React from "react";
import { ArrowDown } from "../icons/arrow-down";

export interface SelectOption {
    name: string;
    value: string;
}

export interface SelectGroup {
    group?: string;
    options: SelectOption[];
}

export interface CustomSelectProps {
    placeholder?: string;
    /** Pass either a flat array of options OR an array of groups */
    options?: SelectOption[];
    groups?: SelectGroup[];
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
}

export default function CustomSelect({
    placeholder = "Select",
    options,
    groups,
    value,
    onChange,
    className = "",
}: CustomSelectProps) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    const allOptions: SelectOption[] = React.useMemo(() => {
        if (options) return options;
        if (groups) return groups.flatMap((g) => g.options);
        return [];
    }, [options, groups]);

    const selectedLabel = allOptions.find((o) => o.value === value)?.name;

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange?.(val);
        setOpen(false);
    };

    const renderGroups: SelectGroup[] = groups
        ? groups
        : options
            ? [{ options }]
            : [];

    return (
        <div ref={ref} className={`relative w-full lg:max-w-40 ${className}`}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 border border-neutral-700 rounded-sm h-11 outline-none p-4 text-gray-50 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            >
                <span className={`md:text-sm! ${selectedLabel ? "text-gray-800" : "text-gray-400"}`}>
                    {selectedLabel ?? placeholder}
                </span>
                <ArrowDown
                    className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-2 w-full bg-white border rounded-2xl shadow-lg py-2 max-h-72 overflow-y-auto">
                    {renderGroups.map((group, gi) => (
                        <div key={gi}>
                            {/* Optional group heading */}
                            {group.group && (
                                <p className="px-4 pt-3 pb-1 text-sm font-semibold text-gray-800">
                                    {group.group}
                                </p>
                            )}
                            {group.options.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-neutral-100 ${opt.value === value
                                        ? "font-semibold"
                                        : "text-gray-50"
                                        }`}
                                >
                                    {opt.name}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}