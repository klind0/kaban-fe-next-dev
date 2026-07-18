import React from 'react';

export function EllipseIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="7"
			height="7"
			viewBox="0 0 7 7"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props} // Moving this to the end allows you to override default width/height if needed
		>
			<circle cx="3.66675" cy="3.5" r="3" fill="currentColor" />
		</svg>
	);
}