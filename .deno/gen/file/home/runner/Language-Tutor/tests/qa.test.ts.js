import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Load } from "../modules/TxtAdapter.ts";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvTGFuZ3VhZ2UtVHV0b3IvdGVzdHMvcWEudGVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkL3Rlc3RpbmcvYXNzZXJ0cy50c1wiO1xuXG5pbXBvcnQgeyBMb2FkIH0gZnJvbSBcIi4uL21vZHVsZXMvVHh0QWRhcHRlci50c1wiXG5cbi8vIFR4dEFkYXB0ZXJcblxuRGVuby50ZXN0KFwiTG9hZCBmdW5jdGlvbiBsb2FkcyB3b3JkcyBmcm9tIGZpbGVcIiwgKCkgPT4ge1xuICBjb25zdCBleHBlY3RlZFdvcmRzID0gW1wid29yZDFcIiwgXCJ3b3JkMlwiLCBcIndvcmQzXCJdO1xuICBjb25zdCBhY3R1YWxXb3JkcyA9IExvYWQoXCIuL3Rlc3RzL3dvcmRzLnR4dFwiKTtcbiAgYXNzZXJ0RXF1YWxzKGFjdHVhbFdvcmRzLCBleHBlY3RlZFdvcmRzKTtcbn0pO1xuXG5EZW5vLnRlc3QoXCJMb2FkIGZ1bmN0aW9uIHJldHVybnMgZW1wdHkgYXJyYXkgaWYgZmlsZSBpcyBlbXB0eVwiLCAoKSA9PiB7XG4gIGNvbnN0IGV4cGVjdGVkV29yZHM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGFjdHVhbFdvcmRzID0gTG9hZChcIi4vdGVzdHMvbm93b3Jkcy50eHRcIik7XG4gIGFzc2VydEVxdWFscyhhY3R1YWxXb3JkcywgZXhwZWN0ZWRXb3Jkcyk7XG59KTsiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxZQUFZLFFBQVEsMkNBQTJDO0FBRXhFLFNBQVMsSUFBSSxRQUFRLDJCQUEwQjtBQUUvQyxhQUFhO0FBRWIsS0FBSyxJQUFJLENBQUMsdUNBQXVDLElBQU07SUFDckQsTUFBTSxnQkFBZ0I7UUFBQztRQUFTO1FBQVM7S0FBUTtJQUNqRCxNQUFNLGNBQWMsS0FBSztJQUN6QixhQUFhLGFBQWE7QUFDNUI7QUFFQSxLQUFLLElBQUksQ0FBQyxzREFBc0QsSUFBTTtJQUNwRSxNQUFNLGdCQUEwQixFQUFFO0lBQ2xDLE1BQU0sY0FBYyxLQUFLO0lBQ3pCLGFBQWEsYUFBYTtBQUM1QiJ9