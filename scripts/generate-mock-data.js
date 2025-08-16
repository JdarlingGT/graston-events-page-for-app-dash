"use strict";

const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

const csvDir = path.join(__dirname, "..", "public", "mock-data", "csv");
const outDir = path.join(__dirname, "..", "public", "mock-data");

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Read all CSV files in csvDir
fs.readdirSync(csvDir).forEach((file) => {
  if (file.toLowerCase().endsWith(".csv")) {
    const csvPath = path.join(csvDir, file);
    const csvContent = fs.readFileSync(csvPath, "utf8");
    const { data, errors } = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length) {
      console.error(`Parsing errors in ${file}:`, errors);
      return;
    }

    const jsonFilename = file.replace(/\.csv$/i, ".json");
    const outPath = path.join(outDir, jsonFilename);
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Generated mock JSON: ${jsonFilename}`);
  }
});