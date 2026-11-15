import React from 'react'

export function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <rect x="0.5" y="0.5" width="47" height="47" rx="23.5" fill="var(--color-blue-50)" />
            <rect x="0.5" y="0.5" width="47" height="47" rx="23.5" stroke="var(--primary)" />
            <path d="M21.5001 32.3346H26.5001C30.6667 32.3346 32.3334 30.668 32.3334 26.5013V21.5013C32.3334 17.3346 30.6667 15.668 26.5001 15.668H21.5001C17.3334 15.668 15.6667 17.3346 15.6667 21.5013V26.5013C15.6667 30.668 17.3334 32.3346 21.5001 32.3346Z" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21.4999 22.3333C22.4204 22.3333 23.1666 21.5871 23.1666 20.6667C23.1666 19.7462 22.4204 19 21.4999 19C20.5794 19 19.8333 19.7462 19.8333 20.6667C19.8333 21.5871 20.5794 22.3333 21.4999 22.3333Z" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.2251 29.7898L20.3334 27.0315C20.9918 26.5898 21.9418 26.6398 22.5334 27.1482L22.8084 27.3898C23.4584 27.9482 24.5084 27.9482 25.1584 27.3898L28.6251 24.4148C29.2751 23.8565 30.3251 23.8565 30.9751 24.4148L32.3334 25.5815" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
