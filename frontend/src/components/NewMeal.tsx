"use client"

import * as React from "react"
import { DatePickerDemo } from "./DatePicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function NewMeal() {
  const [mealName, setMealName] = React.useState("")
  const [mealType, setMealType] = React.useState("breakfast")
  const [eatingOut, setEatingOut] = React.useState(false)
  const [date, setDate] = React.useState<Date>()

  const handleDateChange = (selectedDate: Date) => {
    setDate(selectedDate)
  }

  const handleSubmit = () => {
    console.log({
      mealName,
      mealType,
      eatingOut,
      date,
    })
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">New Meal</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Meal Name</label>
          <Input value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="Enter meal name" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Meal Type</label>
          <Select value={mealType} onValueChange={setMealType}>
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
          <Switch checked={eatingOut} onCheckedChange={setEatingOut} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <DatePickerDemo onDateChange={handleDateChange} />
        </div>
        <Button onClick={handleSubmit}>Add Meal</Button>
      </div>
    </div>
  )
}
