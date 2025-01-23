"use client";

import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { MealInfo } from "@/interfaces/MealInfo";
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
import MealForm from "@/components/context/MealForm";
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

type ChartView = "last7Days" | "currentMonth" | "allTimebyMonth" | "allTimebyDay";

export default function Home() {
  const [meals, setMeals] = useState<MealInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [chartView, setChartView] = useState<ChartView>("currentMonth");
  const [phrase, setPhrase] = useState<string>("");

  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  /** Helper: Sort meals by date, and then by meal type (Breakfast -> Lunch -> Dinner). */
  function sortMeals(meals: MealInfo[]): MealInfo[] {
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

  // ----------------------
  // Chart Data Generators
  // ----------------------

  const getLast7DaysData = (meals: MealInfo[]) => {
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

  const getCurrentMonthData = (meals: MealInfo[]) => {
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

  const getAllTimeDataByMonth = (meals: MealInfo[]) => {
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

    return Object.values(mapObj);
  };

  const getAllTimeDatabyDay = (meals: MealInfo[]) => {
    const mapObj = meals.reduce((acc, meal) => {
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

    return Object.values(mapObj);
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
  }

  // If you need to remove *all* meals
  async function deleteAllMeals() {
    try {
      await axios.delete(`${apiURL}/meals`);
      setMeals([]);
    } catch (error) {
      console.error(error);
    }
  }

  // Called after MealForm finishes creating or updating
  const handleSaveMeal = (updatedMeal: MealInfo) => {
    setMeals((prevMeals) => {
      // If it’s a new meal (no mealID found in prevMeals),
      // or if updating an existing one:
      const exists = prevMeals.some((m) => m.mealID === updatedMeal.mealID);
      let newMeals: MealInfo[];
      if (exists) {
        newMeals = prevMeals.map((m) =>
          m.mealID === updatedMeal.mealID ? updatedMeal : m
        );
      } else {
        newMeals = [...prevMeals, updatedMeal];
      }
      // Sort them properly after changes
      return sortMeals(newMeals).reverse();
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left">
          Welcome Nikki to your Meal Tracker!
        </h1>
        <h6 className="text-center sm:text-sm">{phrase}</h6>
        <Separator className="dark:bg-gray-700" />

        {isLoading ? (
          <div className="text-center text-gray-500">Loading meals...</div>
        ) : meals.length === 0 ? (
          <div className="text-center text-gray-500">No meals available</div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-8 w-full">
            {/* CHART COLUMN */}
            <div className="min-h-[200px] w-full sm:w-1/2">
              <h2 className="text-2xl font-bold text-center">{chartTitle}</h2>
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

            {/* TABLE COLUMN */}
            <div className="w-full sm:w-1/2">
  {/* Wrap the entire table in ScrollArea if you want the header/footer locked */}
  <ScrollArea className="h-96">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Meal Name</TableHead>
          <TableHead>Meal Type</TableHead>
          <TableHead>Eating Out</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="min-w-[250px]">Note</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {meals.map((meal) => (
          <TableRow key={meal.mealID}>
            <TableCell>{meal.mealName}</TableCell>
            <TableCell>{meal.mealType}</TableCell>
            <TableCell>{meal.eatingOut ? "Yes" : "No"}</TableCell>
            <TableCell>
              {new Date(meal.date).toLocaleDateString("en-US", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
              }) +
                " - " +
                getShortenedDayOfWeek(new Date(meal.date))}
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

      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>Total Eaten Out vs In</TableCell>
          <TableCell className="text-right">
            {meals.filter((m) => m.eatingOut).length} -{" "}
            {meals.filter((m) => !m.eatingOut).length}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </ScrollArea>
</div>

          </div>
        )}

        <div className="flex gap-4 mt-4">
          <Button onClick={() => setChartView("last7Days")}>Last 7 Days</Button>
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
          {/* Button to add a new meal (MealForm without meal prop) */}
          <MealForm onSave={handleSaveMeal} />
          <ModeToggle />
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
