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

interface MealFormProps {
	meal?: MealInfo;
	onSave: (meal: MealInfo) => void;
	onDelete?: (mealID: string) => void;
}

function MealForm({ meal, onSave, onDelete }: MealFormProps) {
	const [open, setOpen] = React.useState(false);
	const [mealData, setMealData] = React.useState<MealInfo>(
		meal || {
			mealName: "",
			mealType: "Breakfast",
			eatingOut: false,
			date: new Date(),
			note: "",
		}
	);

	const handleDateChange = (selectedDate: Date) => {
		setMealData((prevMeal) => ({ ...prevMeal, date: selectedDate }));
	};

	const handleSubmit = async () => {
		try {
			if (meal) {
				await axios.put(
					`https://fzyeqnxwpg.execute-api.us-east-1.amazonaws.com/prod/meals/${mealData.mealID}`,
					mealData
				);
			} else {
				const response = await axios.post(
					"https://fzyeqnxwpg.execute-api.us-east-1.amazonaws.com/prod/meals",
					mealData
				);
				setMealData((prevMeal) => ({
					...prevMeal,
					mealID: response.data.mealID,
				}));
			}
			onSave(mealData);
			setMealData({
				mealName: "",
				mealType: "Breakfast",
				eatingOut: false,
				date: new Date(),
				note: "",
			});
			setOpen(false);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="default">
					{meal ? "Edit" : "Add New Meal"}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{meal ? "Edit Meal" : "New Meal"}</DialogTitle>
					<DialogDescription>
						{meal
							? "Make changes to your meal entry here. Click save when you're done."
							: "Fill in the details of your new meal. Click save when you're done."}
					</DialogDescription>
				</DialogHeader>
				<div className="mb-4">
					<label className="block text-sm font-medium">
						Meal Name
					</label>
					<Input
						value={mealData.mealName}
						onChange={(e) =>
							setMealData((prevMeal) => ({
								...prevMeal,
								mealName: e.target.value,
							}))
						}
						placeholder="Enter meal name"
					/>
				</div>
				<div className="mb-4">
					<label className="block text-sm font-medium">
						Meal Type
					</label>
					<Select
						value={mealData.mealType}
						onValueChange={(value) =>
							setMealData((prevMeal) => ({
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
					<label className="block text-sm font-medium">
						Eating Out
					</label>
					<Switch
						checked={mealData.eatingOut}
						onCheckedChange={(checked) =>
							setMealData((prevMeal) => ({
								...prevMeal,
								eatingOut: checked,
							}))
						}
					/>
				</div>
				<div className="mb-4">
					<label className="block text-sm font-medium">
						Note
					</label>
					<Input
						value={mealData.note}
						onChange={(e) =>
							setMealData((prevMeal) => ({
								...prevMeal,
								note: e.target.value,
							}))
						}
						placeholder="Enter note"
					/>
				</div>
				<div className="mb-4">
					<label className="block text-sm font-medium">
						Date
					</label>
					<DatePickerDemo
						onDateChange={handleDateChange}
						selectedDate={mealData.date}
					/>
				</div>
				<DialogFooter>
					<Button
						onClick={handleSubmit}
						variant="default"
						size="sm"
						
					>
						Save
					</Button>
					{meal && onDelete && (
						<Button
							onClick={() => onDelete(mealData.mealID!)}
							variant="secondary"
							size="sm"
							
						>
							Delete
						</Button>
					)}
					<DialogClose asChild>
						<Button
							variant="default"
							size="sm"
						>
							Cancel
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default MealForm;