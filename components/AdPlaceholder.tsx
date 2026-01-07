
import React from 'react';

interface AdPlaceholderProps {
  type: 'banner' | 'in-content' | 'footer';
  className?: string;
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ type, className = '' }) => {
  const styles = {
    banner: 'h-[90px] w-full max-w-[728px] mx-auto bg-gray-200 border border-dashed border-gray-400 flex items-center justify-center rounded-lg',
    'in-content': 'h-[250px] w-full max-w-[300px] mx-auto bg-gray-200 border border-dashed border-gray-400 flex items-center justify-center rounded-lg my-8',
    footer: 'h-[250px] w-full max-w-[970px] mx-auto bg-gray-200 border border-dashed border-gray-400 flex items-center justify-center rounded-lg mt-12'
  };

  return (
    <div className={`${styles[type]} ${className} relative overflow-hidden group`}>
      <div className="text-gray-400 text-xs font-bold uppercase tracking-widest transition-opacity group-hover:opacity-75">
        Advertisement
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-300/10 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default AdPlaceholder;
