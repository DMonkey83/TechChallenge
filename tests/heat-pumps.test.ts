import { generateQuote } from "../services/heat-pump-service";
import { formatQuote } from "../services/format-quotes";
import { getWeatherData } from "../services/weather-service";
import { Quote } from "../types/weather.types";

// Mock dependencies
jest.mock("../services/weather-service");
jest.mock("../consts", () => ({
  VAT_RATE: 0.05,
}));

describe("HeatPumpService", () => {
  const mockedGetWeatherData = getWeatherData as jest.MockedFunction<
    typeof getWeatherData
  >;

  beforeEach(() => {
    jest.resetModules(); // Clear module cache before each test
    jest.clearAllMocks();
    // Default mocks matching real houses.json and heat-pumps.json
    jest.doMock("../data/houses.json", () => [
      {
        submissionId: "4cb3820a-7bf6-47f9-8afc-3adcac8752cd",
        designRegion: "Severn Valley (Filton)",
        floorArea: 125,
        age: "1967 - 1975",
        heatingFactor: 101,
        insulationFactor: 1.3,
      },
      {
        submissionId: "e21a3149-b88c-40e9-86fd-c94a6b93cb78",
        designRegion: "W Pennines (Ringway)",
        floorArea: 92,
        age: "1991 - 1995",
        heatingFactor: 88,
        insulationFactor: 1.1,
      },
      {
        submissionId: "2191bf41-ce1e-427d-85c3-88d5a44680ae",
        designRegion: "North-Eastern (Leeming)",
        floorArea: 126,
        age: "pre 1900",
        heatingFactor: 131,
        insulationFactor: 1.8,
      },
      {
        submissionId: "3d8f19b0-3886-452d-a335-f3a2e7d9f5a5",
        designRegion: "Thames Valley (Heathrow)",
        floorArea: 109,
        age: "1930 - 1949",
        heatingFactor: 90,
        insulationFactor: 1.2,
      },
      {
        submissionId: "b0ec94b6-ca15-4fb2-9ec7-7017f43080f4",
        designRegion: "W Scotland (Abbotsinch)",
        floorArea: 163,
        age: "1900 - 1929",
        heatingFactor: 111,
        insulationFactor: 1.7,
      },
    ]);
    jest.doMock("../data/heat-pumps.json", () => [
      {
        label: "5kW Package",
        outputCapacity: 5,
        costs: [
          {
            label:
              "Design & Supply of your Air Source Heat Pump System Components (5kW)",
            cost: 3947,
          },
          {
            label:
              "Installation of your Air Source Heat Pump and Hot Water Cylinder",
            cost: 2900,
          },
          {
            label: "Supply & Installation of your Homely Smart Thermostat",
            cost: 150,
          },
          { label: "Supply & Installation of a new Consumer Unit", cost: 300 },
          {
            label: "MCS System Commissioning & HIES Insurance-backed Warranty",
            cost: 1648,
          },
        ],
      },
      {
        label: "8kW Package",
        outputCapacity: 8,
        costs: [
          {
            label:
              "Design & Supply of your Air Source Heat Pump System Components (8kW)",
            cost: 4216,
          },
          {
            label:
              "Installation of your Air Source Heat Pump and Hot Water Cylinder",
            cost: 2900,
          },
          {
            label: "Supply & Installation of your Homely Smart Thermostat",
            cost: 150,
          },
          { label: "Supply & Installation of a new Consumer Unit", cost: 300 },
          {
            label: "MCS System Commissioning & HIES Insurance-backed Warranty",
            cost: 1648,
          },
        ],
      },
      {
        label: "12kW Package",
        outputCapacity: 12,
        costs: [
          {
            label:
              "Design & Supply of your Air Source Heat Pump System Components (12kW)",
            cost: 5138,
          },
          {
            label:
              "Installation of your Air Source Heat Pump and Hot Water Cylinder",
            cost: 2900,
          },
          {
            label: "Supply & Installation of your Homely Smart Thermostat",
            cost: 150,
          },
          { label: "Supply & Installation of a new Consumer Unit", cost: 300 },
          {
            label: "MCS System Commissioning & HIES Insurance-backed Warranty",
            cost: 1648,
          },
        ],
      },
      {
        label: "16kW Package",
        outputCapacity: 16,
        costs: [
          {
            label:
              "Design & Supply of your Air Source Heat Pump System Components (16kW)",
            cost: 5421,
          },
          {
            label:
              "Installation of your Air Source Heat Pump and Hot Water Cylinder",
            cost: 2900,
          },
          {
            label: "Supply & Installation of your Homely Smart Thermostat",
            cost: 150,
          },
          { label: "Supply & Installation of a new Consumer Unit", cost: 300 },
          {
            label: "MCS System Commissioning & HIES Insurance-backed Warranty",
            cost: 1648,
          },
        ],
      },
    ]);
  });

  describe("generateQuote", () => {
    it("generates quotes for valid regions with correct calculations", async () => {
      mockedGetWeatherData.mockResolvedValueOnce(1835);
      mockedGetWeatherData.mockResolvedValueOnce(null);
      mockedGetWeatherData.mockResolvedValueOnce(null);
      mockedGetWeatherData.mockResolvedValueOnce(null);
      mockedGetWeatherData.mockResolvedValueOnce(null);

      const quotes = await generateQuote();

      expect(quotes).toHaveLength(5);

      // Quote for Severn Valley (Filton)
      const quote1 = quotes[0];
      expect(quote1.submissionId).toBe("4cb3820a-7bf6-47f9-8afc-3adcac8752cd");
      expect(quote1.estimatedHeatLoss).toBe(16412.5);
      expect(quote1.designRegion).toBe("Severn Valley (Filton)");
      expect(quote1.powerHeatLoss).toBeCloseTo(8.94, 2);
      expect(quote1.recommendedHeatPump).toBe("12kW Package");
      expect(quote1.costBreakdown).toEqual([
        {
          label:
            "Design & Supply of your Air Source Heat Pump System Components (12kW)",
          cost: 5138,
        },
        {
          label:
            "Installation of your Air Source Heat Pump and Hot Water Cylinder",
          cost: 2900,
        },
        {
          label: "Supply & Installation of your Homely Smart Thermostat",
          cost: 150,
        },
        { label: "Supply & Installation of a new Consumer Unit", cost: 300 },
        {
          label: "MCS System Commissioning & HIES Insurance-backed Warranty",
          cost: 1648,
        },
      ]);
      expect(quote1.totalCostWithVAT).toBe(10642.8); // (5138 + 2900 + 150 + 300 + 1648) * 1.05
      expect(quote1.warning).toBeUndefined();

      // Quote for North-Eastern (Leeming)
      const quote3 = quotes[2];
      expect(quote3.submissionId).toBe("2191bf41-ce1e-427d-85c3-88d5a44680ae");
      expect(quote3.estimatedHeatLoss).toBe(29710.8); // Default value
      expect(quote3.warning).toBe(
        "Could not fetch weather data for North-Eastern (Leeming)"
      );
      expect(quote3.designRegion).toBeUndefined();
      expect(quote3.powerHeatLoss).toBeUndefined();
      expect(quote3.recommendedHeatPump).toBeUndefined();
      expect(quote3.costBreakdown).toBeUndefined();
      expect(quote3.totalCostWithVAT).toBeUndefined();
    });

  });
});
