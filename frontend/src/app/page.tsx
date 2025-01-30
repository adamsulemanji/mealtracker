"use client";

import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { MealForm } from "@/interfaces/MealForm";
import { ModeToggle } from "@/components/provider/Dark-LightModeToggle";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	ChartContainer,
	ChartTooltipContent,
	ChartTooltip,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Legend, CartesianGrid } from "recharts";
import MealFormModal from "@/components/context/MealFormModal";
import { type ChartConfig } from "@/components/ui/chart";
import { phrases } from "@/misc/phrases";

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

type ChartView =
	| "last7Days"
	| "currentMonth"
	| "allTimebyMonth"
	| "allTimebyDay";

export default function Home() {
	const [meals, setMeals] = useState<MealForm[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();
	const [chartView, setChartView] = useState<ChartView>("currentMonth");
	const [phrase, setPhrase] = useState<string>("");

	const apiURL = process.env.NEXT_PUBLIC_API_URL;

	function sortMeals(meals: MealForm[]): MealForm[] {
		const mealOrder = ["Breakfast", "Lunch", "Dinner"];
		return [...meals].sort((a, b) => {
			const dateA = new Date(a.date).getTime();
			const dateB = new Date(b.date).getTime();

			if (dateA === dateB) {
				return (
					mealOrder.indexOf(a.mealType) -
					mealOrder.indexOf(b.mealType)
				);
			}
			return dateA - dateB;
		});
	}

	// ----------------------
	// Chart Data Generators
	// ----------------------

	const getLast7DaysData = (meals: MealForm[]) => {
		const today = new Date();
		return Array.from({ length: 7 }, (_, i) => {
			const date = new Date(today);
			date.setDate(today.getDate() - i);
			const dateString = date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});

			const mealsOnDate = meals.filter((m) => {
				const mealDate = new Date(m.date).toDateString();
				return mealDate === date.toDateString();
			});

			const eatenOut = mealsOnDate.filter((m) => m.eatingOut).length;
			const notEatenOut = mealsOnDate.length - eatenOut;

			return { date: dateString, eatenOut, notEatenOut };
		}).reverse();
	};

	const getCurrentMonthData = (meals: MealForm[]) => {
		const today = new Date();
		return Array.from({ length: today.getDate() }, (_, i) => {
			const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
			const dateString = date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});

			const mealsOnDate = meals.filter((m) => {
				return new Date(m.date).toDateString() === date.toDateString();
			});

			const eatenOut = mealsOnDate.filter((m) => m.eatingOut).length;
			const notEatenOut = mealsOnDate.length - eatenOut;

			return { date: dateString, eatenOut, notEatenOut };
		});
	};

	const getAllTimeDataByMonth = (meals: MealForm[]) => {
		const mapObj = meals.reduce((acc, meal) => {
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

		return Object.values(mapObj).reverse();
	};

	const getAllTimeDatabyDay = (meals: MealForm[]) => {
		if (meals.length === 0) return [];

		const minDate = meals.reduce((earliest, meal) => {
			const mealTime = new Date(meal.date).getTime();
			return mealTime < earliest.getTime()
				? new Date(meal.date)
				: earliest;
		}, new Date(meals[0].date));

		const now = new Date();

		const dailyDataArray: {
			date: string;
			eatenOut: number;
			notEatenOut: number;
		}[] = [];
		const dateKeyToIndex: Record<string, number> = {};

		const pointer = new Date(minDate);

		let index = 0;
		while (pointer <= now) {
			const key = formatKey(pointer);

			dailyDataArray.push({ date: key, eatenOut: 0, notEatenOut: 0 });
			dateKeyToIndex[key] = index++;

			pointer.setDate(pointer.getDate() + 1);
		}

		meals.forEach((meal) => {
			const key = formatKey(new Date(meal.date));
			if (key in dateKeyToIndex) {
				const i = dateKeyToIndex[key];
				if (meal.eatingOut) {
					dailyDataArray[i].eatenOut += 1;
				} else {
					dailyDataArray[i].notEatenOut += 1;
				}
			}
		});

		return dailyDataArray;
	};

	const formatKey = (date: Date) => {
		const day = date.getDate();
		const month = date.toLocaleString("default", { month: "short" });
		return `${month} ${day}`;
	};

	// -------------
	// API Handlers
	// -------------

	async function fetchMeals() {
		try {
			setIsLoading(true);
			const response = await axios.get(`${apiURL}/meals`);
			const sortedMeals = sortMeals(response.data).reverse();
			setMeals(sortedMeals);
		} catch (error) {
			console.error(error);
			toast({
				title: "Error",
				description: "Failed to fetch meals",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}

	async function deleteMeal(mealID: string) {
		try {
			await axios.delete(`${apiURL}/meals/${mealID}`);
			setMeals((prev) => prev.filter((m) => m.mealID !== mealID));
		} catch (error) {
			console.error("Failed to delete meal:", error);
		}
		toast({
			title: "Meal deleted",
			description: "Meal deleted successfully",
			variant: "destructive",
		});
	}

	async function deleteAllMeals() {
		try {
			await axios.delete(`${apiURL}/meals`);
			setMeals([]);
		} catch (error) {
			console.error(error);
		}
		toast({
			title: "Uh oh, you've deleted all your meals!",
			description: "All meals deleted successfully",
			variant: "destructive",
		});
	}

	const handleSaveMeal = (updatedMeal: MealForm) => {
		setMeals((prevMeals) => {
			const exists = prevMeals.some(
				(m) => m.mealID === updatedMeal.mealID
			);
			let newMeals: MealForm[];
			if (exists) {
				newMeals = prevMeals.map((m) =>
					m.mealID === updatedMeal.mealID ? updatedMeal : m
				);
			} else {
				newMeals = [...prevMeals, updatedMeal];
			}
			return sortMeals(newMeals).reverse();
		});
		toast({
			title: "Success",
			description: "Meal saved successfully",
			variant: "default",
		});
	};

	// --------------
	// UI Helpers
	// --------------

	function getShortenedDayOfWeek(date: Date) {
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		return days[date.getDay()];
	}

	function getRandomPhrase() {
		const randomIndex = Math.floor(Math.random() * phrases.length);
		return phrases[randomIndex];
	}

	// --------------
	// Lifecycle
	// --------------

	useEffect(() => {
		fetchMeals();
		setPhrase(getRandomPhrase());
	}, []);

	// --------------
	// Chart logic
	// --------------

	const chartData = useMemo(() => {
		switch (chartView) {
			case "last7Days":
				return getLast7DaysData(meals);
			case "currentMonth":
				return getCurrentMonthData(meals);
			case "allTimebyMonth":
				return getAllTimeDataByMonth(meals);
			case "allTimebyDay":
				return getAllTimeDatabyDay(meals);
			default:
				return [];
		}
	}, [meals, chartView]);

	const chartTitle = useMemo(() => {
		const CurrentMonth = new Date().toLocaleString("default", {
			month: "long",
		});
		switch (chartView) {
			case "last7Days":
				return "Last 7 Days";
			case "currentMonth":
				return "Current Month - " + CurrentMonth;
			case "allTimebyMonth":
				return "All Time By Month";
			case "allTimebyDay":
				return "All Time By Day";
			default:
				return "";
		}
	}, [chartView]);

	// --------------
	// Render
	// --------------

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-4 sm:p-8 pb-20 gap-8 sm:gap-16 w-full">
			<main className="flex flex-col gap-4 sm:gap-8 row-start-2 items-center sm:items-start w-full max-w-7xl px-2">
				<h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
					Welcome Nikki to your Meal Tracker!
				</h1>
				<h6 className="text-center sm:text-sm">{phrase}</h6>

				<Separator className="dark:bg-gray-700" />

				{isLoading ? (
					<div className="text-center text-gray-500">
						Loading meals...
					</div>
				) : meals.length === 0 ? (
					<div className="text-center text-gray-500">
						No meals available
					</div>
				) : (
					<div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full">
						{/* CHART COLUMN */}
						<div className="min-h-[200px] w-full sm:w-3/4 md:w-1/2 mx-auto px-4">
							<h2 className="text-xl sm:text-2xl font-bold text-center">
								{chartTitle}
							</h2>
							<br />
							<ChartContainer
								config={chartConfig}
								className="min-h-[200px] w-full"
							>
								<BarChart data={chartData} width={0} height={0}>
									<XAxis dataKey="date" />
									<YAxis />
									<ChartTooltip
										content={
											<ChartTooltipContent
												labelFormatter={(label) =>
													`# of ${
														label === "eatenOut"
															? "Eaten Out Meals"
															: "Eaten Meals"
													}`
												}
											/>
										}
									/>
									<Legend />
									<CartesianGrid vertical={false} />
									<Bar
										dataKey="eatenOut"
										stackId="a"
										fill="#fbcfe8"
										radius={4}
										name="Eaten Out"
									/>
									<Bar
										dataKey="notEatenOut"
										stackId="a"
										fill="#f9a8d4"
										radius={4}
										name="Eaten In"
									/>
								</BarChart>
							</ChartContainer>
						</div>

						{/* TABLE COLUMN */}
						<div className="w-full sm:w-1/2 sm:mr-2">
							<ScrollArea className="h-64 sm:h-96 w-full">
								<Table className="w-full">
									<TableHeader className="sticky top-0 dark:bg-gray-700 bg-gray-200">
										<TableRow>
											<TableHead>Meal Name</TableHead>
											<TableHead className="min-w-[100px] md:min-w-[50px]">
												Meal Type
											</TableHead>
											<TableHead className="hidden md:table-cell min-w-[75px]">
												Eating Out
											</TableHead>
											<TableHead className="min-w-[125px] md:min-w-[75px]">
												Date
											</TableHead>
											<TableHead className="hidden md:table-cell min-w-[150px]">
												Note
											</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>

									<TableBody>
										{meals.map((meal) => (
											<TableRow key={meal.mealID}>
												<TableCell>
													{meal.mealName}
												</TableCell>
												<TableCell>
													{meal.mealType}
												</TableCell>
												<TableCell className="hidden md:table-cell">
													{meal.eatingOut
														? "Yes"
														: "No"}
												</TableCell>
												<TableCell>
													{new Date(
														meal.date
													).toLocaleDateString(
														"en-US",
														{
															year: "2-digit",
															month: "2-digit",
															day: "2-digit",
														}
													) +
														" - " +
														getShortenedDayOfWeek(
															new Date(meal.date)
														)}
												</TableCell>
												{/* Hide note column on smaller screens */}
												<TableCell className="hidden md:table-cell">
													{meal.note || ""}
												</TableCell>
												<TableCell>
													<MealFormModal
														meal={meal}
														onSave={handleSaveMeal}
														onDelete={deleteMeal}
													/>
												</TableCell>
											</TableRow>
										))}
									</TableBody>

									<TableFooter className="sticky bottom-0 z-10 dark:bg-gray-700 bg-gray-200">
										<TableRow>
											<TableCell
												colSpan={3}
												className="font-semibold"
											>
												Total Eaten Out vs In
											</TableCell>
											<TableCell className="hidden md:table-cell" />
											<TableCell className="hidden md:table-cell" />
											<TableCell className="text-right">
												{
													meals.filter(
														(m) => m.eatingOut
													).length
												}{" "}
												-{" "}
												{
													meals.filter(
														(m) => !m.eatingOut
													).length
												}
											</TableCell>
										</TableRow>
									</TableFooter>
								</Table>
							</ScrollArea>
						</div>
					</div>
				)}

				<div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 flex-wrap justify-center sm:justify-start w-full">
					<Button
						className="w-full sm:w-auto"
						onClick={() => setChartView("last7Days")}
					>
						Last 7 Days
					</Button>
					<Button
						className="w-full sm:w-auto"
						onClick={() => setChartView("currentMonth")}
					>
						Current Month
					</Button>
					<Button
						className="w-full sm:w-auto"
						onClick={() => setChartView("allTimebyMonth")}
					>
						All Time by Month
					</Button>
					<Button
						className="w-full sm:w-auto"
						onClick={() => setChartView("allTimebyDay")}
					>
						All Time by Day
					</Button>
				</div>
				<Separator className="dark:bg-gray-700" />

				<div className="flex gap-2 sm:gap-4 items-center flex-col sm:flex-row">
					<MealFormModal onSave={handleSaveMeal} />
					<ModeToggle />
				</div>
			</main>

			<footer className="row-start-3 flex gap-4 sm:gap-6 flex-wrap items-center justify-center  w-full">
				<a
					className="flex items-center gap-2"
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
					<p className="underline-offset-3 group relative inline-block underline underline-offset-1 decoration-gray-200">
						Made by Adam Sulemanji
						<span className="absolute bottom-0 left-0 mt-1 block h-[1px] w-0 bg-current transition-all duration-300 group-hover:w-full"></span>
					</p>
				</a>
			</footer>
		</div>
	);
}
