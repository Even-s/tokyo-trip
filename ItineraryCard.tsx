import React from 'react';
import { ItineraryItem } from '../itinerary';
import { MapPin, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ItineraryCardProps {
  item: ItineraryItem;
  index: number;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({ item, index }) => {
  return (
    <div 
      className={cn(
        "group relative grid grid-cols-12 gap-4 py-8 border-t-2 border-swiss-black transition-colors duration-300",
        "hover:bg-swiss-offwhite"
      )}
    >
      {/* Column 1: Time & Index (Grid 3/12) */}
      <div className="col-span-3 flex flex-col justify-between">
        <span className="text-5xl md:text-7xl font-bold tracking-tighter text-swiss-black">
          {item.time}
        </span>
        <span className="text-xs font-mono text-gray-400 mt-2">
          NO. {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Column 2: Activity Details (Grid 8/12) */}
      <div className="col-span-8 flex flex-col gap-3 pt-2">
        {/* Location Tag */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-swiss-red">
          <MapPin className="w-3 h-3" />
          {item.location}
        </div>

        {/* Activity Name */}
        <h3 className="text-2xl md:text-4xl font-medium leading-tight text-swiss-black">
          {item.activity}
        </h3>

        {/* Note */}
        {item.note && (
          <p className="text-sm text-gray-500 max-w-md font-sans">
            {item.note}
          </p>
        )}
      </div>

      {/* Column 3: Status (Grid 1/12) */}
      <div className="col-span-1 flex justify-end pt-3">
        {item.isBooked ? (
          <CheckCircle2 className="w-6 h-6 text-swiss-black" strokeWidth={1.5} />
        ) : (
          <Circle className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
        )}
      </div>
    </div>
  );
};