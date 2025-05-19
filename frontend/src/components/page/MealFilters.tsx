import React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, X, FilterIcon, ChevronDown } from "lucide-react";
import { MealForm } from "@/interfaces/MealForm";
import { ModeToggle } from "@/components/provider/Dark-LightModeToggle";

interface MealFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  mealTypeFilter: string | null;
  setMealTypeFilter: (value: string | null) => void;
  eatingOutFilter: boolean | null;
  setEatingOutFilter: (value: boolean | null) => void;
  tagFilter: string | null;
  setTagFilter: (value: string | null) => void;
  meals: MealForm[];
  onAddMeal: () => void;
}

const MealFilters: React.FC<MealFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  mealTypeFilter,
  setMealTypeFilter,
  eatingOutFilter,
  setEatingOutFilter,
  tagFilter,
  setTagFilter,
  meals,
  onAddMeal,
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search meals by name, type, date, tags, or 'out'/'in'..."
          className="pl-9 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Badges */}
      {(mealTypeFilter !== null || eatingOutFilter !== null || tagFilter !== null) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active Filters:</span>
          {mealTypeFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {mealTypeFilter}
              <X 
                size={14} 
                className="cursor-pointer ml-1" 
                onClick={() => setMealTypeFilter(null)} 
              />
            </Badge>
          )}
          {eatingOutFilter !== null && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {eatingOutFilter ? "Eating Out" : "Eating In"}
              <X 
                size={14} 
                className="cursor-pointer ml-1" 
                onClick={() => setEatingOutFilter(null)} 
              />
            </Badge>
          )}
          {tagFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {tagFilter}
              <X 
                size={14} 
                className="cursor-pointer ml-1" 
                onClick={() => setTagFilter(null)} 
              />
            </Badge>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col xs:flex-row gap-2 flex-wrap">
        <Button onClick={onAddMeal}>Add New Meal</Button>
        
        <div className="flex gap-2 flex-1 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 flex-1 xs:flex-none">
                <FilterIcon size={16} />
                <span className="hidden xs:inline">Filter</span> Out/In
                <ChevronDown size={14} className="opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEatingOutFilter(null)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEatingOutFilter(true)}>
                Eating Out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEatingOutFilter(false)}>
                Eating In
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 flex-1 xs:flex-none">
                <FilterIcon size={16} />
                <span className="hidden xs:inline">Filter</span> Type
                <ChevronDown size={14} className="opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setMealTypeFilter(null)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMealTypeFilter("Breakfast")}>
                Breakfast
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMealTypeFilter("Lunch")}>
                Lunch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMealTypeFilter("Dinner")}>
                Dinner
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 flex-1 xs:flex-none">
                <FilterIcon size={16} />
                <span className="hidden xs:inline">Filter</span> Tags
                <ChevronDown size={14} className="opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTagFilter(null)}>
                All Tags
              </DropdownMenuItem>
              <Separator />
              {Array.from(new Set(meals.flatMap(m => m.tags))).map(tag => (
                <DropdownMenuItem key={tag} onClick={() => setTagFilter(tag)}>
                  {tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealFilters; 