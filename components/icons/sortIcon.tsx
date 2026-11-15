import React from 'react';

export function SortIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 18 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`text-[var(--primary)] ${className || ''}`} // Keeps your signature blue as default, but lets custom classes override it
			{...props}
		>
			<path
				d="M2.25 5.25H15.75"
				stroke="currentColor" // 💡 Dynamically adapts to parent layout text colors
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path
				d="M4.5 9H13.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path
				d="M7.5 12.75H10.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}