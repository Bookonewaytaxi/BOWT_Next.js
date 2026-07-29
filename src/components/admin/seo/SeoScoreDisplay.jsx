import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

export default function SeoScoreDisplay({ score, showLabel = true, size = "md" }) {
  let colorClass = "bg-red-100 text-red-700 border-red-200";
  let progressColor = "bg-red-500";
  let label = "Poor";
  
  if (score >= 75) {
    colorClass = "bg-green-100 text-green-700 border-green-200";
    progressColor = "bg-green-500";
    label = "Good";
  } else if (score >= 60) {
    colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
    progressColor = "bg-yellow-500";
    label = "Average";
  }

  const sizeClasses = size === "sm" ? "h-1.5 w-16" : "h-2 w-24";
  const badgeClasses = size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5";

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
           <span className={cn("font-bold tabular-nums", score >= 75 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600")}>
             {score}/100
           </span>
           {showLabel && (
             <Badge variant="outline" className={cn("font-medium border-0", colorClass, badgeClasses)}>
               {label}
             </Badge>
           )}
        </div>
        <div className={cn("bg-slate-100 rounded-full overflow-hidden", sizeClasses)}>
          <div 
            className={cn("h-full transition-all duration-500 ease-out rounded-full", progressColor)} 
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      
      {showLabel && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-slate-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Score based on keywords, content length, meta tags, and internal links.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}