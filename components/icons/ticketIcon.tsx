'use client'

import { useState } from 'react';

const TikketIcon = () => {
  const [isHovered, setIsHovered] = useState(false);
  const primaryColor = "#1E293B"; 
  const accentColor = "#FF4F5E"; 

  return (
    <div
      className="flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        viewBox="0 0 60 60"
        className="w-8 h-8"
      >
        <path
          d="M10,15 L50,15 C53,15 55,17 55,20 L55,25 C50,25 50,35 55,35 L55,40 C55,43 53,45 50,45 L10,45 C7,45 5,43 5,40 L5,35 C10,35 10,25 5,25 L5,20 C5,17 7,15 10,15 Z"
          fill="white"
          stroke={primaryColor}
          strokeWidth="2"
          className="transition-all duration-300"
        />

        <path
          d="M30,15 L30,45"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeDasharray="2 3"
          opacity="0.7"
        />

        <circle
          cx="20"
          cy="30"
          r={isHovered ? "5" : "4"}
          fill={accentColor}
          className="transition-all duration-200"
        />

        <path
          d="M35,30 L45,30"
          stroke={accentColor}
          strokeWidth="2"
          strokeLinecap="round"
          opacity={isHovered ? "1" : "0.6"}
          className="transition-all duration-300"
          transform={isHovered ? "translate(2, 0)" : ""}
        />
      </svg>
    </div>
  );
};

export default TikketIcon;
