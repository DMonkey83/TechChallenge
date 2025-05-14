// consts for environment variables
// In real life i would not add || <actual key and url>
export const API_URL = process.env.API_URL || "https://063qqrtqth.execute-api.eu-west-2.amazonaws.com/v1/weather"
export const API_KEY = process.env.API_KEY || "f661f74e-20a7-4e9f-acfc-041cfb846505";

export const VAT_RATE = 0.05;

// Configuration for retries
export const MAX_RETRIES = 3;
export const DELAY_MS = 1000;
