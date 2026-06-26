'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimateOnViewProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fadeIn' | 'scaleIn';
  as?: 'div' | 'section' | 'article';
}

export function AnimateOnView({
  children,
  className,
  delay = 0,
  animation = 'fadeIn',
  as: Tag = 'div',
}: AnimateOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag
      ref={ref}
      className={cn(
        'transition-all duration-500',
        visible ? `animate-${animation}` : 'opacity-0 translate-y-2',
        className
      )}
    >
      {children}
    </Tag>
  );
}
