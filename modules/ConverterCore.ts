import { Flashcard } from "./RepeticoJsonAdapter.ts"

export function Map(flashcards: Flashcard[]): string[] {
  return flashcards.map((card) => ExtractFirstLine(card.answer));
}

function ExtractFirstLine(text:string):string {
  return text.replace("<br>", "\n")
             .replace("</p>", "\n")
             .replace("<p>", "")
             .split("\n")[0].trim();
}