import { Html5Entities } from "https://deno.land/x/html_entities@v1.0/mod.js";

export interface Flashcard {
  question: string;
  answer: string;
}

export function Load(filename: string): Flashcard[] {
  const decoder = new TextDecoder('utf-8');
  let json = "";
  
  try {
    const data = Deno.readFileSync(filename);
    json = decoder.decode(data);
  }
  catch(error) {
    throw new Error("No such file or directory: " + filename);
  }

  if (json == "") return [];
  
  const cards = JSON.parse(json) as { question: string; answer: string }[];
  return cards.map((card) => ({
    question: Html5Entities.decode(card.question),
    answer: Html5Entities.decode(card.answer),
  }));
}