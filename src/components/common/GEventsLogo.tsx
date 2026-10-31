import React from 'react';

interface GEventsLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const GEventsLogo: React.FC<GEventsLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', icon: 'w-4 h-4', text: 'text-base', sub: 'text-[10px]' },
    md: { box: 'w-9 h-9 sm:w-10 sm:h-10', icon: 'w-5 h-5 sm:w-5.5 sm:h-5.5', text: 'text-lg sm:text-xl', sub: 'text-[11px]' },
    lg: { box: 'w-12 h-12', icon: 'w-7 h-7', text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', icon: 'w-9 h-9', text: 'text-3xl sm:text-4xl', sub: 'text-sm' },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Emblem */}
      <div
        className={`${current.box} rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 border border-emerald-400/30 shrink-0 relative overflow-hidden group`}
      >
        {/* Subtle inner reflection */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />

        {/* Bespoke Geometric G Icon */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${current.icon} drop-shadow-xs`}
        >
          {/* Main outer G loop */}
          <path
            d="M26 16C26 21.5228 21.5228 26 16 26C10.4772 26 6 21.5228 6 16C6 10.4772 10.4772 6 16 6C19.3496 6 22.3023 7.6469 24.103 10.1691"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Horizontal crossbar of G */}
          <path
            d="M16 16H25.5"
            stroke="#6EE7B7"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Center energy diamond in mint */}
          <rect
            x="14"
            y="7.5"
            width="3.5"
            height="3.5"
            transform="rotate(45 14 7.5)"
            fill="#A7F3D0"
          />
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-serif-heading font-extrabold tracking-tight text-stone-900 ${current.text}`}>
              <span className="text-emerald-700">G</span>-Events
            </span>
          </div>
          {subtitle && (
            <span className={`text-stone-500 font-medium tracking-normal mt-0.5 truncate ${current.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
