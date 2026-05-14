import React from 'react'

export function Danger(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M8 6V9.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.99998 14.2733H3.95998C1.64664 14.2733 0.679976 12.62 1.79998 10.6L3.87998 6.85333L5.83998 3.33333C7.02664 1.19333 8.97331 1.19333 10.16 3.33333L12.12 6.86L14.2 10.6067C15.32 12.6267 14.3466 14.28 12.04 14.28H7.99998V14.2733Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.99634 11.3333H8.00233" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
