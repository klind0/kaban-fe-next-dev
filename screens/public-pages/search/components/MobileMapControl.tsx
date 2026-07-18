'use client';

import { Dispatch, SetStateAction } from 'react';
import { Grid } from '@/components/icons/grid';
import { MapIcon } from '@/components/icons/map';

type ControlProps = {
  stackOrder: 'listings' | 'map';
  setStackOrder: (stackOrder: 'listings' | 'map') => void;
  setMap: Dispatch<SetStateAction<boolean>>;
};

export default function MobileMapControl({ stackOrder, setStackOrder, setMap }: ControlProps) {
  const handleStackOrder = (order: 'listings' | 'map') => {
    setStackOrder(order);
    // Sync map state properly: True when user explicitly views the map panel
    setMap(order === 'map');
  };

  const listingsActive = stackOrder === 'listings' ? 'bg-blue-500/20 text-primary font-medium' : 'text-neutral-600';
  const mapActive = stackOrder === 'map' ? 'bg-blue-500/20 text-primary font-medium' : 'text-neutral-600';

  return (
    <div
      className={`flex md:hidden p-1.5 rounded-xl z-50 fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-lg border border-neutral-200/50 justify-between items-center transition-all duration-300 ${
        stackOrder === 'map' ? 'w-[85vw]' : 'w-[90vw]'
      }`}
    >
      {/* Listings Toggle Button */}
      <button
        type="button"
        onClick={() => handleStackOrder('listings')}
        className={`flex py-3 w-full gap-2.5 items-center hover:text-primary rounded-lg justify-center transition-colors ${listingsActive}`}
      >
        <Grid className="w-5 h-5" />
        <span className="text-sm">Listings</span>
      </button>

      {/* Map Toggle Button */}
      <button
        type="button"
        onClick={() => handleStackOrder('map')}
        className={`flex py-3 w-full gap-2.5 items-center hover:text-primary rounded-lg justify-center transition-colors ${mapActive}`}
      >
        <MapIcon className="w-5 h-5" />
        <span className="text-sm">Map View</span>
      </button>
    </div>
  );
}