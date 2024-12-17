"use client";

import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { MealInfo } from "@/interfaces/MealInfo";
import { ModeToggle } from "@/components/Dark-LightModeToggle";
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
import MealForm from "@/components/MealForm";
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

export default function Home() {
	const [date, setDate] = useState<Date>();
	const [newMeal, setNewMeal] = useState(false);
	const [meals, setMeals] = useState<MealInfo[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();
	type ChartView = "last7Days" | "currentMonth" | "allTimebyMonth" | "allTimebyDay";
	const [chartView, setChartView] = useState<ChartView>("currentMonth");
	const [selectedMeal, setSelectedMeal] = useState<MealInfo | null>(null);
	const [phrase, setPhrase]	= useState<string>("");

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

	const getAllTimeDataByMonth = (meals: MealInfo[]) => {
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

	const getAllTimeDatabyDay = (meals: MealInfo[]) => {
		const allTime = meals.reduce((acc, meal) => {
			const mealDate = new Date(meal.date);
			const day = mealDate.getDate();
			const month = mealDate.toLocaleString("default", { month: "short" });
			const year = mealDate.getFullYear().toString().slice(-2);
			const key = `${month} ${day} '${year}`;

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
			const sortedMeals = response.data.sort(
				(a: MealInfo, b: MealInfo) => {
					const dateA = new Date(a.date).getTime();
					const dateB = new Date(b.date).getTime();
					if (dateA === dateB) {
						const mealOrder = ["Breakfast", "Lunch", "Dinner"];
						return (
							mealOrder.indexOf(a.mealType) -
							mealOrder.indexOf(b.mealType)
						);
					}
					return dateA - dateB;
				}
			);
			setMeals(sortedMeals.reverse());
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

	const handleSaveMeal = (updatedMeal: MealInfo) => {
		setMeals((prevMeals) =>
			prevMeals.map((meal) =>
				meal.mealID === updatedMeal.mealID ? updatedMeal : meal
			)
		);
		setSelectedMeal(null);
	};

	useEffect(() => {
		getAddMeals();
		getRandomPhrase();
	}, []);

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
		switch (chartView) {
			case "last7Days":
				return "Last 7 Days";
			case "currentMonth":
				return "Current Month";
			case "allTimebyMonth":
				return "All Time By Month";
			case "allTimebyDay":
				return "All Time By Day";
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
				return (
					mealOrder.indexOf(a.mealType) -
					mealOrder.indexOf(b.mealType)
				);
			}
			return dateA - dateB;
		});
		setMeals(sortedMeals);
	};

	const getShortenedDayOfWeek = (date: Date) => {
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		return days[date.getDay()];
	};

	const getRandomPhrase = () => {
		const randomIndex = Math.floor(Math.random() * phrases.length);
		setPhrase(phrases[randomIndex]);
	};

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left">
					Welcome Nikki to your Meal Tracker!
				</h1>
				<h6 className="text-center sm:text-sm"> {phrase} </h6>
				<Separator className="dark:bg-gray-700" />

				<br />
				{meals.length === 0 ? (
					<div className="text-center text-gray-500">
						No meals available
					</div>
				) : (
					<div className="flex flex-col sm:flex-row gap-8 w-full">
						<div className="min-h-[200px] w-full sm:w-1/2">
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
						<div className="w-full sm:w-1/2">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead >
											Meal Name
										</TableHead>
										<TableHead>
											Meal Type
										</TableHead>
										<TableHead>
											Eating Out
										</TableHead>
										<TableHead >
											Date
										</TableHead>
										<TableHead>
											Note
										</TableHead>
										<TableHead>
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
							</Table>
							<ScrollArea className="h-96">
								<Table>
									<TableBody>
										{meals.map((meal) => (
											<TableRow
												key={meal.mealID}
											>
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
													}) +
														" - " +
														getShortenedDayOfWeek(
															new Date(meal.date)
														)}
												</TableCell>
												<TableCell>{meal.note || ""}</TableCell>
												<TableCell>
													<MealForm
														meal={meal}
														onSave={handleSaveMeal}
														onDelete={deleteMeal}
													/>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</ScrollArea>
							<Table>
								<TableFooter>
									<TableRow>
										<TableCell
											colSpan={5}
										>
											Total Eaten Out vs In
										</TableCell>
										<TableCell>
											{meals.filter((meal) => meal.eatingOut)
												.length +
												" - " +
												meals.filter(
													(meal) => !meal.eatingOut
												).length}
										</TableCell>
									</TableRow>
								</TableFooter>
							</Table>
						</div>
					</div>
				)}
				<div className="flex gap-4">
					<Button onClick={() => setChartView("last7Days")}>
						Last 7 Days
					</Button>
					<Button onClick={() => setChartView("currentMonth")}>
						Current Month
					</Button>
					<Button onClick={() => setChartView("allTimebyMonth")}>
						All Time by Month
					</Button>
					<Button onClick={() => setChartView("allTimebyDay")}>
						All Time by Day
					</Button>
				</div>
				<Separator className="dark:bg-gray-700" />
				<div className="flex gap-4 items-center flex-col sm:flex-row">
					<MealForm onSave={handleAddMeal} />
					{ <ModeToggle />}
				</div>
			</main>

			<footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center dark:bg-gray-900 dark:text-gray-300">
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
