import { Quote } from "../types/weather.types";

export function formatQuote(quote: Quote): string {
    let oText: string = `--------------------\n${quote.submissionId}\n------------------------------\n`;

    if (quote.warning) {
        oText += `       Heating Loss: ${quote.estimatedHeatLoss}\n Warning: ${quote.warning}`
        return oText;
    }

    oText += `  Estimated Heat Loss = ${quote.estimatedHeatLoss}\n`;
    oText += `  Design Region = ${quote.designRegion}\n`;
    oText += `  Power Heat Loss = ${quote.powerHeatLoss}\n`;
    oText += `  Recommended Heat Pump = ${quote.recommendedHeatPump}\n`;
    oText += `  Cost Breakdown\n`;
    quote.costBreakdown?.forEach((item) => {
      oText += `    ${item.label}, ${item.cost}\n`;
    });
    oText += `  Total Cost, including VAT = ${quote.totalCostWithVAT}\n`;
  
    return oText;
}