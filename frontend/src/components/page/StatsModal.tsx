"use client";

import * as React from "react";
import { MealForm } from "@/interfaces/MealForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, BarChart2, Calendar, Utensils, MapPin } from "lucide-react";

interface StatsModalProps {
  meals: MealForm[];
  currentStreak: number;
  maxStreak: number;
}

export default function StatsModal({ meals, currentStreak, maxStreak }: StatsModalProps) {
  const [open, setOpen] = React.useState(false);

  // Calculate statistics
  const totalMeals = meals.length;
  const totalDays = new Set(meals.map(meal => new Date(meal.date).toDateString())).size;
  
  // Calculate most common meal
  const mealCounts: Record<string, number> = {};
  meals.forEach(meal => {
    mealCounts[meal.mealName] = (mealCounts[meal.mealName] || 0) + 1;
  });
  
  let mostCommonMeal = { name: "", count: 0 };
  Object.entries(mealCounts).forEach(([name, count]) => {
    if (count > mostCommonMeal.count) {
      mostCommonMeal = { name, count };
    }
  });

  // Calculate eating out percentage
  const eatingOutCount = meals.filter(meal => meal.eatingOut).length;
  const eatingOutPercentage = totalMeals > 0 ? Math.round((eatingOutCount / totalMeals) * 100) : 0;
  
  // Calculate meal type distribution
  const mealTypes: Record<string, number> = {
    "Breakfast": 0,
    "Lunch": 0,
    "Dinner": 0
  };
  
  meals.forEach(meal => {
    mealTypes[meal.mealType] = (mealTypes[meal.mealType] || 0) + 1;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BarChart2 className="h-4 w-4" />
          <span>Stats</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Your Meal Stats</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* Streak Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Streak Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Streak:</span>
                  <span className="font-bold">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longest Streak:</span>
                  <span className="font-bold">{maxStreak} day{maxStreak !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Days Logged:</span>
                  <span className="font-bold">{totalDays}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Meal Summary Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center gap-2">
                <Utensils className="h-4 w-4" /> Meal Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Meals:</span>
                  <span className="font-bold">{totalMeals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Most Common:</span>
                  <span className="font-bold">{mostCommonMeal.name || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Meals/Day:</span>
                  <span className="font-bold">{totalDays > 0 ? (totalMeals / totalDays).toFixed(1) : 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Eating Out Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Eating Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Eating Out:</span>
                  <span className="font-bold">{eatingOutPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meals Out:</span>
                  <span className="font-bold">{eatingOutCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meals at Home:</span>
                  <span className="font-bold">{totalMeals - eatingOutCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Meal Type Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center gap-2">
                <InfoIcon className="h-4 w-4" /> Meal Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Breakfast:</span>
                  <span className="font-bold">{mealTypes["Breakfast"] || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lunch:</span>
                  <span className="font-bold">{mealTypes["Lunch"] || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dinner:</span>
                  <span className="font-bold">{mealTypes["Dinner"] || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 