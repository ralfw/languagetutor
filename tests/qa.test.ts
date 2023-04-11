import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { Load } from "../modules/TxtAdapter.ts"
import { SelectWords } from "../modules/qa/QACore.ts";

// TxtAdapter

Deno.test("Load function loads words from file", () => {
  const expectedWords = ["word1", "word2", "word3"];
  const actualWords = Load("./tests/words.txt");
  assertEquals(actualWords, expectedWords);
});

Deno.test("Load function returns empty array if file is empty", () => {
  const expectedWords: string[] = [];
  const actualWords = Load("./tests/nowords.txt");
  assertEquals(actualWords, expectedWords);
});


// QACore
Deno.test("SelectWords function selects all words if there are fewer words than to select", () => {
  const words = ["word1", "word2", "word3"];
  const numberOfWords = 4;
  const selectedWords = SelectWords(words, numberOfWords);
  assertEquals(selectedWords, words);
});

Deno.test("SelectWords function selects the correct number of words if there are more words than to select", () => {
  const words = ["word1", "word2", "word3", "word4", "word5"];
  const numberOfWords = 3;
  const selectedWords = SelectWords(words, numberOfWords);
  assertEquals(selectedWords.length, numberOfWords);
  selectedWords.forEach(word => assertEquals(words.includes(word), true));
});

Deno.test("SelectWords function does not select the same word multiple times", () => {
  const words = ["word1", "word2", "word3", "word4", "word5"];
  const numberOfWords = 3;
  const selectedWords = SelectWords(words, numberOfWords);
  const uniqueWords = Array.from(new Set(selectedWords));
  assertEquals(selectedWords.length, uniqueWords.length);
});
