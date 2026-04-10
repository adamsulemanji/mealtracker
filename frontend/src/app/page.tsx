"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { MealForm } from "@/interfaces/MealForm";
import { phrases } from "@/utils/misc/phrases";
import MealFormModal from "@/components/page/MealFormModal";
import { type ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

// Page components
import GreetingHeader from "@/components/page/GreetingHeader";
import MealFilters from "@/components/page/MealFilters";
import MealTable from "@/components/page/MealTable";
import ChartComponent, { ChartView } from "@/components/page/ChartComponent";
import Footer from "@/components/page/Footer";
import StatsModal from "@/components/page/StatsModal";
import StreakBadge from "@/components/page/StreakBadge";
import { ModeToggle } from "@/components/provider/Dark-LightModeToggle";

// Utility functions
import {
	getLast7DaysData,
	getCurrentMonthData,
	getAllTimeDataByMonth,
	getAllTimeDatabyDay,
	rollingEatingOutPercentage,
} from "@/utils/ChartUtils";

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
	const [lookbackPeriod, setLookbackPeriod] = useState<number>(30);
	const [tagFilter, setTagFilter] = useState<string | null>(null);
	const [currentStreak, setCurrentStreak] = useState<number>(0);
	const [maxStreak, setMaxStreak] = useState<number>(0);

	const apiURL = process.env.NEXT_PUBLIC_API_URL;

	function sortMeals(meals: MealForm[]): MealForm[] {
		const mealOrder = ["Breakfast", "Lunch", "Dinner"];
		return [...meals].sort((a, b) => {
			const dateA = new Date(a.date).getTime();
			const dateB = new Date(b.date).getTime();
			if (dateA === dateB) {
				return mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType);
			}
			return dateA - dateB;
		});
	}

	// -------------
	// API Handlers
	// -------------

	async function fetchMeals() {
		try {
			setIsLoading(true);
			const response = await axios.get(`${apiURL}/meals`);

			if (!response.data || !response.data.success) {
				console.error("API response failed or has invalid format:", response);
				toast({
					title: "Error",
					description: "Invalid API response format",
					variant: "destructive",
				});
				return;
			}

			const mealsData = response.data.items;

			if (!Array.isArray(mealsData)) {
				console.error("Expected array of meals but got:", mealsData);
				toast({
					title: "Error",
					description: "Invalid meals data format from API",
					variant: "destructive",
				});
				return;
			}

			const normalizedMeals = mealsData.map((meal) => ({
				...meal,
				tags: Array.isArray(meal.tags) ? meal.tags : [],
			}));

			const sortedMeals = sortMeals(normalizedMeals).reverse();
			setMeals(sortedMeals);
			calculateStreaks(normalizedMeals);
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

	const handleSaveMeal = (updatedMeal: MealForm) => {
		setMeals((prevMeals) => {
			const exists = prevMeals.some((m) => m.mealID === updatedMeal.mealID);
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

	const handleAddMeal = () => {
		setEditingMeal(null);
		setIsEditModalOpen(true);
	};

	// --------------
	// Lifecycle
	// --------------

	useEffect(() => {
		fetchMeals();
		setPhrase(getRandomPhrase());

		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				(event.key === "n" || event.key === "N") &&
				!["INPUT", "TEXTAREA", "SELECT"].includes(
					document.activeElement?.tagName || ""
				)
			) {
				event.preventDefault();
				handleAddMeal();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	// --------------
	// Search & Filter Logic
	// --------------

	const filteredMeals = useMemo(() => {
		return meals.filter((m) => {
			const passesMealType = mealTypeFilter ? m.mealType === mealTypeFilter : true;
			const passesEatingOut =
				eatingOutFilter !== null ? m.eatingOut === eatingOutFilter : true;
			const passesTagFilter = tagFilter
				? Array.isArray(m.tags) && m.tags.includes(tagFilter)
				: true;

			const query = searchQuery.toLowerCase().trim();
			if (!query) {
				return passesMealType && passesEatingOut && passesTagFilter;
			}

			const mealDate = new Date(m.date).toLocaleDateString().toLowerCase();
			const isEatingOutMatch =
				query === "out" ? m.eatingOut : query === "in" ? !m.eatingOut : false;
			const hasMatchingTag =
				m.tags && m.tags.some((tag) => tag.toLowerCase().includes(query));

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
				return rollingEatingOutPercentage(filteredMeals, lookbackPeriod);
			default:
				return [];
		}
	}, [filteredMeals, chartView, lookbackPeriod]);

	const chartTitle = useMemo(() => {
		const CurrentMonth = new Date().toLocaleString("default", { month: "long" });
		switch (chartView) {
			case "last7Days":
				return "Last 7 Days";
			case "currentMonth":
				return CurrentMonth;
			case "allTimebyMonth":
				return "All Time by Month";
			case "allTimebyDay":
				return "All Time by Day";
			case "rollingEatingOutPercentage":
				return lookbackPeriod > 0
					? `Rolling ${lookbackPeriod}d Eating Out %`
					: "Rolling Eating Out %";
			default:
				return "";
		}
	}, [chartView, lookbackPeriod]);

	// Calculate streaks based on meal data
	const calculateStreaks = (mealsData: MealForm[]) => {
		if (!mealsData.length) {
			setCurrentStreak(0);
			setMaxStreak(0);
			return;
		}

		const mealDates = mealsData.map((meal) => {
			const date = new Date(meal.date);
			return date.toISOString().split("T")[0];
		});

		const uniqueDatesSet = new Set(mealDates);
		const uniqueDates = [...uniqueDatesSet].sort();

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const todayStr = today.toISOString().split("T")[0];

		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);
		const yesterdayStr = yesterday.toISOString().split("T")[0];

		let currentStreak = 0;
		const hasToday = uniqueDatesSet.has(todayStr);
		const hasYesterday = uniqueDatesSet.has(yesterdayStr);

		if (hasToday || hasYesterday) {
			const startDate = hasToday ? today : yesterday;
			currentStreak = 1;

			let checkDate = new Date(startDate);
			checkDate.setDate(checkDate.getDate() - (hasToday ? 1 : 0));

			while (true) {
				const dateStr = checkDate.toISOString().split("T")[0];
				if (uniqueDatesSet.has(dateStr)) {
					currentStreak++;
					checkDate.setDate(checkDate.getDate() - 1);
				} else {
					break;
				}
			}
		}

		let maxStreak = 0;
		let tempStreak = 1;

		for (let i = 1; i < uniqueDates.length; i++) {
			const currentDate = new Date(uniqueDates[i]);
			const prevDate = new Date(uniqueDates[i - 1]);
			const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays === 1) {
				tempStreak++;
			} else {
				maxStreak = Math.max(maxStreak, tempStreak);
				tempStreak = 1;
			}
		}

		maxStreak = Math.max(maxStreak, tempStreak);
		setCurrentStreak(currentStreak);
		setMaxStreak(Math.max(maxStreak, currentStreak));
	};

	// --------------
	// Render
	// --------------

	return (
		<div className="min-h-screen flex flex-col bg-background">
			{/* Sticky top navigation */}
			<header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16 gap-4">
						<GreetingHeader phrase={phrase} />
						<div className="flex items-center gap-2 shrink-0">
							<StreakBadge
								currentStreak={currentStreak}
								maxStreak={maxStreak}
							/>
							<StatsModal
								meals={meals}
								currentStreak={currentStreak}
								maxStreak={maxStreak}
							/>
							<Button size="sm" onClick={handleAddMeal} className="gap-1.5">
								<Plus className="h-4 w-4" />
								<span className="hidden sm:inline">Add Meal</span>
								<span className="sm:hidden">Add</span>
							</Button>
							<ModeToggle />
						</div>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
				{isLoading ? (
					<div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span className="text-sm">Loading meals…</span>
					</div>
				) : meals.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-24 gap-4">
						<p className="text-muted-foreground text-sm">No meals logged yet.</p>
						<Button onClick={handleAddMeal} className="gap-1.5">
							<Plus className="h-4 w-4" /> Log your first meal
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
						{/* Chart card */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base font-semibold">
									Meal Activity —{" "}
									<span className="text-muted-foreground font-normal">
										{chartTitle}
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<ChartComponent
									chartData={chartData}
									chartTitle={chartTitle}
									chartView={chartView}
									setChartView={setChartView}
									lookbackPeriod={lookbackPeriod}
									setLookbackPeriod={setLookbackPeriod}
									chartConfig={chartConfig}
								/>
							</CardContent>
						</Card>

						{/* History card */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base font-semibold">
									Meal History
								</CardTitle>
								<MealFilters
									searchQuery={searchQuery}
									setSearchQuery={setSearchQuery}
									mealTypeFilter={mealTypeFilter}
									setMealTypeFilter={setMealTypeFilter}
									eatingOutFilter={eatingOutFilter}
									setEatingOutFilter={setEatingOutFilter}
									tagFilter={tagFilter}
									setTagFilter={setTagFilter}
									meals={meals}
								/>
							</CardHeader>
							<CardContent className="p-0 pb-0">
								<MealTable
									meals={filteredMeals}
									onRowClick={handleRowClick}
									getShortenedDayOfWeek={getShortenedDayOfWeek}
									onSave={handleSaveMeal}
									onDelete={deleteMeal}
								/>
							</CardContent>
						</Card>
					</div>
				)}
			</main>

			<Footer />

			{isEditModalOpen && (
				<MealFormModal
					meal={editingMeal || undefined}
					onSave={handleSaveMeal}
					onDelete={deleteMeal}
					isOpen={isEditModalOpen}
					onOpenChange={setIsEditModalOpen}
				/>
			)}
		</div>
	);
}
