import { Store } from "./modules/TxtAdapter.ts"
import { Parse } from "./modules/CmdlinePortal.ts"


// RepeticoJSONAdapter

export interface Flashcard {
  question: string;
  answer: string;
}

export function Load(filename: string): Flashcard[] {
  throw new Error("Not yet implemented!");
}



// Converter (core)

export function Map(flashcards: Flashcard[]): string[] {
  throw new Error("Not yet implemented!");
}
