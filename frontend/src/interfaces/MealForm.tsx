export interface MealForm {
	mealID?: string;
	mealName: string;
	mealType: 'Breakfast' | 'Lunch' | 'Dinner';
	eatingOut: boolean;
	date: Date;
	note: string;
	tags: string[];
}