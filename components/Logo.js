import { Mic } from 'lucide-react';
import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-1 font-semibold">
      <Mic className="h-6 w-6 text-primary" />
      <span className="text-black font-bold text-xl tracking-tighter">
        NARSVoice<span className="bg-primary text-white p-1">Box</span>
      </span>
    </div>
  );
};

export default Logo;
