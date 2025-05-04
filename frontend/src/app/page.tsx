"use client";
import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
	Bar,
	BarChart,
	XAxis,
	YAxis,
	Legend,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { MealForm } from "@/interfaces/MealForm";
import { phrases } from "@/misc/phrases";
import { ModeToggle } from "@/components/provider/Dark-LightModeToggle";
import MealFormModal from "@/components/context/MealFormModal";
import {
	ChartContainer,
	ChartTooltipContent,
	ChartTooltip,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { X, FilterIcon, ChevronDown, Search } from "lucide-react";
import { type ChartConfig } from "@/components/ui/chart";
import { TagInput } from "@/components/ui/tag-input";

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
	| "allTimebyDay"
	| "rollingEatingOutPercentage";

export default function Home() {
	const [meals, setMeals] = useState<MealForm[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();
	const [chartView, setChartView] = useState<ChartView>("currentMonth");
	const [phrase, setPhrase] = useState<string>("");
	const [mealTypeFilter, setMealTypeFilter] = useState<string | null>(null);
	const [eatingOutFilter, setEatingOutFilter] = useState<boolean | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [editingMeal, setEditingMeal] = useState<MealForm | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
	const [lookbackPeriod, setLookbackPeriod] = useState<number>(30); // Default to 30 days lookback
	const [tagFilter, setTagFilter] = useState<string | null>(null);

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

	const rollingEatingOutPercentage = (meals: MealForm[]) => {
		const sortedMeals = [...meals].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);
		
		// Group meals by date to calculate daily values
		const mealsByDate: Record<string, { total: number, eatenOut: number }> = {};
		
		sortedMeals.forEach(meal => {
			const dateStr = new Date(meal.date).toISOString().split('T')[0];
			
			if (!mealsByDate[dateStr]) {
				mealsByDate[dateStr] = { total: 0, eatenOut: 0 };
			}
			
			mealsByDate[dateStr].total += 1;
			if (meal.eatingOut) mealsByDate[dateStr].eatenOut += 1;
		});
		
		// Convert to array of dates with rolling calculations
		const dates = Object.keys(mealsByDate).sort();
		const result = [];
		
		if (dates.length === 0) return [];
		
		for (let i = 0; i < dates.length; i++) {
			const currentDate = dates[i];
			let periodStartIdx = 0; // Default to first date for "All Time"
			
			// Find the start index for our lookback period
			if (lookbackPeriod > 0) {
				const currentDateTime = new Date(currentDate).getTime();
				const lookbackTime = currentDateTime - (lookbackPeriod * 24 * 60 * 60 * 1000);
				
				// Find the earliest date that falls within our lookback period
				periodStartIdx = i; // Start from current date and go back
				while (periodStartIdx > 0 && new Date(dates[periodStartIdx - 1]).getTime() >= lookbackTime) {
					periodStartIdx--;
				}
			}
			
			// Calculate totals for the period
			let periodTotal = 0;
			let periodEatenOut = 0;
			
			for (let j = periodStartIdx; j <= i; j++) {
				periodTotal += mealsByDate[dates[j]].total;
				periodEatenOut += mealsByDate[dates[j]].eatenOut;
			}
			
			const percentage = periodTotal > 0 ? (periodEatenOut / periodTotal) * 100 : 0;
			
			result.push({
				date: new Date(currentDate).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				eatenOutPercentage: percentage,
			});
		}
		
		return result;
	};

	// -------------
	// API Handlers
	// -------------

	async function fetchMeals() {
		try {
			setIsLoading(true);
			const response = await axios.get(`${apiURL}/meals`);
			const mealsData = response.data.items;
			const sortedMeals = sortMeals(mealsData).reverse();
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
		setEditingMeal(null);
		setIsEditModalOpen(false);
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

	const handleRowClick = (meal: MealForm) => {
		setEditingMeal(meal);
		setIsEditModalOpen(true);
	};

	// --------------
	// Lifecycle
	// --------------

	useEffect(() => {
		fetchMeals();
		setPhrase(getRandomPhrase());
	}, []);

	// --------------
	// Search & Filter Logic
	// --------------

	const filteredMeals = useMemo(() => {
		return meals.filter((m) => {
			// Apply type filter
			const passesMealType = mealTypeFilter ? m.mealType === mealTypeFilter : true;
			
			// Apply eating out filter
			const passesEatingOut = eatingOutFilter !== null ? m.eatingOut === eatingOutFilter : true;
			
			// Apply tag filter
			const passesTagFilter = tagFilter ? m.tags.includes(tagFilter) : true;
			
			// Apply search query
			const query = searchQuery.toLowerCase().trim();
			if (!query) {
				return passesMealType && passesEatingOut && passesTagFilter;
			}
			
			// Check if the query matches any of the meal properties
			const mealDate = new Date(m.date).toLocaleDateString().toLowerCase();
			const isEatingOutMatch = 
				query === "out" ? m.eatingOut : 
				query === "in" ? !m.eatingOut : false;
			
			// Check if query matches any tags
			const hasMatchingTag = m.tags && m.tags.some(tag => 
				tag.toLowerCase().includes(query)
			);
			
			return (
				passesMealType && 
				passesEatingOut && 
				passesTagFilter &&
				(m.mealName.toLowerCase().includes(query) ||
				m.mealType.toLowerCase().includes(query) ||
				mealDate.includes(query) ||
				(m.note && m.note.toLowerCase().includes(query)) ||
				hasMatchingTag ||
				isEatingOutMatch)
			);
		});
	}, [meals, mealTypeFilter, eatingOutFilter, tagFilter, searchQuery]);

	// --------------
	// Chart logic
	// --------------

	const chartData = useMemo(() => {
		switch (chartView) {
			case "last7Days":
				return getLast7DaysData(filteredMeals);
			case "currentMonth":
				return getCurrentMonthData(filteredMeals);
			case "allTimebyMonth":
				return getAllTimeDataByMonth(filteredMeals);
			case "allTimebyDay":
				return getAllTimeDatabyDay(filteredMeals);
			case "rollingEatingOutPercentage":
				return rollingEatingOutPercentage(filteredMeals);
			default:
				return [];
		}
	}, [filteredMeals, chartView, lookbackPeriod]);

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
			case "rollingEatingOutPercentage":
				return lookbackPeriod > 0 
					? `Rolling Eating Out Percentage (${lookbackPeriod} Day${lookbackPeriod !== 1 ? 's' : ''})` 
					: "Rolling Eating Out Percentage (All Time)";
			default:
				return "";
		}
	}, [chartView, lookbackPeriod]);

	// --------------
	// Render
	// --------------

	return (
		<div className="flex flex-col min-h-screen p-4 sm:p-6 md:p-8 w-full">
			<main className="flex flex-col flex-1 gap-4 sm:gap-6 md:gap-8 items-center w-full max-w-7xl mx-auto">
				{/* Header Section */}
				<div className="w-full text-center sm:text-left">
					<h1 className="text-3xl sm:text-4xl md:text-6xl font-bold">
						Hi Nikki
					</h1>
					<h2 className="text-base sm:text-lg md:text-xl mt-2">
						Welcome to your meal tracker
					</h2>
					<p className="text-sm text-muted-foreground mt-2">{phrase}</p>
				</div>

				<Separator className="dark:bg-gray-700 my-2" />

				{/* Main Content */}
				{isLoading ? (
					<div className="flex items-center justify-center w-full py-12">
						<div className="text-center text-gray-500">
							Loading meals...
						</div>
					</div>
				) : meals.length === 0 ? (
					<div className="flex items-center justify-center w-full py-12">
						<div className="text-center text-gray-500">
							No meals available
						</div>
					</div>
				) : (
					<div className="flex flex-col w-full gap-6 md:gap-8">
						{/* Search and Controls */}
						

						{/* Chart and Table Section - Side by side on larger screens */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Chart Section */}
							<div className="w-full">
								<h2 className="text-xl sm:text-2xl font-bold text-center mb-4">
									{chartTitle}
								</h2>
								
								{/* Lookback Period Input - show only for rolling percentage */}
								{chartView === "rollingEatingOutPercentage" && (
									<div className="flex items-center justify-center gap-2 mb-4">
										<label htmlFor="lookbackPeriod" className="text-sm">
											Lookback Period:
										</label>
										<div className="flex items-center gap-1">
											<Input
												id="lookbackPeriod"
												type="number"
												min="0"
												max="365"
												value={lookbackPeriod}
												onChange={(e) => setLookbackPeriod(Math.max(0, parseInt(e.target.value) || 0))}
												className="w-20 h-8 text-center"
											/>
											<span className="text-sm">days</span>
											<Button 
												variant="outline" 
												size="sm"
												className="h-8 px-2 ml-1"
												onClick={() => setLookbackPeriod(0)}
											>
												All Time
											</Button>
										</div>
									</div>
								)}
								
								<div className="h-[300px] sm:h-[350px] w-full px-2">
									<ChartContainer
										config={chartConfig}
										className="w-full h-full"
									>
										<ResponsiveContainer width="100%" height="100%">
											{chartView === "rollingEatingOutPercentage" ? (
												<LineChart data={chartData}>
													<XAxis 
														dataKey="date" 
														tick={{ fontSize: 10 }}
														interval="preserveStartEnd"
														tickMargin={5}
													/>
													<YAxis
														label={{
															value: `Percentage`,
															style: { textAnchor: "middle" },
															angle: -90,
															position: "left",
															offset: 0,
														}}
														tick={{ fontSize: 10 }}
														width={45}
													/>
													<ChartTooltip
														content={({
															active,
															payload,
															label,
														}) => {
															if (
																active &&
																payload &&
																payload.length
															) {
																return (
																	<div className="p-2 border rounded bg-white dark:bg-[#1B1D17]">
																		<p className="font-bold m-0">{label}</p>
																		<p className="m-0">
																			Eating Out Percentage:{" "}
																			{typeof payload[0]?.value === "number"
																				? payload[0]?.value.toFixed(2)
																				: "0"}
																			%
																		</p>
																	</div>
																);
															}
															return null;
														}}
													/>
													
													<Legend />
													<CartesianGrid vertical={false} />
													<Line
														dataKey="eatenOutPercentage"
														stroke="#f9a8d4"
														strokeWidth={2}
														dot={false}
														activeDot={{ r: 5 }}
														name="Eating Out Percentage"
													/>
												</LineChart>
											) : (
												<BarChart data={chartData}>
													<XAxis 
														dataKey="date" 
														tick={{ fontSize: 10 }}
														interval="preserveStartEnd"
														tickMargin={5}
													/>
													<YAxis tick={{ fontSize: 10 }} width={30} />
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
													<Legend wrapperStyle={{ fontSize: '12px' }} />
													<CartesianGrid vertical={false} />
													<Bar
														dataKey="eatenOut"
														stackId="a"
														fill="#fbcfe8"
														radius={[4, 4, 0, 0]}
														name="Eaten Out"
													/>
													<Bar
														dataKey="notEatenOut"
														stackId="a"
														fill="#f9a8d4"
														radius={[4, 4, 0, 0]}
														name="Eaten In"
													/>
												</BarChart>
											)}
										</ResponsiveContainer>
									</ChartContainer>
								</div>
								
								{/* Chart Buttons */}
								<div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full mt-4">
									<Button
										size="sm"
										variant={chartView === "last7Days" ? "default" : "outline"}
										className="text-xs sm:text-sm"
										onClick={() => setChartView("last7Days")}
									>
										Last 7 Days
									</Button>
									<Button
										size="sm"
										variant={chartView === "currentMonth" ? "default" : "outline"}
										className="text-xs sm:text-sm"
										onClick={() => setChartView("currentMonth")}
									>
										Current Month
									</Button>
									<Button
										size="sm"
										variant={chartView === "allTimebyMonth" ? "default" : "outline"}
										className="text-xs sm:text-sm"
										onClick={() => setChartView("allTimebyMonth")}
									>
										All Time by Month
									</Button>
									<Button
										size="sm"
										variant={chartView === "allTimebyDay" ? "default" : "outline"}
										className="text-xs sm:text-sm"
										onClick={() => setChartView("allTimebyDay")}
									>
										All Time by Day
									</Button>
									<Button
										size="sm"
										variant={chartView === "rollingEatingOutPercentage" ? "default" : "outline"}
										className="text-xs sm:text-sm col-span-2 sm:col-span-1"
										onClick={() =>
											setChartView("rollingEatingOutPercentage")
										}
									>
										Rolling %
									</Button>
								</div>
							</div>

							{/* Table Section */}
							<div className="w-full">
								<h3 className="text-lg font-medium mb-2">Meal History</h3>
								<ScrollArea className="h-[400px] lg:h-[450px] w-full border rounded-md">
									<Table className="w-full">
										<TableHeader className="sticky top-0 dark:bg-gray-800 bg-gray-100 z-10">
											<TableRow>
												<TableHead>Meal</TableHead>
												<TableHead className="table-cell">Type</TableHead>
												<TableHead className="hidden sm:table-cell">Out?</TableHead>
												<TableHead>Date</TableHead>
												<TableHead className="hidden md:table-cell">Note</TableHead>
												<TableHead className="w-[60px]">Act.</TableHead>
											</TableRow>
										</TableHeader>

										<TableBody>
											{filteredMeals.map((meal) => (
												<TableRow 
													key={meal.mealID} 
													onClick={() => handleRowClick(meal)}
													className="cursor-pointer hover:bg-muted/50"
												>
													<TableCell className="font-medium">
														{meal.mealName}
														{meal.tags && meal.tags.length > 0 && (
															<div className="flex flex-wrap gap-1 mt-1">
																{meal.tags.map(tag => (
																	<Badge key={tag} variant="outline" className="text-xs px-1 py-0">
																		{tag}
																	</Badge>
																))}
															</div>
														)}
													</TableCell>
													<TableCell className="table-cell">
														{meal.mealType}
													</TableCell>
													<TableCell className="hidden sm:table-cell">
														{meal.eatingOut ? "Yes" : "No"}
													</TableCell>
													<TableCell className="whitespace-nowrap">
														<span className="hidden xs:inline">
															{new Date(meal.date).toLocaleDateString(
																"en-US",
																{
																	year: "2-digit",
																	month: "2-digit",
																	day: "2-digit",
																}
															)}
														</span>
														<span className="xs:hidden">
															{new Date(meal.date).toLocaleDateString(
																"en-US",
																{
																	month: "numeric",
																	day: "numeric",
																	year:"numeric",
																}
															)}
														</span>
														<span className="hidden xs:inline">
															{" - " + getShortenedDayOfWeek(new Date(meal.date))}
														</span>
													</TableCell>
													<TableCell className="hidden md:table-cell">
														{meal.note || ""}
													</TableCell>
													<TableCell 
														className="text-right"
														onClick={(e) => e.stopPropagation()}
													>
														<MealFormModal
															meal={meal}
															onSave={handleSaveMeal}
															onDelete={deleteMeal}
														/>
													</TableCell>
												</TableRow>
											))}
										</TableBody>

										<TableFooter className="sticky bottom-0 z-10 dark:bg-gray-800 bg-gray-100">
											<TableRow>
												<TableCell
													colSpan={2}
													className="font-medium"
												>
													Out vs In
												</TableCell>
												<TableCell className="hidden sm:table-cell" />
												<TableCell colSpan={3} className="text-right">
													{filteredMeals.filter((m) => m.eatingOut).length}{" "}
													vs{" "}
													{filteredMeals.filter((m) => !m.eatingOut).length}
												</TableCell>
											</TableRow>
										</TableFooter>
									</Table>
								</ScrollArea>
							</div>
						</div>
						<div className="w-full space-y-4">
							{/* Search Bar */}
							<div className="relative">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Search meals by name, type, date, tags, or 'out'/'in'..."
									className="pl-9 w-full"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>

							{/* Filter Badges */}
							{(mealTypeFilter !== null || eatingOutFilter !== null || tagFilter !== null) && (
								<div className="flex flex-wrap gap-2 items-center">
									<span className="text-sm text-muted-foreground">Active Filters:</span>
									{mealTypeFilter && (
										<Badge variant="secondary" className="flex items-center gap-1">
											{mealTypeFilter}
											<X 
												size={14} 
												className="cursor-pointer ml-1" 
												onClick={() => setMealTypeFilter(null)} 
											/>
										</Badge>
									)}
									{eatingOutFilter !== null && (
										<Badge variant="secondary" className="flex items-center gap-1">
											{eatingOutFilter ? "Eating Out" : "Eating In"}
											<X 
												size={14} 
												className="cursor-pointer ml-1" 
												onClick={() => setEatingOutFilter(null)} 
											/>
										</Badge>
									)}
									{tagFilter && (
										<Badge variant="secondary" className="flex items-center gap-1">
											{tagFilter}
											<X 
												size={14} 
												className="cursor-pointer ml-1" 
												onClick={() => setTagFilter(null)} 
											/>
										</Badge>
									)}
								</div>
							)}

							{/* Controls */}
							<div className="flex flex-col xs:flex-row gap-2 flex-wrap">
								<MealFormModal onSave={handleSaveMeal} />
								
								<div className="flex gap-2 flex-1 flex-wrap">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" className="flex items-center gap-1 flex-1 xs:flex-none">
												<FilterIcon size={16} />
												<span className="hidden xs:inline">Filter</span> Out/In
												<ChevronDown size={14} className="opacity-70" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => setEatingOutFilter(null)}>
												All
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => setEatingOutFilter(true)}>
												Eating Out
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => setEatingOutFilter(false)}>
												Eating In
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
									
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" className="flex items-center gap-1 flex-1 xs:flex-none">
												<FilterIcon size={16} />
												<span className="hidden xs:inline">Filter</span> Type
												<ChevronDown size={14} className="opacity-70" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => setMealTypeFilter(null)}>
												All
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => setMealTypeFilter("Breakfast")}>
												Breakfast
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => setMealTypeFilter("Lunch")}>
												Lunch
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => setMealTypeFilter("Dinner")}>
												Dinner
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
									
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" className="flex items-center gap-1 flex-1 xs:flex-none">
												<FilterIcon size={16} />
												<span className="hidden xs:inline">Filter</span> Tags
												<ChevronDown size={14} className="opacity-70" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => setTagFilter(null)}>
												All Tags
											</DropdownMenuItem>
											<Separator />
											{Array.from(new Set(meals.flatMap(m => m.tags))).map(tag => (
												<DropdownMenuItem key={tag} onClick={() => setTagFilter(tag)}>
													{tag}
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
									
									<div className="ml-auto">
										<ModeToggle />
									</div>
								</div>
							</div>
						</div>

					</div>
				)}
			</main>

			<footer className="mt-auto pt-8 flex gap-4 items-center justify-center w-full border-t dark:border-gray-800 border-gray-200">
				<a
					className="flex items-center gap-2 py-4"
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
					<p className="underline-offset-3 group relative inline-block underline underline-offset-2 decoration-gray-200">
						Made by Adam Sulemanji
						<span className="absolute bottom-0 left-0 mt-1 block h-[2px] w-0 bg-current transition-all duration-300 group-hover:w-full"></span>
					</p>
				</a>
			</footer>

			{/* Edit Modal that opens when clicking on a row */}
			{editingMeal && (
				<MealFormModal 
					meal={editingMeal}
					onSave={handleSaveMeal}
					onDelete={deleteMeal}
					isOpen={isEditModalOpen}
					onOpenChange={setIsEditModalOpen}
				/>
			)}
		</div>
	);
}
