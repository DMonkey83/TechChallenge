import prompts from "prompts";
import { generateQuote } from "./services/heat-pump-service";
import { formatQuote } from "./services/format-quotes";

async function main() {
  console.log("Heat Pump Quote Generator");
  const response = await prompts({
    type: "confirm",
    name: "generate",
    message: "Let's generate pump quotes!",
    initial: true,
  });

  if (!response) {
    console.log("Exiting...");
    return;
  }

  try {
    const quotes = await generateQuote();
    const formattedQuotes = quotes.map(formatQuote).join("\n");
    console.log(formattedQuotes);
  } catch (error) {
    console.log("Error generating quotes:", error);
  }
}

main();
