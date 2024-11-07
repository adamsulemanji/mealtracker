"use client";

import Image from "next/image";
import React from "react";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { NewMeal } from "@/components/NewMeal";
import { useToast } from "@/hooks/use-toast";
import { MealInfo } from "@/components/NewMeal";

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
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Separator } from "@/components/ui/separator";
import {
	ChartContainer,
	ChartTooltipContent,
	ChartTooltip,
} from "@/components/ui/chart";

import { type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "#2563eb",
	},
	mobile: {
		label: "Mobile",
		color: "#60a5fa",
	},
} satisfies ChartConfig;

import { Bar, BarChart, XAxis, YAxis, Legend, CartesianGrid } from "recharts";

export default function Home() {
	const [date, setDate] = useState<Date>();
	const [newMeal, setNewMeal] = useState(false);
	const [meals, setMeals] = useState<MealInfo[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();
	type ChartView = "last7Days" | "currentMonth" | "allTime";
	const [chartView, setChartView] = useState<ChartView>("last7Days");

	const getLast7DaysData = (meals: MealInfo[]) => {
		const today = new Date();
		const last7Days = Array.from({ length: 7 }, (_, i) => {
			const date = new Date(today);
			date.setDate(today.getDate() - i);
			const dateString = date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});

			const mealsOnDate = meals.filter((meal) => {
				const mealDate = new Date(meal.date);
				return mealDate.toDateString() === date.toDateString();
			});

			const eatenOut = mealsOnDate.filter(
				(meal) => meal.eatingOut
			).length;
			const notEatenOut = mealsOnDate.length - eatenOut;

			return { date: dateString, eatenOut, notEatenOut };
		}).reverse();

		return last7Days;
	};

	const getCurrentMonthData = (meals: MealInfo[]) => {
		const today = new Date();
		const currentMonth = Array.from({ length: today.getDate() }, (_, i) => {
			const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
			const dateString = date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});

			const mealsOnDate = meals.filter((meal) => {
				const mealDate = new Date(meal.date);
				return mealDate.toDateString() === date.toDateString();
			});

			const eatenOut = mealsOnDate.filter(
				(meal) => meal.eatingOut
			).length;
			const notEatenOut = mealsOnDate.length - eatenOut;

			return { date: dateString, eatenOut, notEatenOut };
		});

		return currentMonth;
	};

	const getAllTimeData = (meals: MealInfo[]) => {
		const allTime = meals.reduce((acc, meal) => {
			const mealDate = new Date(meal.date);
			const month = mealDate.toLocaleString("default", { month: "long" });
			const year = mealDate.getFullYear();
			const key = `${month} ${year}`;

			if (!acc[key]) {
				acc[key] = { date: key, eatenOut: 0, notEatenOut: 0 };
			}

			if (meal.eatingOut) {
				acc[key].eatenOut += 1;
			} else {
				acc[key].notEatenOut += 1;
			}

			return acc;
		}, {} as Record<string, { date: string; eatenOut: number; notEatenOut: number }>);

		return Object.values(allTime);
	};

	const deleteAllMeals = async () => {
		try {
			await axios.delete(
				"https://fzyeqnxwpg.execute-api.us-east-1.amazonaws.com/prod/meals"
			);
			setMeals([]);
		} catch (error) {
      console.error(error);
		}
	};

	const getAddMeals = async () => {
		try {
			setIsLoading(true);
			const response = await axios.get(
				"https://fzyeqnxwpg.execute-api.us-east-1.amazonaws.com/prod/meals"
			);
			const sortedMeals = response.data.sort((a: MealInfo, b: MealInfo) => {
				const dateA = new Date(a.date).getTime();
				const dateB = new Date(b.date).getTime();
				if (dateA === dateB) {
					const mealOrder = ["Breakfast", "Lunch", "Dinner"];
					return mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType);
				}
				return dateA - dateB;
			});
			setMeals(sortedMeals);
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to fetch meals",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const deleteMeal = async (mealID: string) => {
		try {
			await axios.delete(
				`https://fzyeqnxwpg.execute-api.us-east-1.amazonaws.com/prod/meals/${mealID}`
			);
			setMeals((prevMeals) =>
				prevMeals.filter((meal) => meal.mealID !== mealID)
			);
		} catch (error) {
      console.error(error);
		}
	};

	useEffect(() => {
		getAddMeals();
	}, []);

	const chartData = useMemo(() => {
		switch (chartView) {
			case "last7Days":
				return getLast7DaysData(meals);
			case "currentMonth":
				return getCurrentMonthData(meals);
			case "allTime":
				return getAllTimeData(meals);
			default:
				return [];
		}
	}, [meals, chartView]);

	const chartTitle = useMemo(() => {
		switch (chartView) {
			case "last7Days":
				return "Last 7 Days";
			case "currentMonth":
				return "Current Month";
			case "allTime":
				return "All Time";
			default:
				return "";
		}
	}, [chartView]);

	const handleAddMeal = (newMeal: MealInfo) => {
		const sortedMeals = [...meals, newMeal].sort((a, b) => {
			const dateA = new Date(a.date).getTime();
			const dateB = new Date(b.date).getTime();
			if (dateA === dateB) {
				const mealOrder = ["Breakfast", "Lunch", "Dinner"];
				return mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType);
			}
			return dateA - dateB;
		});
		setMeals(sortedMeals);
	};

	const getShortenedDayOfWeek = (date: Date) => {
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		return days[date.getDay()];
	}

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left">
					Welcome Nikki to your Meal Tracker!
				</h1>
				<Separator />

				{isLoading ? (
					<div className="text-center">Loading meals...</div>
				) : meals.length === 0 ? (
					<div className="text-center text-gray-500">
						No meals available
					</div>
				) : (
					<div className="w-full overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Meal Name</TableHead>
									<TableHead>Meal Type</TableHead>
									<TableHead>Eating Out</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Note</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{meals.map((meal) => (
									<TableRow key={meal.mealID}>
										<TableCell>{meal.mealName}</TableCell>
										<TableCell>{meal.mealType}</TableCell>
										<TableCell>
											{meal.eatingOut ? "Yes" : "No"}
										</TableCell>
										<TableCell>
											{new Date(
												meal.date
											).toLocaleDateString("en-US", {
												year: "2-digit",
												month: "2-digit",
												day: "2-digit",
											}) + " - " + getShortenedDayOfWeek(new Date(meal.date))}
										</TableCell>
										<TableCell>{meal.note || ""}</TableCell>
										<TableCell>
											<Button
												onClick={() =>
													deleteMeal(meal.mealID!)
												}
												variant="outline"
												size="sm"
											>
												Delete
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
							<TableFooter>
								<TableRow>
									<TableCell colSpan={5}>
										Total Meals Tracked
									</TableCell>
									<TableCell className="text-right">
										{meals.length}
									</TableCell>
								</TableRow>
							</TableFooter>
						</Table>
					</div>
				)}

				<Separator />
				<br />
				{meals.length === 0 ? (
					<div className="text-center text-gray-500">
						No meals available
					</div>
				) : (
					<div className="min-h-[200px] w-full">
						<h2 className="text-2xl font-bold text-center">
							{chartTitle}
						</h2>
						<br />
						<ChartContainer
							config={chartConfig}
							className="min-h-[200px] w-full"
						>
							<BarChart data={chartData}>
								<XAxis dataKey="date" />
								<YAxis />
								<ChartTooltip
									content={<ChartTooltipContent />}
								/>
								<Legend />
								<CartesianGrid vertical={false} />
								<Bar
									dataKey="eatenOut"
									stackId="a"
									fill="#fbcfe8"
									radius={4}
								/>
								<Bar
									dataKey="notEatenOut"
									stackId="a"
									fill="#f9a8d4"
									radius={4}
								/>
							</BarChart>
						</ChartContainer>
					</div>
				)}
				<div className="flex gap-4">
					<Button onClick={() => setChartView("last7Days")}>
						Last 7 Days
					</Button>
					<Button onClick={() => setChartView("currentMonth")}>
						Current Month
					</Button>
					<Button onClick={() => setChartView("allTime")}>
						All Time
					</Button>
				</div>
				<Separator />
				<div className="flex gap-4 items-center flex-col sm:flex-row">
					<NewMeal onAddMeal={handleAddMeal} />
					{/* <AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive">
								Delete All Meals
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Are you absolutely sure?
								</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will
									permanently delete all your meals from our
									servers.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={deleteAllMeals}>
									Continue
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog> */}
				</div>
			</main>

			<footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://www.adamsulemanji.com"
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
					Made by Adam Sulemanji
				</a>
			</footer>
		</div>
	);
}
