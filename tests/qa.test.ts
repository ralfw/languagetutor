import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { Load } from "../modules/TxtAdapter.ts"

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