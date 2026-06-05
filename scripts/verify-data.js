const fs = require('fs');
const path = require('path');

console.log("=== GiziVision Dataset Verification ===");

const filePath = path.join(__dirname, '../data/nutrition.csv');
console.log(`Checking file path: ${filePath}`);

if (!fs.existsSync(filePath)) {
  console.error("ERROR: nutrition.csv not found in data/ folder!");
  process.exit(1);
}

const fileContent = fs.readFileSync(filePath, 'utf8');
const lines = fileContent.split('\n').filter(line => line.trim() !== '');
console.log(`Successfully read nutrition.csv. Total lines (with headers): ${lines.length}`);

if (lines.length < 2) {
  console.error("ERROR: CSV file is empty!");
  process.exit(1);
}

const headers = lines[0].trim().split(',');
console.log(`CSV Headers: ${headers.join(', ')}`);

// Verify expected headers exist
const expectedHeaders = ['id', 'calories', 'proteins', 'fat', 'carbohydrate', 'name', 'image'];
const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));

if (missingHeaders.length > 0) {
  console.error(`ERROR: Missing required headers: ${missingHeaders.join(', ')}`);
  process.exit(1);
}

console.log("SUCCESS: Headers verified successfully.");

// Verify database search lookup
let baksoFound = false;
let abonFound = false;

for (let i = 1; i < lines.length; i++) {
  // Simple comma split (handles standard entries)
  const columns = lines[i].split(',');
  const name = columns[5]; // name is at index 5
  if (name) {
    if (name.toLowerCase().includes('bakso')) {
      baksoFound = true;
    }
    if (name.toLowerCase().includes('abon')) {
      abonFound = true;
    }
  }
}

if (baksoFound) {
  console.log("SUCCESS: Query 'Bakso' verified in database scan test.");
} else {
  console.warn("WARNING: 'Bakso' query could not be verified in database.");
}

if (abonFound) {
  console.log("SUCCESS: Query 'Abon' verified in database scan test.");
} else {
  console.warn("WARNING: 'Abon' query could not be verified in database.");
}

console.log("=== Dataset Verification Complete ===");
