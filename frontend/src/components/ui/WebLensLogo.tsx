'use strict';
/* eslint-disable @next/next/no-img-element */

import React from 'react';

interface WebLensLogoProps {
  className?: string;
  size?: number;
  variant?: 'icon' | 'full';
  withContainer?: boolean;
}

export function WebLensLogo({
  className = '',
  size = 28,
  variant = 'icon',
  withContainer = false,
}: WebLensLogoProps) {
  if (variant === 'full') {
    return (
      <img
        src="/logo.png"
        alt="WebLens AI"
        className={`h-auto object-contain ${className}`}
        style={{ maxHeight: size }}
      />
    );
  }

  const image = (
    <img
      src="/favicon.png"
      alt="WebLens AI Emblem"
      width={size}
      height={size}
      className={`object-contain rounded-lg ${className}`}
      style={{ width: size, height: size }}
    />
  );

  if (withContainer) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#0B0B0D] flex items-center justify-center p-1 shrink-0">
        <img
          src="/favicon.png"
          alt="WebLens AI Emblem"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    );
  }

  return image;
}
