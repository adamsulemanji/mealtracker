"use client";

import * as React from "react";
import axios from "axios";
import { MealInfo } from "@/interfaces/MealInfo";
import { DatePickerDemo } from "@/components/DatePicker";
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

interface EditMealProps {
	meal: MealInfo;
	onSave: (updatedMeal: MealInfo) => void;
	onDelete: (mealID: string) => void;
}

export function EditMeal({ meal, onSave, onDelete }: EditMealProps) {
	const [selectedMeal, setSelectedMeal] = React.useState<MealInfo>(meal);

	const handleSaveMeal = async () => {
		try {
			await axios.put(
				`https://fzyeqnxwpg.execute-api.us-east-1.amazonaws.com/prod/meals/${selectedMeal.mealID}`,
				selectedMeal
			);
			onSave(selectedMeal);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Dialog open={true} onOpenChange={() => onSave(selectedMeal)}>
			<DialogTrigger asChild>
				<Button
					onClick={() => setSelectedMeal(meal)}
					variant="default"
					size="sm"
					className="dark:bg-gray-700 dark:text-gray-300"
				>
					Edit
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Meal</DialogTitle>
					<DialogDescription>
						Make changes to your meal entry here. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Meal Name
					</label>
					<Input
						value={selectedMeal.mealName}
						onChange={(e) =>
							setSelectedMeal({
								...selectedMeal,
								mealName: e.target.value,
							})
						}
						placeholder="Enter meal name"
					/>
				</div>
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Meal Type
					</label>
					<Select
						value={selectedMeal.mealType}
						onValueChange={(value) =>
							setSelectedMeal({
								...selectedMeal,
								mealType: value,
							})
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
						checked={selectedMeal.eatingOut}
						onCheckedChange={(checked) =>
							setSelectedMeal({
								...selectedMeal,
								eatingOut: checked,
							})
						}
					/>
				</div>
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Note
					</label>
					<Input
						value={selectedMeal.note}
						onChange={(e) =>
							setSelectedMeal({
								...selectedMeal,
								note: e.target.value,
							})
						}
						placeholder="Enter note"
					/>
				</div>
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Date
					</label>
					<DatePickerDemo
						onDateChange={(date) =>
							setSelectedMeal({
								...selectedMeal,
								date,
							})
						}
						selectedDate={selectedMeal.date}
					/>
				</div>
				<DialogFooter>
					<Button
						onClick={handleSaveMeal}
						variant="default"
						size="sm"
						className="dark:bg-gray-700 dark:text-gray-300"
					>
						Save
					</Button>
					<Button
						onClick={() => onDelete(selectedMeal.mealID!)}
						variant="destructive"
						size="sm"
						className="dark:bg-gray-700 dark:text-gray-300"
					>
						Delete
					</Button>
					<DialogClose asChild>
						<Button variant="default" size="sm" className="dark:bg-gray-700 dark:text-gray-300">
							Cancel
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
