import { MealForm } from "@/interfaces/MealForm";

export const getLast7DaysData = (meals: MealForm[]) => {
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

export const getCurrentMonthData = (meals: MealForm[]) => {
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

export const getAllTimeDataByMonth = (meals: MealForm[]) => {
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

export const formatKey = (date: Date) => {
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  return `${month} ${day}`;
};

export const getAllTimeDatabyDay = (meals: MealForm[]) => {
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

export const rollingEatingOutPercentage = (meals: MealForm[], lookbackPeriod: number) => {
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