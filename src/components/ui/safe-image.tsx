'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type SafeImageProps = ImageProps & {
  fallback?: React.ReactNode;
};

export function SafeImage({ fallback, alt, ...props }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <Image
      alt={alt}
      {...props}
      onError={() => setError(true)}
    />
  );
}
