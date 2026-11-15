import React from 'react';

export function Bath(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M2 7.99935H2.66667M13.3333 7.99935C13.5101 7.99935 13.6797 7.92911 13.8047 7.80409C13.9298 7.67906 14 7.50949 14 7.33268V4.66602C14 3.99935 13.6 2.66602 12 2.66602C10.4 2.66602 10 3.99935 10 4.66602M13.3333 7.99935V9.33268C13.3333 10.0913 12.9447 11.498 11.5033 11.8933M13.3333 7.99935H2.66667M2.66667 7.99935V9.33268C2.66667 10.0913 3.05533 11.498 4.49667 11.8933M4 13.3327L4.49667 11.8933M4.49667 11.8933C4.74333 11.9613 5.02133 11.9993 5.33333 11.9993H10.6667C10.9491 12.0018 11.2305 11.9661 11.5033 11.8933M12 13.3327L11.5033 11.8933M10 4.66602H8.66667M10 4.66602H11.3333"
				stroke="currentColor" /* 💡 Changed from var(--foreground) to respond to text color classes */
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}