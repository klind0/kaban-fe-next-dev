import React from 'react'

export default function X(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <rect x="0.25" y="0.25" width="23.5" height="23.5" rx="11.75" fill="var(--color-blue-50)" />
            <rect x="0.25" y="0.25" width="23.5" height="23.5" rx="11.75" stroke="var(--neutral-600)" strokeWidth="0.5" />
            <rect width="13.0432" height="1.08692" rx="0.543458" transform="matrix(0.70738 -0.706833 0.695875 0.718163 7 16.2188)" fill="var(--foreground)" />
            <rect width="13.0432" height="1.08692" rx="0.543458" transform="matrix(0.70738 0.706833 -0.695875 0.718163 7.77344 7)" fill="var(--foreground)" />
        </svg>
    )
}
