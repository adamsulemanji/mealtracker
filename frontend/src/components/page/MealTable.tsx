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
import { PencilIcon } from "lucide-react";

interface MealTableProps {
  meals: MealForm[];
  onRowClick: (meal: MealForm) => void;
  getShortenedDayOfWeek: (date: Date) => string;
  onSave: (meal: MealForm) => void;
  onDelete: (mealID: string) => void;
}

const MealTable: React.FC<MealTableProps> = ({
  meals,
  onRowClick,
  getShortenedDayOfWeek,
  onSave,
  onDelete,
}) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-2">Meal History</h3>
      <ScrollArea className="h-[400px] lg:h-[450px] w-full border rounded-md">
        <Table className="w-full">
          <TableHeader className="sticky top-0 dark:bg-gray-800 bg-gray-100 z-10">
            <TableRow>
              <TableHead>Meal</TableHead>
              <TableHead className="table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Out?</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="hidden md:table-cell">Note</TableHead>
              <TableHead className="w-[60px]">Edit</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {meals.map((meal) => (
              <TableRow 
                key={meal.mealID} 
                onClick={() => onRowClick(meal)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  {meal.mealName}
                  {meal.tags && meal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {meal.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell className="table-cell">
                  {meal.mealType}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {meal.eatingOut ? "Yes" : "No"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="hidden xs:inline">
                    {new Date(meal.date).toLocaleDateString(
                      "en-US",
                      {
                        year: "2-digit",
                        month: "2-digit",
                        day: "2-digit",
                      }
                    )}
                  </span>
                  <span className="xs:hidden">
                    {new Date(meal.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "numeric",
                        day: "numeric",
                        year:"numeric",
                      }
                    )}
                  </span>
                  <span className="hidden xs:inline">
                    {" - " + getShortenedDayOfWeek(new Date(meal.date))}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {meal.note || ""}
                </TableCell>
                <TableCell 
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PencilIcon 
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                    onClick={() => onRowClick(meal)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter className="sticky bottom-0 z-10 dark:bg-gray-800 bg-gray-100">
            <TableRow>
              <TableCell
                colSpan={2}
                className="font-medium"
              >
                Out vs In
              </TableCell>
              <TableCell className="hidden sm:table-cell" />
              <TableCell colSpan={3} className="text-right">
                {meals.filter((m) => m.eatingOut).length}{" "}
                vs{" "}
                {meals.filter((m) => !m.eatingOut).length}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default MealTable; 