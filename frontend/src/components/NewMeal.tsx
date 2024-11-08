"use client";

import * as React from "react";
import axios from "axios";

import { DatePickerDemo } from "./DatePicker";
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
	DialogTrigger,
} from "@/components/ui/dialog";

export interface MealInfo {
	mealID?: string;
	mealName: string;
	mealType: string;
	eatingOut: boolean;
	date: Date;
	note: string;
}

interface NewMealProps {
	onAddMeal: (meal: MealInfo) => void;
}

export function NewMeal({ onAddMeal }: NewMealProps) {
	const [open, setOpen] = React.useState(false);
	const [meal, setMeal] = React.useState<MealInfo>({
		mealName: "",
		mealType: "breakfast",
		eatingOut: false,
		date: new Date(),
		note: "",
	});

	const handleDateChange = (selectedDate: Date) => {
		setMeal((prevMeal) => ({ ...prevMeal, date: selectedDate }));
	};

	const handleSubmit = async () => {
		try {
			const response = await axios.post(
				"https://fzyeqnxwpg.execute-api.us-east-1.amazonaws.com/prod/meals",
				meal
			);
			onAddMeal(response.data);
			setOpen(false);
      		window.location.reload();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="default">Add New Meal</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New Meal</DialogTitle>
				</DialogHeader>
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Meal Name
					</label>
					<Input
						value={meal.mealName}
						onChange={(e) =>
							setMeal((prevMeal) => ({
								...prevMeal,
								mealName: e.target.value,
							}))
						}
						placeholder="Enter meal name"
					/>
				</div>
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Meal Type
					</label>
					<Select
						value={meal.mealType}
						onValueChange={(value) =>
							setMeal((prevMeal) => ({
								...prevMeal,
								mealType: value,
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
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Eating Out
					</label>
					<Switch
						checked={meal.eatingOut}
						onCheckedChange={(checked) =>
							setMeal((prevMeal) => ({
								...prevMeal,
								eatingOut: checked,
							}))
						}
					/>
				</div>
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Note
					</label>
					<Input
						value={meal.note}
						onChange={(e) =>
							setMeal((prevMeal) => ({
								...prevMeal,
								note: e.target.value,
							}))
						}
						placeholder="Enter note"
					/>
				</div>
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Date
					</label>
					<DatePickerDemo onDateChange={handleDateChange} />
				</div>
				<Button onClick={handleSubmit}>Add Meal</Button>
			</DialogContent>
		</Dialog>
	);
}
