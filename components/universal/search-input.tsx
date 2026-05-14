"use client";

import React from 'react'
import { Search } from '../icons/search';

type SearchInputProps = {
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    props?: React.InputHTMLAttributes<HTMLInputElement>;
}

export default function SearchInput({ placeholder, value, defaultValue, onChange, className, props }: SearchInputProps) {
    return (
        <div className={`flex w-full items-center gap-2 relative lg:max-w-103 ${className ? className : ''}`}>
            <input
                type="text"
                className="w-full min-w-50 border border-neutral-700 rounded-sm h-11 outline-none placeholder:text-gray-25 pl-4 pr-10 p-3 text-sm text-gray-50 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                placeholder={placeholder || "Search"}
                defaultValue={defaultValue}
                value={value}
                onChange={(e) => onChange?.(e)}
                {...props}
            />
            <span className="absolute right-4 pointer-events-none">
                <Search />
            </span>
        </div>
    )
}
