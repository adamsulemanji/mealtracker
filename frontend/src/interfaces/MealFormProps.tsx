import { MealForm }  from './MealForm';

export interface MealFormProps {
  /**
   * An existing meal to edit. If `undefined`, the form will create a new meal.
   */
  meal?: MealForm;

  /**
   * Called when the user successfully creates or updates a meal.
   */
  onSave: (meal: MealForm) => void;

  /**
   * Called when the user deletes a meal (only shown in edit mode).
   */
  onDelete?: (mealID: string) => void;
}