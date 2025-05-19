"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Award, Flame } from "lucide-react";

interface StreakBadgeProps {
  currentStreak: number;
  maxStreak: number;
}

export default function StreakBadge({ currentStreak, maxStreak }: StreakBadgeProps) {
  // Determine badge color based on streak length
  const getBadgeVariant = () => {
    if (currentStreak >= 30) return "default"; // Blue
    if (currentStreak >= 14) return "secondary"; // Gray
    if (currentStreak >= 7) return "outline"; // White outline
    return "secondary"; // Default gray
  };

  // Award icon if you're at your max streak
  const showAward = currentStreak > 0 && currentStreak === maxStreak;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <Badge variant={getBadgeVariant()} className="py-1 h-7 gap-1 px-2">
              <Flame className="h-3.5 w-3.5" />
              <span className="font-medium">{currentStreak}</span>
              {showAward && <Award className="h-3.5 w-3.5 text-yellow-400" />}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5" />
              <span>Current streak: {currentStreak} day{currentStreak !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Longest streak: {maxStreak} day{maxStreak !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 