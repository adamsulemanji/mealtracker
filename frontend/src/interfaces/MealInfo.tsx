export interface MealInfo {
	mealID?: string;
	mealName: string;
	mealType: 'Breakfast' | 'Lunch' | 'Dinner';
	eatingOut: boolean;
	date: Date;
	note: string;
}