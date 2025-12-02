"use client";

import { useState, useEffect } from "react";
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
  onOpenChange 
}: ExtendedMealFormProps) {
  const [open, setOpen] = useState(isOpen || false);
  const [mealData, setMealData] = useState<MealForm>(
    meal ?? defaultMealData
  );

  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Update open state if controlled externally
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
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
        
        // Standardized response format: { success: true, item: {...} }
        if (!response.data || !response.data.success || !response.data.item) {
          console.error("Unexpected API response format:", response.data);
          throw new Error("Invalid response format from API");
        }
        
        const newMealData = { ...mealData, mealID: response.data.item.mealID };
        onSave(newMealData);
      }

      // Reset the form after saving
      setMealData(defaultMealData);
      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to create/update meal:", error);
      // Show user-friendly error message
      if (error instanceof Error) {
        alert(`Failed to save meal: ${error.message}`);
      } else {
        alert("Failed to save meal. Please check your connection and try again.");
      }
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
            className="mt-2"
          />
        </div>

        {/* Meal Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Meal Type</label>
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
            className="mt-2"
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
            className="w-full mt-2"
          />
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tags</label>
          <TagInput
            tags={mealData.tags || []}
            onChange={(newTags) => setMealData((prev) => ({ ...prev, tags: newTags }))}
            placeholder="Add tags (press Enter)"
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

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-2 mt-4">
          <Button 
            onClick={handleSubmit} 
            variant="default" 
            size="sm" 
            className="w-full sm:w-auto font-medium order-1 sm:order-1"
          >
            Save
          </Button>
          
          {meal && onDelete && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
              className="w-full sm:w-auto order-2 sm:order-2"
            >
              Delete
            </Button>
          )}
          
          <DialogClose asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto order-3 sm:order-3">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MealFormModal;
