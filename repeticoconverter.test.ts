import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";

import { Store } from "./modules/TxtAdapter.ts";
import { Parse, CmdlineParams } from "./modules/CmdlinePortal.ts"
import { Load } from "./modules/RepeticoJsonAdapter.ts"

// TxtAdapter

Deno.test("Writing words to txt file", () => {
  const filename = "./testwords.txt";

  try {
    Deno.removeSync(filename);
  } catch (e) { /**/ }

  Store(filename, ["a", "bb", "ccc"]);

  const result = Deno.readTextFileSync(filename);
  assertEquals(result, "a\nbb\nccc");
});

// CmdlinePortal

Deno.test('Parse should throw an error if less than 2 arguments are provided', () => {
  const args: string[] = [];
  try {
    Parse(args);
    // If no error is thrown, the test should fail
    assertEquals(true, false);
  } catch (error) {
    assertEquals(error.message, 'Missing JSON filename as first parameter on command line.');
  }
});

Deno.test('Parse should return the correct filepaths for valid arguments', () => {
  const args: string[] = ['./abc/data.json'];
  const expected: CmdlineParams = {
    jsonFilepath: './abc/data.json',
    txtFilepath: './abc/data.txt',
  };
  const result = Parse(args);
  assertEquals(result, expected);
});


// RepeticoJsonAdapter

Deno.test('Load should return an empty array if the file is empty', () => {
  const filename = './repetico_empty.json';
  const result = Load(filename);
  assertEquals(result, []);
});

Deno.test('Load should return an array of Flashcard objects for valid JSON data', () => {
  const filename = './repetico_sample.json';
  const expected = [
    {
      question: '<p>der / die</p>',
      answer: '<p>el / la</p>',
    },
    {
      question: '<p>ein / eine</p>',
      answer: '<p>un / una</p>',
    },
    {
      question: 'müde<br><br>Ich bin müde nach einem ganzen Tag Arbeit.',
      answer: 'cansada <br><br>Estoy cansada después de trabajar todo el día.',
    },
  ];
  const result = Load(filename);
  assertEquals(result, expected);
});

Deno.test('Load should throw an error if the file does not exist', () => {
  const filename = 'nonexistent.json';
  try {
    Load(filename);
    // If no error is thrown, the test should fail
    assertEquals(true, false);
  } catch (error) {
    assertEquals(error.message, `No such file or directory: ${filename}`);
  }
});
