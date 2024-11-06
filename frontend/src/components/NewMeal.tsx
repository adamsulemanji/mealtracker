"use client"

import * as React from "react"
import axios from "axios"

import { DatePickerDemo } from "./DatePicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface NewMealInfo {
  mealName: string
  mealType: string
  eatingOut: boolean
  date: Date
}


export function NewMeal() {
  const [meal, setMeal] = React.useState<NewMealInfo>({
    mealName: "",
    mealType: "breakfast",
    eatingOut: false,
    date: new Date(),
  });

  const handleDateChange = (selectedDate: Date) => {
    setMeal((prevMeal) => ({ ...prevMeal, date: selectedDate }))
  }

const { toast } = useToast();

const handleSubmit = () => {
    axios.post("https://fzyeqnxwpg.execute-api.us-east-1.amazonaws.com/prod/meals", meal)
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request."
              })
            console.error(error);
        });
}

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Meal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Meal</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Meal Name</label>
          <Input
            value={meal.mealName}
            onChange={(e) => setMeal((prevMeal) => ({ ...prevMeal, mealName: e.target.value }))}
            placeholder="Enter meal name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Meal Type</label>
          <Select
            value={meal.mealType}
            onValueChange={(value) => setMeal((prevMeal) => ({ ...prevMeal, mealType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select meal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Eating Out</label>
          <Switch
            checked={meal.eatingOut}
            onCheckedChange={(checked) => setMeal((prevMeal) => ({ ...prevMeal, eatingOut: checked }))}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <DatePickerDemo onDateChange={handleDateChange} />
        </div>
        <Button onClick={handleSubmit}>Add Meal</Button>
      </DialogContent>
    </Dialog>
  )
}
