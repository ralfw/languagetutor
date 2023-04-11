import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";

import { Store } from "../modules/TxtAdapter.ts";
import { Parse, CmdlineParams } from "../modules/repeticoconverter/CmdlinePortal.ts"
import { Load, Flashcard } from "../modules/repeticoconverter/RepeticoJsonAdapter.ts"
import { Map } from "../modules/repeticoconverter/ConverterCore.ts"

// TxtAdapter

Deno.test("Writing words to txt file", () => {
  const filename = "./tests/testwords.txt";

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
  const filename = './tests/repetico_empty.json';
  const result = Load(filename);
  assertEquals(result, []);
});

Deno.test('Load should return an array of Flashcard objects for valid JSON data', () => {
  const filename = './tests/repetico_sample.json';
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

// ConverterCore

Deno.test('Map should return an array of strings with the answer values', () => {
  const flashcards: Flashcard[] = [
    {
      question: 'q1',
      answer: 'a1',
    },
    {
      question: 'q2',
      answer: 'a2 a2',
    },
    {
      question: 'q3',
      answer: 'a3 a3 a3',
    },
  ];
  const expected = ["a1", "a2 a2", "a3 a3 a3"];
  const result = Map(flashcards);
  assertEquals(result, expected);
});


Deno.test('Map should extract only the first line of the answer', () => {
  const flashcards: Flashcard[] = [
    {
      question: 'q1',
      answer: '<div>a1</div>',
    },
    {
      question: 'q2',
      answer: '<p>a2</p>and more',
    },
    {
      question: 'q3',
      answer: '<span>a3</span><br>and more',
    },
    {
      question: 'q4',
      answer: '<span style="abc">a4</span>',
    },
  ];
  const expected = ["a1", "a2", "a3", "a4"];
  const result = Map(flashcards);
  assertEquals(result, expected);
});