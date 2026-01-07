
import React from 'react';

interface AdPlaceholderProps {
  type: 'banner' | 'in-content' | 'footer';
  className?: string;
  label?: string;
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ type, className = '', label = 'Advertisement' }) => {
  // Real Google AdSense Standard Dimensions
  const styles = {
    banner: 'h-[90px] w-full max-w-[728px] mx-auto', // Leaderboard
    'in-content': 'h-[250px] w-full max-w-[300px] mx-auto', // Medium Rectangle
    'footer': 'h-[250px] w-full max-w-[970px] mx-auto' // Large Leaderboard
  };

  return (
    <div className={`${styles[type]} ${className} relative bg-[#f8f9fa] border border-[#dadce0] overflow-hidden flex flex-col items-center justify-center transition-shadow hover:shadow-sm`}>
      {/* Google AdSense Corner Icon & Label */}
      <div className="absolute top-0 right-0 p-1 flex items-center space-x-1">
        <span className="text-[10px] text-[#70757a] font-sans tracking-tight">
          {label}
        </span>
        <svg className="w-3 h-3 text-[#70757a]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </div>

      {/* Simulated Ad Content */}
      <div className="flex flex-col items-center justify-center space-y-2 opacity-60">
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-2 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-2 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* "Ads by Google" subtle footer found on many real ads */}
      <div className="absolute bottom-0 left-0 w-full px-2 py-0.5 border-t border-[#f1f3f4] flex justify-between items-center bg-white/50">
        <div className="flex items-center space-x-1">
           <div className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></div>
           <span className="text-[9px] text-[#70757a] font-medium italic">Ads by Google</span>
        </div>
        <div className="text-[9px] text-[#1a73e8] hover:underline cursor-pointer">
          Report this ad
        </div>
      </div>

      {/* Placeholder Tag Info for Developers */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <span className="font-mono text-xs font-bold uppercase">
          {type === 'banner' ? '728 x 90' : type === 'in-content' ? '300 x 250' : '970 x 250'}
        </span>
      </div>
    </div>
  );
};

export default AdPlaceholder;
