import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarDays, CalendarClock, CalendarRange, ListFilter, History } from 'lucide-react';

export default function BookingFilters({ activeFilter, onFilterChange, counts }) {
  const filters = [
    { id: 'all', label: 'All', icon: ListFilter, count: counts.all },
    { id: 'today', label: 'Today', icon: CalendarDays, count: counts.today },
    { id: 'tomorrow', label: 'Tomorrow', icon: CalendarClock, count: counts.tomorrow },
    { id: 'week', label: 'This Week', icon: CalendarRange, count: counts.week },
    { id: 'preorder', label: 'Pre-Orders', icon: History, count: counts.preorder },
  ];

  return (
    <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm w-fit overflow-x-auto whitespace-nowrap scrollbar-none">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <Button
            key={filter.id}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className={`
              relative flex items-center gap-2 transition-all duration-300 rounded-lg px-3 md:px-4 h-8 md:h-9
              ${isActive 
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow-lg shadow-amber-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }
            `}
          >
            <filter.icon className={`h-3.5 w-3.5 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
            <span className="text-xs md:text-sm">{filter.label}</span>
            {filter.count > 0 && (
              <span className={`
                ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold
                ${isActive ? 'bg-slate-900/20 text-slate-900' : 'bg-slate-800 text-slate-400'}
              `}>
                {filter.count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}