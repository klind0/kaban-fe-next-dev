"use client";

import React, { useState } from "react";
import {
    FieldValues,
    Path,
    RegisterOptions,
    UseFormRegister,
    FieldError,
    UseFormSetValue,
    PathValue,
} from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import CustomSelect from "@/components/universal/custom-select";

type FormControlElement = "input" | "select" | "textarea";
type InputProps = React.ComponentPropsWithoutRef<"input">;
type SelectProps = {
    options: { value: string; name: string }[];
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
} & React.ComponentPropsWithoutRef<"select">;
type TextAreaProps = React.ComponentPropsWithoutRef<"textarea">;

type FormControlProps<T extends FieldValues> = (
    | ({ as: "input" } & InputProps)
    | ({ as: "select" } & SelectProps)
    | ({ as: "textarea" } & TextAreaProps)
) & {
    icon?: React.ReactNode;
    inputStyle?: boolean;
    onContainerFocus?: React.FocusEventHandler<HTMLDivElement>;
    containerClass?: string;
    labelText?: string;
    radius?: string;
    error?: string | FieldError;
    register?: UseFormRegister<T>;
    registerOptions?: RegisterOptions<T, Path<T>>;
    setValue?: UseFormSetValue<T>;
    suffix?: string;
};

function isSelect(as: FormControlElement, props: unknown): props is SelectProps {
    return as === "select";
}

function isInput(as: FormControlElement, props: unknown): props is InputProps {
    return as === "input";
}

export default function FormControl<T extends FieldValues>({
    as,
    error,
    labelText,
    containerClass,
    registerOptions,
    onContainerFocus,
    register = (() => ({})) as unknown as UseFormRegister<T>,
    setValue,
    suffix,
    ...props
}: FormControlProps<T>) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    let content;
    const notice = props.required ? "*" : "";

    if (isSelect(as, props)) {
        const { options, placeholder, className, value, onChange } = props;

        content = (
            <CustomSelect
                value={value || ""}
                onChange={(val: string) => {
                    if (onChange) {
                        onChange(val);
                    }
                    if (setValue) {
                        setValue(props.name as Path<T>, val as PathValue<T, Path<T>>);
                    }
                }}
                options={options.map((o) => ({ value: o.value, name: o.name }))}
                placeholder={placeholder || "Select..."}
                className={`${error ? "border-[var(--destructive)]" : ""} lg:max-w-full ${className || ""}`}
            />
        );
    } else if (isInput(as, props)) {
        const inputType = props.type === "password" && showPassword ? "text" : props.type;

        content = (
            <div className="relative">
                <input
                    {...props}
                    type={inputType}
                    {...register(props.name as Path<T>, {
                        required: props.required && "This field is required",
                        ...registerOptions,
                    })}
                    className={`${error ? "border-[var(--destructive)]" : "border-neutral-700"
                        } border rounded-sm h-11 outline-none p-3 text-base w-full font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"`}
                />
                {props.type === "password" && (
                    <span
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </span>
                )}
                {suffix && (
                    <span
                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-grey-alpha-150"
                    >
                        {suffix}
                    </span>
                )}
            </div>
        );
    } else {
        content = (
            <textarea
                {...props}
                {...register(props.name as Path<T>, {
                    required: props.required && "This field is required",
                    ...registerOptions,
                })}
                className={`border rounded-sm p-3 text-base outline-none placeholder:text-grey-alpha-100 focus:ring-2 focus-visible:border-ring focus-visible:ring-ring/50 ${error ? "border-[var(--destructive)]" : "border-[var(--neutral-700)]"
                    } w-full`}
                rows={props.rows ? props.rows : 6}
            />
        );
    }

    return (
        <div
            onFocus={onContainerFocus}
            className={`flex flex-col gap-1 ${containerClass}`}
        >
            <div className="flex items-center justify-baseline">
                {labelText && (
                    <div className="w-full flex justify-between">
                        <label htmlFor={props.name} className="text-foreground text-sm font-medium">
                            {labelText}
                            {notice}
                        </label>
                    </div>
                )}
                {error && (
                    <span className="text-[var(--destructive)] text-xs sm:text-sm whitespace-nowrap">
                        {typeof error === "string" ? error : error?.message}
                    </span>
                )}
            </div>
            {content}
        </div>
    );
}