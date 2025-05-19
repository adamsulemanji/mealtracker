const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Load the CSV file
const csvFilePath = path.resolve(__dirname, 'results-3.csv');
const apiEndpoint = 'https://api.meals.adamsulemanji.com/meals';

// Helper function to parse CSV data
function parseCSV(csvData) {
    const rows = csvData.split('\n').map(row => row.split(','));
    const headers = rows.shift().map(header => header.trim().replace(/"/g, ''));

    return rows.map(row => {
        const obj = {};
        row.forEach((value, index) => {
            obj[headers[index]] = value.trim().replace(/"/g, '');
        });
        return obj;
    });
}

// Helper function to transform data for the API
function transformData(row) {
    return {
        "mealName": row.mealName || '',
        "mealType": row.mealType || '',
        "eatingOut": row.eatingOut.toLowerCase() === 'true',
        "date": row.date ? new Date(row.date).toISOString() : '',
        "note": row.note || ''
    };
}

// Read and process the CSV file
fs.readFile(csvFilePath, 'utf8', async (err, data) => {
    if (err) {
        console.error('Error reading the CSV file:', err);
        return;
    }

    const parsedData = parseCSV(data);
    console.log('Parsed data:', parsedData);

    const filteredData = parsedData.map(transformData);
    console.log('Filtered data:', filteredData);

    // Send POST requests for each entry
    for (const mealInfo of filteredData) {
        try {
            const response = await axios.post(apiEndpoint, mealInfo);
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error posting data:', error.message);
        }
    }
});
