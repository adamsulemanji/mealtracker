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
import { Search, X, ChevronDown } from "lucide-react";
import { MealForm } from "@/interfaces/MealForm";

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
}) => {
  const uniqueTags = Array.from(new Set(meals.flatMap((m) => m.tags || [])));
  const hasActiveFilters =
    mealTypeFilter !== null || eatingOutFilter !== null || tagFilter !== null;

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search meals..."
          className="pl-9 h-9 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={eatingOutFilter !== null ? "secondary" : "outline"}
              size="sm"
              className="h-8 text-xs gap-1"
            >
              {eatingOutFilter === null
                ? "Out / In"
                : eatingOutFilter
                ? "Eating Out"
                : "Eating In"}
              <ChevronDown size={12} className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setEatingOutFilter(null)}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEatingOutFilter(true)}>Eating Out</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEatingOutFilter(false)}>Eating In</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={mealTypeFilter !== null ? "secondary" : "outline"}
              size="sm"
              className="h-8 text-xs gap-1"
            >
              {mealTypeFilter ?? "Meal Type"}
              <ChevronDown size={12} className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setMealTypeFilter(null)}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMealTypeFilter("Breakfast")}>Breakfast</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMealTypeFilter("Lunch")}>Lunch</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMealTypeFilter("Dinner")}>Dinner</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {uniqueTags.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={tagFilter !== null ? "secondary" : "outline"}
                size="sm"
                className="h-8 text-xs gap-1"
              >
                {tagFilter ?? "Tags"}
                <ChevronDown size={12} className="opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setTagFilter(null)}>All Tags</DropdownMenuItem>
              <Separator />
              {uniqueTags.map((tag) => (
                <DropdownMenuItem key={tag} onClick={() => setTagFilter(tag)}>
                  {tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground gap-1"
            onClick={() => {
              setMealTypeFilter(null);
              setEatingOutFilter(null);
              setTagFilter(null);
            }}
          >
            <X size={12} /> Clear
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {mealTypeFilter && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              {mealTypeFilter}
              <X size={11} className="cursor-pointer" onClick={() => setMealTypeFilter(null)} />
            </Badge>
          )}
          {eatingOutFilter !== null && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              {eatingOutFilter ? "Out" : "In"}
              <X size={11} className="cursor-pointer" onClick={() => setEatingOutFilter(null)} />
            </Badge>
          )}
          {tagFilter && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              {tagFilter}
              <X size={11} className="cursor-pointer" onClick={() => setTagFilter(null)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default MealFilters;
