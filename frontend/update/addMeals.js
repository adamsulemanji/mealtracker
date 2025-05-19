import axios from 'axios';

/**
 * Generate random meal data between start and end dates
 * @param {Date} startDate - beginning date for meal generation
 * @param {Date} endDate - ending date for meal generation
 * @param {number} [mealsPerDay=3] - number of meals to generate per day
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
export const generateTestMeals = async (startDate, endDate, mealsPerDay = 3) => {
  try {
    if (!startDate || !endDate) {
      throw new Error('Start and end dates are required');
    }

    // Clone dates to avoid modifying the originals
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (currentDate > end) {
      throw new Error('Start date must be before end date');
    }

    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
    const mealNames = [
      // Breakfast options
      ['Oatmeal', 'Pancakes', 'Eggs Benedict', 'Avocado Toast', 'Smoothie Bowl', 'Cereal'],
      // Lunch options
      ['Sandwich', 'Salad', 'Soup', 'Pasta', 'Wrap', 'Bowl'],
      // Dinner options
      ['Steak', 'Salmon', 'Chicken Curry', 'Pasta', 'Pizza', 'Stir Fry', 'Burgers']
    ];
    
    const notes = [
      'Delicious!', 
      'Could be better', 
      'Perfect portion size', 
      'Too salty', 
      'Will make again', 
      'Need to try different recipe next time',
      ''
    ];

    const generatedMeals = [];
    let count = 0;

    // Loop through each day
    while (currentDate <= end) {
      // For each day, create the specified number of meals
      for (let i = 0; i < mealsPerDay; i++) {
        // Determine meal type based on index or randomize
        const mealTypeIndex = i % 3;
        const mealType = mealTypes[mealTypeIndex];
        
        // Select random meal name appropriate for the meal type
        const names = mealNames[mealTypeIndex];
        const mealName = names[Math.floor(Math.random() * names.length)];
        
        // 30% chance of eating out
        const eatingOut = Math.random() < 0.3;
        
        // Random note
        const note = notes[Math.floor(Math.random() * notes.length)];
        
        // Create meal time (breakfast: 7-9am, lunch: 12-2pm, dinner: 6-8pm)
        const mealDate = new Date(currentDate);
        if (mealType === 'Breakfast') {
          mealDate.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        } else if (mealType === 'Lunch') {
          mealDate.setHours(12 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        } else {
          mealDate.setHours(18 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        }
        
        // Create meal object
        const meal = {
          mealName,
          mealType,
          eatingOut,
          date: mealDate,
          note
        };
        
        generatedMeals.push(meal);
        count++;
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Post meals to the API
    for (const meal of generatedMeals) {
      await axios.post('http://localhost:8000/meals', meal);
    }
    
    return { success: true, count };
  } catch (error) {
    console.error('Error generating test meals:', error);
    return { 
      success: false, 
      count: 0, 
      error: error.message || 'Failed to generate test meals' 
    };
  }
};

// Example usage:
const startDate = new Date('2025-01-01');
const endDate = new Date('2025-05-18');
generateTestMeals(startDate, endDate, 2)
  .then(result => console.log(`Generated ${result.count} test meals successfully`))
  .catch(err => console.error('Failed to generate test meals:', err));

