"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { MealForm } from "@/interfaces/MealForm";
import { phrases } from "@/utils/misc/phrases";
import MealFormModal from "@/components/page/MealFormModal";
import { Separator } from "@/components/ui/separator";
import { type ChartConfig } from "@/components/ui/chart";

// Page components
import GreetingHeader from "@/components/page/GreetingHeader";
import MealFilters from "@/components/page/MealFilters";
import MealTable from "@/components/page/MealTable";
import ChartComponent, { ChartView } from "@/components/page/ChartComponent";
import Footer from "@/components/page/Footer";

// Utility functions
import {
	getLast7DaysData,
	getCurrentMonthData,
	getAllTimeDataByMonth,
	getAllTimeDatabyDay,
	rollingEatingOutPercentage
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

		// Add keyboard shortcut for new meal
		const handleKeyDown = (event: KeyboardEvent) => {
			// Check if 'n' or 'N' is pressed
			if ((event.key === 'n' || event.key === 'N') && 
				// Make sure no input elements are focused
				!['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) {
				event.preventDefault(); // Prevent the 'n' key from being entered in the form
				handleAddMeal();
			}
		};

		// Add event listener
		window.addEventListener('keydown', handleKeyDown);
		setTimeout(() => {
			toast({
				title: "Pro Tip",
				description: "Press 'N' key to quickly add a new meal",
				variant: "default",
			});
		}, 2000);

		// Clean up event listener on component unmount
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
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
				return rollingEatingOutPercentage(filteredMeals, lookbackPeriod);
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
				<div className="w-full flex justify-between items-start">
					<GreetingHeader phrase={phrase} />
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
						

						{/* Chart and Table Section - Side by side on larger screens */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Chart Section */}
							<ChartComponent
								chartData={chartData}
								chartTitle={chartTitle}
								chartView={chartView}
								setChartView={setChartView}
								lookbackPeriod={lookbackPeriod}
								setLookbackPeriod={setLookbackPeriod}
								chartConfig={chartConfig}
							/>

							{/* Table Section */}
							<MealTable
								meals={filteredMeals}
								onRowClick={handleRowClick}
								getShortenedDayOfWeek={getShortenedDayOfWeek}
								onSave={handleSaveMeal}
								onDelete={deleteMeal}
							/>							
						</div>
						{/* Filters and Controls */}
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
								onAddMeal={handleAddMeal}
							/>
					</div>
				)}
			</main>

			<Footer />

			{/* Edit Modal that opens when clicking on a row or adding a new meal */}
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
