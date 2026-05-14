import React from 'react'

export default function Share(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M20 12L13.6 5V8.5C10.4 8.5 4 10.6 4 19C4 17.833 5.92 15.5 13.6 15.5V19L20 12Z" stroke="#272D37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
