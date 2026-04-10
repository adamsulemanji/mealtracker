import React from "react";
import { MealForm } from "@/interfaces/MealForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon, MapPin, Home } from "lucide-react";
import { cn } from "@/utils/lib/utils";

interface MealTableProps {
  meals: MealForm[];
  onRowClick: (meal: MealForm) => void;
  getShortenedDayOfWeek: (date: Date) => string;
  onSave: (meal: MealForm) => void;
  onDelete: (mealID: string) => void;
}

const mealTypeStyles: Record<string, string> = {
  Breakfast: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Lunch:     "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  Dinner:    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
};

const MealTable: React.FC<MealTableProps> = ({
  meals,
  onRowClick,
  getShortenedDayOfWeek,
  onSave,
  onDelete,
}) => {
  const outCount = meals.filter((m) => m.eatingOut).length;
  const inCount  = meals.filter((m) => !m.eatingOut).length;

  return (
    <div className="w-full">
      <ScrollArea className="h-[420px] lg:h-[480px] w-full border-t rounded-b-lg">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur-sm z-10">
            <TableRow className="border-b border-border/60">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Meal</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide table-cell">Type</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Where</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Note</TableHead>
              <TableHead className="w-[48px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {meals.map((meal) => (
              <TableRow
                key={meal.mealID}
                onClick={() => onRowClick(meal)}
                className="cursor-pointer group transition-colors hover:bg-muted/40 border-l-2 border-l-transparent hover:border-l-primary"
              >
                {/* Meal name — primary, bold */}
                <TableCell className="py-3">
                  <span className="font-semibold text-sm leading-tight">{meal.mealName}</span>
                  {meal.tags && meal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {meal.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0 font-normal text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>

                {/* Meal type — semantic color pill */}
                <TableCell className="py-3 table-cell">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    mealTypeStyles[meal.mealType] ?? "bg-muted text-muted-foreground"
                  )}>
                    {meal.mealType}
                  </span>
                </TableCell>

                {/* Eating out — icon + semantic color */}
                <TableCell className="py-3 hidden sm:table-cell">
                  {meal.eatingOut ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                      <MapPin className="h-3 w-3 shrink-0" />
                      Out
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Home className="h-3 w-3 shrink-0" />
                      In
                    </span>
                  )}
                </TableCell>

                {/* Date — de-emphasized, small */}
                <TableCell className="py-3 whitespace-nowrap">
                  <span className="text-xs text-muted-foreground">
                    {new Date(meal.date).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "2-digit",
                    })}
                    <span className="hidden xs:inline text-muted-foreground/60">
                      {" · " + getShortenedDayOfWeek(new Date(meal.date))}
                    </span>
                  </span>
                </TableCell>

                {/* Note — secondary, muted */}
                <TableCell className="py-3 hidden md:table-cell">
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {meal.note || ""}
                  </span>
                </TableCell>

                {/* Edit — invisible until hover (signifier for clickability) */}
                <TableCell
                  className="py-3 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PencilIcon
                    className="h-3.5 w-3.5 cursor-pointer text-muted-foreground/0 group-hover:text-muted-foreground transition-colors ml-auto"
                    onClick={() => onRowClick(meal)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter className="sticky bottom-0 z-10 bg-muted/60 backdrop-blur-sm border-t border-border/60">
            <TableRow>
              <TableCell colSpan={2} className="py-2.5">
                <span className="text-xs text-muted-foreground font-medium">
                  {meals.length} meals
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell" />
              <TableCell colSpan={3} className="py-2.5 text-right">
                <span className="inline-flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
                    <MapPin className="h-3 w-3" />{outCount} out
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Home className="h-3 w-3" />{inCount} in
                  </span>
                </span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default MealTable; 