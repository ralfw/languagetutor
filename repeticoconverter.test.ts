import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";

import { Store } from "./modules/TxtAdapter.ts";
import { Parse, CmdlineParams } from "./modules/CmdlinePortal.ts"

Deno.test("Writing words to txt file", () => {
  const filename = "./testwords.txt";

  try {
    Deno.removeSync(filename);
  } catch (e) { /**/ }

  Store(filename, ["a", "bb", "ccc"]);

  const result = Deno.readTextFileSync(filename);
  assertEquals(result, "a\nbb\nccc");
});



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
