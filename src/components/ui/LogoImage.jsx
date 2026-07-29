import React from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';

const LOGO_URL = "/logo.jpg";

export default function LogoImage({ className, size = "medium", onClick, ...props }) {
  const router = useRouter();

  const sizeClasses = {
    small: "h-8 md:h-10",      // 32px - 40px
    medium: "h-12 md:h-16",    // 48px - 64px
    large: "h-16 md:h-20",     // 64px - 80px
    xl: "h-20 md:h-24"         // 80px - 96px
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      router.push('/');
    }
  };

  return (
    <img 
      src={LOGO_URL} 
      alt="One Way Taxi Logo" 
      className={cn(
        "w-auto object-contain cursor-pointer transition-transform hover:scale-105", 
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
}
