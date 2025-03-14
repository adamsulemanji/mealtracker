"use client";

import * as React from "react";
import axios from "axios";
import { MealForm } from "@/interfaces/MealForm";
import { MealFormProps } from "@/interfaces/MealFormProps";
import { DatePickerDemo } from "@/components/context/DatePicker";
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

const defaultMealData: MealForm = {
  mealName: "",
  mealType: "Breakfast",
  eatingOut: false,
  date: new Date(),
  note: "",
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
  onOpenChange 
}: ExtendedMealFormProps) {
  const [open, setOpen] = React.useState(isOpen || false);
  const [mealData, setMealData] = React.useState<MealForm>(
    meal ?? defaultMealData
  );

  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  React.useEffect(() => {
    // Update open state if controlled externally
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  React.useEffect(() => {
    // Whenever the `meal` prop changes (i.e., user clicked Edit on a different meal),
    // reset the internal form state to match that meal.
    // If there's no `meal`, reset to default (for Add New).
    setMealData(meal ?? defaultMealData);
  }, [meal]);

  const handleDateChange = (selectedDate: Date) => {
    setMealData((prev) => ({ ...prev, date: selectedDate }));
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleSubmit = async () => {
    try {
      if (meal && meal.mealID) {
        // Edit an existing meal
        await axios.put(`${apiURL}/meals/${meal.mealID}`, mealData);
        onSave(mealData);
      } else {
        // Create a new meal
        const response = await axios.post(`${apiURL}/meals`, mealData);
        const newMealData = { ...mealData, mealID: response.data.item.mealID };
        onSave(newMealData);
      }

      // Reset the form after saving
      setMealData(defaultMealData);
      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to create/update meal:", error);
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

      <DialogContent className="w-full max-w-lg mx-auto p-4 sm:p-6 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{meal ? "Edit Meal" : "New Meal"}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {meal
              ? "Make changes to your meal entry here. Click save when you're done."
              : "Fill in the details of your new meal. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>

        {/* Meal Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Meal Name</label>
          <Input
            value={mealData.mealName}
            onChange={(e) =>
              setMealData((prev) => ({ ...prev, mealName: e.target.value }))
            }
            placeholder="Enter meal name"
          />
        </div>

        {/* Meal Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Meal Type</label>
          <Select
            value={mealData.mealType}
            onValueChange={(value) =>
              setMealData((prev) => ({
                ...prev,
                mealType: value as "Breakfast" | "Lunch" | "Dinner",
              }))
            }
            
          >
            <SelectTrigger>
              <SelectValue placeholder="Select meal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Eating Out */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Eating Out</label>
          <Switch
            checked={mealData.eatingOut}
            onCheckedChange={(checked) =>
              setMealData((prev) => ({ ...prev, eatingOut: checked }))
            }
          />
        </div>

        {/* Note */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Note</label>
          <Input
            value={mealData.note}
            onChange={(e) =>
              setMealData((prev) => ({ ...prev, note: e.target.value }))
            }
            placeholder="Enter note"
            className="w-full"
          />
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Date</label>
          <DatePickerDemo
            onDateChange={handleDateChange}
            selectedDate={mealData.date}
            
          />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          {/* Save button */}
          <Button onClick={handleSubmit} variant="default" size="sm" className="w-full sm:w-auto">
            Save
          </Button>

          {/* Delete button (only when editing a meal) */}
          {meal && onDelete && (
            <Button
              onClick={handleDelete}
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
          )}

          <DialogClose asChild>
            <Button variant="default" size="sm" className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MealFormModal;
