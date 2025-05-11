import { Quote } from './../types/weather.types';
import heatPumpData from '../data/heat-pumps.json'
import housesData from '../data/houses.json'
import type { WeatherData, House, HeatPump } from '../types/weather.types'
import { getWeatherData } from './weather-service'
import { VAT_RATE } from '../consts';



//Generate quotes for houses
export async function generateQuote(): Promise<Quote[]> {
  const quotes: Quote[] = [];
  for (const house of housesData) {
    const quote: Quote = { submissionId: house.submissionId };

    //calculate heat loss
    const heatLoss: number = parseFloat((house.floorArea * house.heatingFactor * house.insulationFactor).toFixed(2))
    quote.estimatedHeatLoss = heatLoss

    const degreeDays: number | null = await getWeatherData(house.designRegion);
    if (!degreeDays) {
      quote.warning = `Could not fetch weather data for ${house.designRegion}`;
      quote.estimatedHeatLoss = 29710.8; // Default Value
      quotes.push(quote);
      continue;
    }
    quote.designRegion = house.designRegion;

    const powerHeatLoss: number = parseFloat((heatLoss / degreeDays).toFixed(2))
    quote.powerHeatLoss = powerHeatLoss

    const suitablePump: HeatPump | null = heatPumpData
      .sort((pumpA, pumpB) => pumpA.outputCapacity - pumpB.outputCapacity)
      .find((pump) => pump.outputCapacity >= powerHeatLoss) || null;

      if(suitablePump) {
        quote.recommendedHeatPump = suitablePump.label;

        const costBreakdown: {label: string; cost: number}[] = suitablePump.costs;
        const totalCost: number = costBreakdown.reduce((sum, item) => sum + item.cost, 0);
        const totalCostWithVAT: number = parseFloat((totalCost * (1 + VAT_RATE)).toFixed(2))
        quote.costBreakdown = costBreakdown;
        quote.totalCostWithVAT = totalCostWithVAT;
      }
      quotes.push(quote)

  }
  return quotes;
}

