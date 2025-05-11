export interface Location {
  location: string;
  degreeDays: string;
  groundTemp: string;
  postcode: string;
  lat: string;
  lng: string;

}

export interface WeatherData {
  location: Location;
}

export interface Quote {
  submissionId: string;
  estimatedHeatLoss?: number;
  designRegion?: string;
  powerHeatLoss?: number;
  recommendedHeatPump?: string;
  costBreakdown?: { label: string; cost: number }[];
  totalCostWithVAT?: number;
  warning?: string;
}

export interface House {
  submissionId: string;
  floorArea: number;
  heatingFactor: number;
  insulationFactor: number;
  designRegion: string;
  age?: string; // Optional field from houses.json
}

export interface HeatPump {
  label: string; // Changed from model
  outputCapacity: number;
  costs: { label: string; cost: number }[]; // Changed from baseCost
}
