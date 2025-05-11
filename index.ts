import prompts from 'prompts';
import { getWeatherData } from './services/weather-service';
import houseData from './data/houses.json'
import { AxiosError } from 'axios';

async function main() {
  console.log('Quote Generator for Heat Pumps');
  const response = await prompts({
    type: "confirm",
    name: "generate",
    message: "'Let's generate pump quotes!",
    initial: true
  })

  if (!response) {
    console.log('Existing...')
    return;
  }

  console.log('response')

  try {
    const quotes = await getWeatherData(houseData[0].designRegion)
    console.log(quotes)
  } catch (error: unknown) {
    console.log('Error generating quotes', (error as AxiosError).response?.data)
  }
}

main()
