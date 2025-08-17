// This file provides a basic module declaration for 'pg' (node-postgres).
// It resolves the TS7016 error: "Could not find a declaration file for module 'pg'."
// This tells TypeScript to treat the module as having the 'any' type,
// which is a fallback when @types/pg is not available or not working correctly.
declare module 'pg';