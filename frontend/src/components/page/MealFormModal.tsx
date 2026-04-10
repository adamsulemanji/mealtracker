"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { MealForm } from "@/interfaces/MealForm";
import { MealFormProps } from "@/interfaces/MealFormProps";
import { DatePickerDemo } from "@/components/page/DatePicker";
import { TagInput } from "@/components/ui/tag-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const defaultMealData: MealForm = {
  mealName: "",
  mealType: "Breakfast",
  eatingOut: false,
  date: new Date(),
  note: "",
  tags: [],
};

interface ExtendedMealFormProps extends MealFormProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function MealFormModal({
  meal,
  onSave,
  onDelete,
  isOpen,
  onOpenChange,
}: ExtendedMealFormProps) {
  const [open, setOpen] = useState(isOpen || false);
  const [mealData, setMealData] = useState<MealForm>(meal ?? defaultMealData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (isOpen !== undefined) setOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    setMealData(meal ?? defaultMealData);
  }, [meal]);

  const handleDateChange = (selectedDate: Date) => {
    setMealData((prev) => ({ ...prev, date: selectedDate }));
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (meal && meal.mealID) {
        await axios.put(`${apiURL}/meals/${meal.mealID}`, mealData);
        onSave(mealData);
      } else {
        const response = await axios.post(`${apiURL}/meals`, mealData);

        if (!response.data || !response.data.success || !response.data.item) {
          console.error("Unexpected API response format:", response.data);
          throw new Error("Invalid response format from API");
        }

        const newMealData = { ...mealData, mealID: response.data.item.mealID };
        onSave(newMealData);
      }

      setMealData(defaultMealData);
      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to create/update meal:", error);
      if (error instanceof Error) {
        alert(`Failed to save meal: ${error.message}`);
      } else {
        alert("Failed to save meal. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!mealData.mealID || !onDelete) return;
    onDelete(mealData.mealID);
    setMealData(defaultMealData);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isOpen && (
        <DialogTrigger asChild>
          <Button variant="default">{meal ? "Edit" : "Add New Meal"}</Button>
        </DialogTrigger>
      )}

      <DialogContent className="w-full max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold">
            {meal ? "Edit Meal" : "Log a Meal"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {meal ? "Update the details below." : "What did you eat?"}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Form body */}
        <div className="px-6 py-5 space-y-5">
          {/* Meal Name */}
          <div className="space-y-1.5">
            <label htmlFor="mealName" className="text-sm font-medium">
              Meal Name
            </label>
            <Input
              id="mealName"
              value={mealData.mealName}
              onChange={(e) =>
                setMealData((prev) => ({ ...prev, mealName: e.target.value }))
              }
              placeholder="e.g. Grilled salmon, Tacos..."
              className="h-9"
              autoFocus
            />
          </div>

          {/* Meal Type + Date — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={mealData.mealType}
                onValueChange={(value) =>
                  setMealData((prev) => ({
                    ...prev,
                    mealType: value as "Breakfast" | "Lunch" | "Dinner",
                  }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date</label>
              <DatePickerDemo
                onDateChange={handleDateChange}
                selectedDate={mealData.date}
              />
            </div>
          </div>

          {/* Eating Out toggle */}
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Eating Out</p>
              <p className="text-xs text-muted-foreground">
                {mealData.eatingOut ? "At a restaurant or outside" : "Cooked or eaten at home"}
              </p>
            </div>
            <Switch
              checked={mealData.eatingOut}
              onCheckedChange={(checked) =>
                setMealData((prev) => ({ ...prev, eatingOut: checked }))
              }
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label htmlFor="note" className="text-sm font-medium">
              Note{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              id="note"
              value={mealData.note}
              onChange={(e) =>
                setMealData((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder="Any thoughts about this meal..."
              className="h-9"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Tags{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <TagInput
              tags={mealData.tags || []}
              onChange={(newTags) =>
                setMealData((prev) => ({ ...prev, tags: newTags }))
              }
              placeholder="Add tag, press Enter..."
            />
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <DialogFooter className="px-6 py-4 flex flex-row items-center gap-2">
          {/* Delete on the far left */}
          {meal && onDelete && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
              className="mr-auto"
            >
              Delete
            </Button>
          )}

          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </DialogClose>

          <Button onClick={handleSubmit} size="sm" className="min-w-[72px]" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MealFormModal;
