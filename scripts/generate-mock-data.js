'use strict';

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Look for CSV files directly in public/mock-data
const dataDir = path.join(__dirname, '..', 'public', 'mock-data');
const outDir = dataDir;

// Read all files in the directory
fs.readdirSync(dataDir).forEach((file) => {
  if (file.toLowerCase().endsWith('.csv')) {
    const csvPath = path.join(dataDir, file);
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const { data, errors } = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length) {
      console.error(`Parsing errors in ${file}:`, errors);
      return;
    }

    const jsonFilename = file.replace(/\.csv$/i, '.json');
    const outPath = path.join(outDir, jsonFilename);
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Generated mock JSON: ${jsonFilename}`);
  }
});