"use client";

import Image from "next/image";
import React from "react";
import axios from "axios";

import { useState } from "react";
import { NewMeal } from "@/components/NewMeal";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Separator } from "@/components/ui/separator"

import { MealInfo } from "../components/NewMeal";

export default function Home() {
	const [date, setDate] = useState<Date>();
	const [newMeal, setNewMeal] = useState(false);
	const [meals, setMeals] = useState<MealInfo[]>([]);
	const { toast } = useToast();

	const handleDateChange = (date: Date) => {
		console.log("Date selected from page.tsx:", date);
		setDate(date);
	};

	const deleteAllMeals = () => {
		console.log("Deleting all meals");
		toast({
			title: "Deleted all meals",
			description: "You have successfully deleted all meals",
		});
	};

	const getAddMeals = async () => {
		axios
			.get(
				"https://fzyeqnxwpg.execute-api.us-east-1.amazonaws.com/prod/meals"
			)
			.then((response) => {
				console.log("Response from getAddMeals:", response.data);
				response.data.forEach((meal: MealInfo) => {
					setMeals((prevMeals) => [...prevMeals, meal]);
				});
			});
	};

	React.useEffect(() => {
		getAddMeals();
	}, []);

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left">
					Welcome Nikki to your Meal Tracker!
				</h1>
        <Separator />

        {meals.length === 0 ? (
          <p>No meals available</p>
        ) : (
          <Table>
            <TableCaption>Meals</TableCaption>
            <TableHead>
              <TableRow>
                <TableHeader>Meal Name</TableHeader>
                <TableHeader>Meal Type</TableHeader>
                <TableHeader>Eating Out</TableHeader>
                <TableHeader>Date</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {meals.map((meal: MealInfo, index: number) => (
                <TableRow key={index}>
                  <TableCell>{meal.mealName}</TableCell>
                  <TableCell>{meal.mealType}</TableCell>
                  <TableCell>{meal.eatingOut ? "Yes" : "No"}</TableCell>
                  <TableCell>{meal.date.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
				<div className="flex gap-4 items-center flex-col sm:flex-row"></div>
        <Separator />
				<div className="flex gap-4 items-center flex-col sm:flex-row">
					<NewMeal />
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button>Delete All Meals</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Are you absolutely sure?
								</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will
									permanently delete your account and remove
									your data from our servers.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={deleteAllMeals}>
									Continue
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</main>
			<footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="/file.svg"
						alt="File icon"
						width={16}
						height={16}
					/>
					Learn
				</a>
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="/window.svg"
						alt="Window icon"
						width={16}
						height={16}
					/>
					Examples
				</a>
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="/globe.svg"
						alt="Globe icon"
						width={16}
						height={16}
					/>
					Go to nextjs.org →
				</a>
			</footer>
		</div>
	);
}
