import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Load } from "../modules/TxtAdapter.ts";
import { SelectWords } from "../modules/qa/QACore.ts";
// TxtAdapter
Deno.test("Load function loads words from file", ()=>{
    const expectedWords = [
        "word1",
        "word2",
        "word3"
    ];
    const actualWords = Load("./tests/words.txt");
    assertEquals(actualWords, expectedWords);
});
Deno.test("Load function returns empty array if file is empty", ()=>{
    const expectedWords = [];
    const actualWords = Load("./tests/nowords.txt");
    assertEquals(actualWords, expectedWords);
});
// QACore
Deno.test("SelectWords function selects all words if there are fewer words than to select", ()=>{
    const words = [
        "word1",
        "word2",
        "word3"
    ];
    const numberOfWords = 4;
    const selectedWords = SelectWords(words, numberOfWords);
    assertEquals(selectedWords, words);
});
Deno.test("SelectWords function selects the correct number of words if there are more words than to select", ()=>{
    const words = [
        "word1",
        "word2",
        "word3",
        "word4",
        "word5"
    ];
    const numberOfWords = 3;
    const selectedWords = SelectWords(words, numberOfWords);
    assertEquals(selectedWords.length, numberOfWords);
    selectedWords.forEach((word)=>assertEquals(words.includes(word), true));
});
Deno.test("SelectWords function does not select the same word multiple times", ()=>{
    const words = [
        "word1",
        "word2",
        "word3",
        "word4",
        "word5"
    ];
    const numberOfWords = 3;
    const selectedWords = SelectWords(words, numberOfWords);
    const uniqueWords = Array.from(new Set(selectedWords));
    assertEquals(selectedWords.length, uniqueWords.length);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvTGFuZ3VhZ2UtVHV0b3IvdGVzdHMvcWEudGVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkL3Rlc3RpbmcvYXNzZXJ0cy50c1wiO1xuXG5pbXBvcnQgeyBMb2FkIH0gZnJvbSBcIi4uL21vZHVsZXMvVHh0QWRhcHRlci50c1wiXG5pbXBvcnQgeyBTZWxlY3RXb3JkcyB9IGZyb20gXCIuLi9tb2R1bGVzL3FhL1FBQ29yZS50c1wiO1xuXG4vLyBUeHRBZGFwdGVyXG5cbkRlbm8udGVzdChcIkxvYWQgZnVuY3Rpb24gbG9hZHMgd29yZHMgZnJvbSBmaWxlXCIsICgpID0+IHtcbiAgY29uc3QgZXhwZWN0ZWRXb3JkcyA9IFtcIndvcmQxXCIsIFwid29yZDJcIiwgXCJ3b3JkM1wiXTtcbiAgY29uc3QgYWN0dWFsV29yZHMgPSBMb2FkKFwiLi90ZXN0cy93b3Jkcy50eHRcIik7XG4gIGFzc2VydEVxdWFscyhhY3R1YWxXb3JkcywgZXhwZWN0ZWRXb3Jkcyk7XG59KTtcblxuRGVuby50ZXN0KFwiTG9hZCBmdW5jdGlvbiByZXR1cm5zIGVtcHR5IGFycmF5IGlmIGZpbGUgaXMgZW1wdHlcIiwgKCkgPT4ge1xuICBjb25zdCBleHBlY3RlZFdvcmRzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBhY3R1YWxXb3JkcyA9IExvYWQoXCIuL3Rlc3RzL25vd29yZHMudHh0XCIpO1xuICBhc3NlcnRFcXVhbHMoYWN0dWFsV29yZHMsIGV4cGVjdGVkV29yZHMpO1xufSk7XG5cblxuLy8gUUFDb3JlXG5EZW5vLnRlc3QoXCJTZWxlY3RXb3JkcyBmdW5jdGlvbiBzZWxlY3RzIGFsbCB3b3JkcyBpZiB0aGVyZSBhcmUgZmV3ZXIgd29yZHMgdGhhbiB0byBzZWxlY3RcIiwgKCkgPT4ge1xuICBjb25zdCB3b3JkcyA9IFtcIndvcmQxXCIsIFwid29yZDJcIiwgXCJ3b3JkM1wiXTtcbiAgY29uc3QgbnVtYmVyT2ZXb3JkcyA9IDQ7XG4gIGNvbnN0IHNlbGVjdGVkV29yZHMgPSBTZWxlY3RXb3Jkcyh3b3JkcywgbnVtYmVyT2ZXb3Jkcyk7XG4gIGFzc2VydEVxdWFscyhzZWxlY3RlZFdvcmRzLCB3b3Jkcyk7XG59KTtcblxuRGVuby50ZXN0KFwiU2VsZWN0V29yZHMgZnVuY3Rpb24gc2VsZWN0cyB0aGUgY29ycmVjdCBudW1iZXIgb2Ygd29yZHMgaWYgdGhlcmUgYXJlIG1vcmUgd29yZHMgdGhhbiB0byBzZWxlY3RcIiwgKCkgPT4ge1xuICBjb25zdCB3b3JkcyA9IFtcIndvcmQxXCIsIFwid29yZDJcIiwgXCJ3b3JkM1wiLCBcIndvcmQ0XCIsIFwid29yZDVcIl07XG4gIGNvbnN0IG51bWJlck9mV29yZHMgPSAzO1xuICBjb25zdCBzZWxlY3RlZFdvcmRzID0gU2VsZWN0V29yZHMod29yZHMsIG51bWJlck9mV29yZHMpO1xuICBhc3NlcnRFcXVhbHMoc2VsZWN0ZWRXb3Jkcy5sZW5ndGgsIG51bWJlck9mV29yZHMpO1xuICBzZWxlY3RlZFdvcmRzLmZvckVhY2god29yZCA9PiBhc3NlcnRFcXVhbHMod29yZHMuaW5jbHVkZXMod29yZCksIHRydWUpKTtcbn0pO1xuXG5EZW5vLnRlc3QoXCJTZWxlY3RXb3JkcyBmdW5jdGlvbiBkb2VzIG5vdCBzZWxlY3QgdGhlIHNhbWUgd29yZCBtdWx0aXBsZSB0aW1lc1wiLCAoKSA9PiB7XG4gIGNvbnN0IHdvcmRzID0gW1wid29yZDFcIiwgXCJ3b3JkMlwiLCBcIndvcmQzXCIsIFwid29yZDRcIiwgXCJ3b3JkNVwiXTtcbiAgY29uc3QgbnVtYmVyT2ZXb3JkcyA9IDM7XG4gIGNvbnN0IHNlbGVjdGVkV29yZHMgPSBTZWxlY3RXb3Jkcyh3b3JkcywgbnVtYmVyT2ZXb3Jkcyk7XG4gIGNvbnN0IHVuaXF1ZVdvcmRzID0gQXJyYXkuZnJvbShuZXcgU2V0KHNlbGVjdGVkV29yZHMpKTtcbiAgYXNzZXJ0RXF1YWxzKHNlbGVjdGVkV29yZHMubGVuZ3RoLCB1bmlxdWVXb3Jkcy5sZW5ndGgpO1xufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxZQUFZLFFBQVEsMkNBQTJDO0FBRXhFLFNBQVMsSUFBSSxRQUFRLDJCQUEwQjtBQUMvQyxTQUFTLFdBQVcsUUFBUSwwQkFBMEI7QUFFdEQsYUFBYTtBQUViLEtBQUssSUFBSSxDQUFDLHVDQUF1QyxJQUFNO0lBQ3JELE1BQU0sZ0JBQWdCO1FBQUM7UUFBUztRQUFTO0tBQVE7SUFDakQsTUFBTSxjQUFjLEtBQUs7SUFDekIsYUFBYSxhQUFhO0FBQzVCO0FBRUEsS0FBSyxJQUFJLENBQUMsc0RBQXNELElBQU07SUFDcEUsTUFBTSxnQkFBMEIsRUFBRTtJQUNsQyxNQUFNLGNBQWMsS0FBSztJQUN6QixhQUFhLGFBQWE7QUFDNUI7QUFHQSxTQUFTO0FBQ1QsS0FBSyxJQUFJLENBQUMsa0ZBQWtGLElBQU07SUFDaEcsTUFBTSxRQUFRO1FBQUM7UUFBUztRQUFTO0tBQVE7SUFDekMsTUFBTSxnQkFBZ0I7SUFDdEIsTUFBTSxnQkFBZ0IsWUFBWSxPQUFPO0lBQ3pDLGFBQWEsZUFBZTtBQUM5QjtBQUVBLEtBQUssSUFBSSxDQUFDLG1HQUFtRyxJQUFNO0lBQ2pILE1BQU0sUUFBUTtRQUFDO1FBQVM7UUFBUztRQUFTO1FBQVM7S0FBUTtJQUMzRCxNQUFNLGdCQUFnQjtJQUN0QixNQUFNLGdCQUFnQixZQUFZLE9BQU87SUFDekMsYUFBYSxjQUFjLE1BQU0sRUFBRTtJQUNuQyxjQUFjLE9BQU8sQ0FBQyxDQUFBLE9BQVEsYUFBYSxNQUFNLFFBQVEsQ0FBQyxPQUFPLElBQUk7QUFDdkU7QUFFQSxLQUFLLElBQUksQ0FBQyxxRUFBcUUsSUFBTTtJQUNuRixNQUFNLFFBQVE7UUFBQztRQUFTO1FBQVM7UUFBUztRQUFTO0tBQVE7SUFDM0QsTUFBTSxnQkFBZ0I7SUFDdEIsTUFBTSxnQkFBZ0IsWUFBWSxPQUFPO0lBQ3pDLE1BQU0sY0FBYyxNQUFNLElBQUksQ0FBQyxJQUFJLElBQUk7SUFDdkMsYUFBYSxjQUFjLE1BQU0sRUFBRSxZQUFZLE1BQU07QUFDdkQifQ==