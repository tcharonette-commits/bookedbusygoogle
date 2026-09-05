import React from 'react';

interface EyebrowArchProps {
  className?: string;
  id?: string;
}

export default function EyebrowArch({ className = '', id }: EyebrowArchProps) {
  return (
    <div className={`w-full overflow-hidden flex justify-start py-1 ${className}`} id={id || "eyebrow-arch-container"}>
      <svg
        viewBox="0 0 300 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[280px] h-4 text-[#D8C4BC]"
        id="eyebrow-arch-svg"
      >
        <path
          d="M 5,20 Q 100,4 295,20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
