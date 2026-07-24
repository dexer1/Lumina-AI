import React from 'react';

export default function LuminaLogo({ size = 28, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 8H20.5V41.5H36.5V55H7V8Z"
        fill="currentColor"
      />
      <path
        d="M27.5 55L41.2 17H51L63 55H51.5L48.7 46.5H38.8L35.8 55H27.5ZM42 36.5H46L44.2 29.2L42 36.5Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M35.8 46.5H45L35.8 55V46.5Z"
        fill="#C8FF46"
      />
    </svg>
  );
}
