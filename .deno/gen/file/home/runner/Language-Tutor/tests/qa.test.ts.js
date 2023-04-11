import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Load } from "../modules/TxtAdapter.ts";
import { SelectWords } from "../modules/qa/QACore.ts";
import { InstantiatePrompt } from "../modules/qa/PromptAdapter.ts";
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
// PromptAdapter
Deno.test("InstantiatePromptForQuestions should return the correct prompt", ()=>{
    const words = [
        "X",
        "Y",
        "Z"
    ].join("\n");
    const result = InstantiatePrompt(`{A}-{B}
{C}
{B}`, {
        "A": "ES",
        "C": [
            "X",
            "Y",
            "Z"
        ].join("\n"),
        "B": 42
    });
    assertEquals(result, `ES-42
X
Y
Z
42`);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvTGFuZ3VhZ2UtVHV0b3IvdGVzdHMvcWEudGVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkL3Rlc3RpbmcvYXNzZXJ0cy50c1wiO1xuXG5pbXBvcnQgeyBMb2FkIH0gZnJvbSBcIi4uL21vZHVsZXMvVHh0QWRhcHRlci50c1wiXG5pbXBvcnQgeyBTZWxlY3RXb3JkcyB9IGZyb20gXCIuLi9tb2R1bGVzL3FhL1FBQ29yZS50c1wiO1xuaW1wb3J0IHsgSW5zdGFudGlhdGVQcm9tcHQgfSBmcm9tIFwiLi4vbW9kdWxlcy9xYS9Qcm9tcHRBZGFwdGVyLnRzXCI7XG5cbi8vIFR4dEFkYXB0ZXJcblxuRGVuby50ZXN0KFwiTG9hZCBmdW5jdGlvbiBsb2FkcyB3b3JkcyBmcm9tIGZpbGVcIiwgKCkgPT4ge1xuICBjb25zdCBleHBlY3RlZFdvcmRzID0gW1wid29yZDFcIiwgXCJ3b3JkMlwiLCBcIndvcmQzXCJdO1xuICBjb25zdCBhY3R1YWxXb3JkcyA9IExvYWQoXCIuL3Rlc3RzL3dvcmRzLnR4dFwiKTtcbiAgYXNzZXJ0RXF1YWxzKGFjdHVhbFdvcmRzLCBleHBlY3RlZFdvcmRzKTtcbn0pO1xuXG5EZW5vLnRlc3QoXCJMb2FkIGZ1bmN0aW9uIHJldHVybnMgZW1wdHkgYXJyYXkgaWYgZmlsZSBpcyBlbXB0eVwiLCAoKSA9PiB7XG4gIGNvbnN0IGV4cGVjdGVkV29yZHM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGFjdHVhbFdvcmRzID0gTG9hZChcIi4vdGVzdHMvbm93b3Jkcy50eHRcIik7XG4gIGFzc2VydEVxdWFscyhhY3R1YWxXb3JkcywgZXhwZWN0ZWRXb3Jkcyk7XG59KTtcblxuXG4vLyBRQUNvcmVcbkRlbm8udGVzdChcIlNlbGVjdFdvcmRzIGZ1bmN0aW9uIHNlbGVjdHMgYWxsIHdvcmRzIGlmIHRoZXJlIGFyZSBmZXdlciB3b3JkcyB0aGFuIHRvIHNlbGVjdFwiLCAoKSA9PiB7XG4gIGNvbnN0IHdvcmRzID0gW1wid29yZDFcIiwgXCJ3b3JkMlwiLCBcIndvcmQzXCJdO1xuICBjb25zdCBudW1iZXJPZldvcmRzID0gNDtcbiAgY29uc3Qgc2VsZWN0ZWRXb3JkcyA9IFNlbGVjdFdvcmRzKHdvcmRzLCBudW1iZXJPZldvcmRzKTtcbiAgYXNzZXJ0RXF1YWxzKHNlbGVjdGVkV29yZHMsIHdvcmRzKTtcbn0pO1xuXG5EZW5vLnRlc3QoXCJTZWxlY3RXb3JkcyBmdW5jdGlvbiBzZWxlY3RzIHRoZSBjb3JyZWN0IG51bWJlciBvZiB3b3JkcyBpZiB0aGVyZSBhcmUgbW9yZSB3b3JkcyB0aGFuIHRvIHNlbGVjdFwiLCAoKSA9PiB7XG4gIGNvbnN0IHdvcmRzID0gW1wid29yZDFcIiwgXCJ3b3JkMlwiLCBcIndvcmQzXCIsIFwid29yZDRcIiwgXCJ3b3JkNVwiXTtcbiAgY29uc3QgbnVtYmVyT2ZXb3JkcyA9IDM7XG4gIGNvbnN0IHNlbGVjdGVkV29yZHMgPSBTZWxlY3RXb3Jkcyh3b3JkcywgbnVtYmVyT2ZXb3Jkcyk7XG4gIGFzc2VydEVxdWFscyhzZWxlY3RlZFdvcmRzLmxlbmd0aCwgbnVtYmVyT2ZXb3Jkcyk7XG4gIHNlbGVjdGVkV29yZHMuZm9yRWFjaCh3b3JkID0+IGFzc2VydEVxdWFscyh3b3Jkcy5pbmNsdWRlcyh3b3JkKSwgdHJ1ZSkpO1xufSk7XG5cbkRlbm8udGVzdChcIlNlbGVjdFdvcmRzIGZ1bmN0aW9uIGRvZXMgbm90IHNlbGVjdCB0aGUgc2FtZSB3b3JkIG11bHRpcGxlIHRpbWVzXCIsICgpID0+IHtcbiAgY29uc3Qgd29yZHMgPSBbXCJ3b3JkMVwiLCBcIndvcmQyXCIsIFwid29yZDNcIiwgXCJ3b3JkNFwiLCBcIndvcmQ1XCJdO1xuICBjb25zdCBudW1iZXJPZldvcmRzID0gMztcbiAgY29uc3Qgc2VsZWN0ZWRXb3JkcyA9IFNlbGVjdFdvcmRzKHdvcmRzLCBudW1iZXJPZldvcmRzKTtcbiAgY29uc3QgdW5pcXVlV29yZHMgPSBBcnJheS5mcm9tKG5ldyBTZXQoc2VsZWN0ZWRXb3JkcykpO1xuICBhc3NlcnRFcXVhbHMoc2VsZWN0ZWRXb3Jkcy5sZW5ndGgsIHVuaXF1ZVdvcmRzLmxlbmd0aCk7XG59KTtcblxuLy8gUHJvbXB0QWRhcHRlclxuXG5cblxuRGVuby50ZXN0KFwiSW5zdGFudGlhdGVQcm9tcHRGb3JRdWVzdGlvbnMgc2hvdWxkIHJldHVybiB0aGUgY29ycmVjdCBwcm9tcHRcIiwgKCkgPT4ge1xuICBjb25zdCB3b3JkcyA9IFtcIlhcIixcIllcIiwgXCJaXCJdLmpvaW4oXCJcXG5cIik7XG4gIFxuICBjb25zdCByZXN1bHQgPSBJbnN0YW50aWF0ZVByb21wdChge0F9LXtCfVxue0N9XG57Qn1gLCB7XG4gICAgXCJBXCI6IFwiRVNcIixcbiAgICBcIkNcIjogW1wiWFwiLFwiWVwiLCBcIlpcIl0uam9pbihcIlxcblwiKSxcbiAgICBcIkJcIjogNDJcbiAgfSlcblxuICBhc3NlcnRFcXVhbHMocmVzdWx0LCBgRVMtNDJcblhcbllcblpcbjQyYCk7XG59KTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLFlBQVksUUFBUSwyQ0FBMkM7QUFFeEUsU0FBUyxJQUFJLFFBQVEsMkJBQTBCO0FBQy9DLFNBQVMsV0FBVyxRQUFRLDBCQUEwQjtBQUN0RCxTQUFTLGlCQUFpQixRQUFRLGlDQUFpQztBQUVuRSxhQUFhO0FBRWIsS0FBSyxJQUFJLENBQUMsdUNBQXVDLElBQU07SUFDckQsTUFBTSxnQkFBZ0I7UUFBQztRQUFTO1FBQVM7S0FBUTtJQUNqRCxNQUFNLGNBQWMsS0FBSztJQUN6QixhQUFhLGFBQWE7QUFDNUI7QUFFQSxLQUFLLElBQUksQ0FBQyxzREFBc0QsSUFBTTtJQUNwRSxNQUFNLGdCQUEwQixFQUFFO0lBQ2xDLE1BQU0sY0FBYyxLQUFLO0lBQ3pCLGFBQWEsYUFBYTtBQUM1QjtBQUdBLFNBQVM7QUFDVCxLQUFLLElBQUksQ0FBQyxrRkFBa0YsSUFBTTtJQUNoRyxNQUFNLFFBQVE7UUFBQztRQUFTO1FBQVM7S0FBUTtJQUN6QyxNQUFNLGdCQUFnQjtJQUN0QixNQUFNLGdCQUFnQixZQUFZLE9BQU87SUFDekMsYUFBYSxlQUFlO0FBQzlCO0FBRUEsS0FBSyxJQUFJLENBQUMsbUdBQW1HLElBQU07SUFDakgsTUFBTSxRQUFRO1FBQUM7UUFBUztRQUFTO1FBQVM7UUFBUztLQUFRO0lBQzNELE1BQU0sZ0JBQWdCO0lBQ3RCLE1BQU0sZ0JBQWdCLFlBQVksT0FBTztJQUN6QyxhQUFhLGNBQWMsTUFBTSxFQUFFO0lBQ25DLGNBQWMsT0FBTyxDQUFDLENBQUEsT0FBUSxhQUFhLE1BQU0sUUFBUSxDQUFDLE9BQU8sSUFBSTtBQUN2RTtBQUVBLEtBQUssSUFBSSxDQUFDLHFFQUFxRSxJQUFNO0lBQ25GLE1BQU0sUUFBUTtRQUFDO1FBQVM7UUFBUztRQUFTO1FBQVM7S0FBUTtJQUMzRCxNQUFNLGdCQUFnQjtJQUN0QixNQUFNLGdCQUFnQixZQUFZLE9BQU87SUFDekMsTUFBTSxjQUFjLE1BQU0sSUFBSSxDQUFDLElBQUksSUFBSTtJQUN2QyxhQUFhLGNBQWMsTUFBTSxFQUFFLFlBQVksTUFBTTtBQUN2RDtBQUVBLGdCQUFnQjtBQUloQixLQUFLLElBQUksQ0FBQyxrRUFBa0UsSUFBTTtJQUNoRixNQUFNLFFBQVE7UUFBQztRQUFJO1FBQUs7S0FBSSxDQUFDLElBQUksQ0FBQztJQUVsQyxNQUFNLFNBQVMsa0JBQWtCLENBQUM7O0dBRWpDLENBQUMsRUFBRTtRQUNGLEtBQUs7UUFDTCxLQUFLO1lBQUM7WUFBSTtZQUFLO1NBQUksQ0FBQyxJQUFJLENBQUM7UUFDekIsS0FBSztJQUNQO0lBRUEsYUFBYSxRQUFRLENBQUM7Ozs7RUFJdEIsQ0FBQztBQUNIIn0=