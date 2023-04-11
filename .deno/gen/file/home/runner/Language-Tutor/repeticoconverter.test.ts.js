import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { Store } from "./modules/TxtAdapter.ts";
import { Parse } from "./modules/repeticoconverter/CmdlinePortal.ts";
import { Load } from "./modules/repeticoconverter/RepeticoJsonAdapter.ts";
import { Map } from "./modules/repeticoconverter/ConverterCore.ts";
// TxtAdapter
Deno.test("Writing words to txt file", ()=>{
    const filename = "./testwords.txt";
    try {
        Deno.removeSync(filename);
    } catch (e) {}
    Store(filename, [
        "a",
        "bb",
        "ccc"
    ]);
    const result = Deno.readTextFileSync(filename);
    assertEquals(result, "a\nbb\nccc");
});
// CmdlinePortal
Deno.test('Parse should throw an error if less than 2 arguments are provided', ()=>{
    const args = [];
    try {
        Parse(args);
        // If no error is thrown, the test should fail
        assertEquals(true, false);
    } catch (error) {
        assertEquals(error.message, 'Missing JSON filename as first parameter on command line.');
    }
});
Deno.test('Parse should return the correct filepaths for valid arguments', ()=>{
    const args = [
        './abc/data.json'
    ];
    const expected = {
        jsonFilepath: './abc/data.json',
        txtFilepath: './abc/data.txt'
    };
    const result = Parse(args);
    assertEquals(result, expected);
});
// RepeticoJsonAdapter
Deno.test('Load should return an empty array if the file is empty', ()=>{
    const filename = './repetico_empty.json';
    const result = Load(filename);
    assertEquals(result, []);
});
Deno.test('Load should return an array of Flashcard objects for valid JSON data', ()=>{
    const filename = './repetico_sample.json';
    const expected = [
        {
            question: '<p>der / die</p>',
            answer: '<p>el / la</p>'
        },
        {
            question: '<p>ein / eine</p>',
            answer: '<p>un / una</p>'
        },
        {
            question: 'müde<br><br>Ich bin müde nach einem ganzen Tag Arbeit.',
            answer: 'cansada <br><br>Estoy cansada después de trabajar todo el día.'
        }
    ];
    const result = Load(filename);
    assertEquals(result, expected);
});
Deno.test('Load should throw an error if the file does not exist', ()=>{
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
Deno.test('Map should return an array of strings with the answer values', ()=>{
    const flashcards = [
        {
            question: 'q1',
            answer: 'a1'
        },
        {
            question: 'q2',
            answer: 'a2 a2'
        },
        {
            question: 'q3',
            answer: 'a3 a3 a3'
        }
    ];
    const expected = [
        "a1",
        "a2 a2",
        "a3 a3 a3"
    ];
    const result = Map(flashcards);
    assertEquals(result, expected);
});
Deno.test('Map should extract only the first line of the answer', ()=>{
    const flashcards = [
        {
            question: 'q1',
            answer: '<div>a1</div>'
        },
        {
            question: 'q2',
            answer: '<p>a2</p>and more'
        },
        {
            question: 'q3',
            answer: '<span>a3</span><br>and more'
        },
        {
            question: 'q4',
            answer: '<span style="abc">a4</span>'
        }
    ];
    const expected = [
        "a1",
        "a2",
        "a3",
        "a4"
    ];
    const result = Map(flashcards);
    assertEquals(result, expected);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvTGFuZ3VhZ2UtVHV0b3IvcmVwZXRpY29jb252ZXJ0ZXIudGVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuMTgyLjAvdGVzdGluZy9hc3NlcnRzLnRzXCI7XG5cbmltcG9ydCB7IFN0b3JlIH0gZnJvbSBcIi4vbW9kdWxlcy9UeHRBZGFwdGVyLnRzXCI7XG5pbXBvcnQgeyBQYXJzZSwgQ21kbGluZVBhcmFtcyB9IGZyb20gXCIuL21vZHVsZXMvcmVwZXRpY29jb252ZXJ0ZXIvQ21kbGluZVBvcnRhbC50c1wiXG5pbXBvcnQgeyBMb2FkLCBGbGFzaGNhcmQgfSBmcm9tIFwiLi9tb2R1bGVzL3JlcGV0aWNvY29udmVydGVyL1JlcGV0aWNvSnNvbkFkYXB0ZXIudHNcIlxuaW1wb3J0IHsgTWFwIH0gZnJvbSBcIi4vbW9kdWxlcy9yZXBldGljb2NvbnZlcnRlci9Db252ZXJ0ZXJDb3JlLnRzXCJcblxuLy8gVHh0QWRhcHRlclxuXG5EZW5vLnRlc3QoXCJXcml0aW5nIHdvcmRzIHRvIHR4dCBmaWxlXCIsICgpID0+IHtcbiAgY29uc3QgZmlsZW5hbWUgPSBcIi4vdGVzdHdvcmRzLnR4dFwiO1xuXG4gIHRyeSB7XG4gICAgRGVuby5yZW1vdmVTeW5jKGZpbGVuYW1lKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiovIH1cblxuICBTdG9yZShmaWxlbmFtZSwgW1wiYVwiLCBcImJiXCIsIFwiY2NjXCJdKTtcblxuICBjb25zdCByZXN1bHQgPSBEZW5vLnJlYWRUZXh0RmlsZVN5bmMoZmlsZW5hbWUpO1xuICBhc3NlcnRFcXVhbHMocmVzdWx0LCBcImFcXG5iYlxcbmNjY1wiKTtcbn0pO1xuXG4vLyBDbWRsaW5lUG9ydGFsXG5cbkRlbm8udGVzdCgnUGFyc2Ugc2hvdWxkIHRocm93IGFuIGVycm9yIGlmIGxlc3MgdGhhbiAyIGFyZ3VtZW50cyBhcmUgcHJvdmlkZWQnLCAoKSA9PiB7XG4gIGNvbnN0IGFyZ3M6IHN0cmluZ1tdID0gW107XG4gIHRyeSB7XG4gICAgUGFyc2UoYXJncyk7XG4gICAgLy8gSWYgbm8gZXJyb3IgaXMgdGhyb3duLCB0aGUgdGVzdCBzaG91bGQgZmFpbFxuICAgIGFzc2VydEVxdWFscyh0cnVlLCBmYWxzZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYXNzZXJ0RXF1YWxzKGVycm9yLm1lc3NhZ2UsICdNaXNzaW5nIEpTT04gZmlsZW5hbWUgYXMgZmlyc3QgcGFyYW1ldGVyIG9uIGNvbW1hbmQgbGluZS4nKTtcbiAgfVxufSk7XG5cbkRlbm8udGVzdCgnUGFyc2Ugc2hvdWxkIHJldHVybiB0aGUgY29ycmVjdCBmaWxlcGF0aHMgZm9yIHZhbGlkIGFyZ3VtZW50cycsICgpID0+IHtcbiAgY29uc3QgYXJnczogc3RyaW5nW10gPSBbJy4vYWJjL2RhdGEuanNvbiddO1xuICBjb25zdCBleHBlY3RlZDogQ21kbGluZVBhcmFtcyA9IHtcbiAgICBqc29uRmlsZXBhdGg6ICcuL2FiYy9kYXRhLmpzb24nLFxuICAgIHR4dEZpbGVwYXRoOiAnLi9hYmMvZGF0YS50eHQnLFxuICB9O1xuICBjb25zdCByZXN1bHQgPSBQYXJzZShhcmdzKTtcbiAgYXNzZXJ0RXF1YWxzKHJlc3VsdCwgZXhwZWN0ZWQpO1xufSk7XG5cblxuLy8gUmVwZXRpY29Kc29uQWRhcHRlclxuXG5EZW5vLnRlc3QoJ0xvYWQgc2hvdWxkIHJldHVybiBhbiBlbXB0eSBhcnJheSBpZiB0aGUgZmlsZSBpcyBlbXB0eScsICgpID0+IHtcbiAgY29uc3QgZmlsZW5hbWUgPSAnLi9yZXBldGljb19lbXB0eS5qc29uJztcbiAgY29uc3QgcmVzdWx0ID0gTG9hZChmaWxlbmFtZSk7XG4gIGFzc2VydEVxdWFscyhyZXN1bHQsIFtdKTtcbn0pO1xuXG5EZW5vLnRlc3QoJ0xvYWQgc2hvdWxkIHJldHVybiBhbiBhcnJheSBvZiBGbGFzaGNhcmQgb2JqZWN0cyBmb3IgdmFsaWQgSlNPTiBkYXRhJywgKCkgPT4ge1xuICBjb25zdCBmaWxlbmFtZSA9ICcuL3JlcGV0aWNvX3NhbXBsZS5qc29uJztcbiAgY29uc3QgZXhwZWN0ZWQgPSBbXG4gICAge1xuICAgICAgcXVlc3Rpb246ICc8cD5kZXIgLyBkaWU8L3A+JyxcbiAgICAgIGFuc3dlcjogJzxwPmVsIC8gbGE8L3A+JyxcbiAgICB9LFxuICAgIHtcbiAgICAgIHF1ZXN0aW9uOiAnPHA+ZWluIC8gZWluZTwvcD4nLFxuICAgICAgYW5zd2VyOiAnPHA+dW4gLyB1bmE8L3A+JyxcbiAgICB9LFxuICAgIHtcbiAgICAgIHF1ZXN0aW9uOiAnbcO8ZGU8YnI+PGJyPkljaCBiaW4gbcO8ZGUgbmFjaCBlaW5lbSBnYW56ZW4gVGFnIEFyYmVpdC4nLFxuICAgICAgYW5zd2VyOiAnY2Fuc2FkYSA8YnI+PGJyPkVzdG95IGNhbnNhZGEgZGVzcHXDqXMgZGUgdHJhYmFqYXIgdG9kbyBlbCBkw61hLicsXG4gICAgfSxcbiAgXTtcbiAgY29uc3QgcmVzdWx0ID0gTG9hZChmaWxlbmFtZSk7XG4gIGFzc2VydEVxdWFscyhyZXN1bHQsIGV4cGVjdGVkKTtcbn0pO1xuXG5EZW5vLnRlc3QoJ0xvYWQgc2hvdWxkIHRocm93IGFuIGVycm9yIGlmIHRoZSBmaWxlIGRvZXMgbm90IGV4aXN0JywgKCkgPT4ge1xuICBjb25zdCBmaWxlbmFtZSA9ICdub25leGlzdGVudC5qc29uJztcbiAgdHJ5IHtcbiAgICBMb2FkKGZpbGVuYW1lKTtcbiAgICAvLyBJZiBubyBlcnJvciBpcyB0aHJvd24sIHRoZSB0ZXN0IHNob3VsZCBmYWlsXG4gICAgYXNzZXJ0RXF1YWxzKHRydWUsIGZhbHNlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBhc3NlcnRFcXVhbHMoZXJyb3IubWVzc2FnZSwgYE5vIHN1Y2ggZmlsZSBvciBkaXJlY3Rvcnk6ICR7ZmlsZW5hbWV9YCk7XG4gIH1cbn0pO1xuXG4vLyBDb252ZXJ0ZXJDb3JlXG5cbkRlbm8udGVzdCgnTWFwIHNob3VsZCByZXR1cm4gYW4gYXJyYXkgb2Ygc3RyaW5ncyB3aXRoIHRoZSBhbnN3ZXIgdmFsdWVzJywgKCkgPT4ge1xuICBjb25zdCBmbGFzaGNhcmRzOiBGbGFzaGNhcmRbXSA9IFtcbiAgICB7XG4gICAgICBxdWVzdGlvbjogJ3ExJyxcbiAgICAgIGFuc3dlcjogJ2ExJyxcbiAgICB9LFxuICAgIHtcbiAgICAgIHF1ZXN0aW9uOiAncTInLFxuICAgICAgYW5zd2VyOiAnYTIgYTInLFxuICAgIH0sXG4gICAge1xuICAgICAgcXVlc3Rpb246ICdxMycsXG4gICAgICBhbnN3ZXI6ICdhMyBhMyBhMycsXG4gICAgfSxcbiAgXTtcbiAgY29uc3QgZXhwZWN0ZWQgPSBbXCJhMVwiLCBcImEyIGEyXCIsIFwiYTMgYTMgYTNcIl07XG4gIGNvbnN0IHJlc3VsdCA9IE1hcChmbGFzaGNhcmRzKTtcbiAgYXNzZXJ0RXF1YWxzKHJlc3VsdCwgZXhwZWN0ZWQpO1xufSk7XG5cblxuRGVuby50ZXN0KCdNYXAgc2hvdWxkIGV4dHJhY3Qgb25seSB0aGUgZmlyc3QgbGluZSBvZiB0aGUgYW5zd2VyJywgKCkgPT4ge1xuICBjb25zdCBmbGFzaGNhcmRzOiBGbGFzaGNhcmRbXSA9IFtcbiAgICB7XG4gICAgICBxdWVzdGlvbjogJ3ExJyxcbiAgICAgIGFuc3dlcjogJzxkaXY+YTE8L2Rpdj4nLFxuICAgIH0sXG4gICAge1xuICAgICAgcXVlc3Rpb246ICdxMicsXG4gICAgICBhbnN3ZXI6ICc8cD5hMjwvcD5hbmQgbW9yZScsXG4gICAgfSxcbiAgICB7XG4gICAgICBxdWVzdGlvbjogJ3EzJyxcbiAgICAgIGFuc3dlcjogJzxzcGFuPmEzPC9zcGFuPjxicj5hbmQgbW9yZScsXG4gICAgfSxcbiAgICB7XG4gICAgICBxdWVzdGlvbjogJ3E0JyxcbiAgICAgIGFuc3dlcjogJzxzcGFuIHN0eWxlPVwiYWJjXCI+YTQ8L3NwYW4+JyxcbiAgICB9LFxuICBdO1xuICBjb25zdCBleHBlY3RlZCA9IFtcImExXCIsIFwiYTJcIiwgXCJhM1wiLCBcImE0XCJdO1xuICBjb25zdCByZXN1bHQgPSBNYXAoZmxhc2hjYXJkcyk7XG4gIGFzc2VydEVxdWFscyhyZXN1bHQsIGV4cGVjdGVkKTtcbn0pOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLFlBQVksUUFBUSxtREFBbUQ7QUFFaEYsU0FBUyxLQUFLLFFBQVEsMEJBQTBCO0FBQ2hELFNBQVMsS0FBSyxRQUF1QiwrQ0FBOEM7QUFDbkYsU0FBUyxJQUFJLFFBQW1CLHFEQUFvRDtBQUNwRixTQUFTLEdBQUcsUUFBUSwrQ0FBOEM7QUFFbEUsYUFBYTtBQUViLEtBQUssSUFBSSxDQUFDLDZCQUE2QixJQUFNO0lBQzNDLE1BQU0sV0FBVztJQUVqQixJQUFJO1FBQ0YsS0FBSyxVQUFVLENBQUM7SUFDbEIsRUFBRSxPQUFPLEdBQUcsQ0FBTztJQUVuQixNQUFNLFVBQVU7UUFBQztRQUFLO1FBQU07S0FBTTtJQUVsQyxNQUFNLFNBQVMsS0FBSyxnQkFBZ0IsQ0FBQztJQUNyQyxhQUFhLFFBQVE7QUFDdkI7QUFFQSxnQkFBZ0I7QUFFaEIsS0FBSyxJQUFJLENBQUMscUVBQXFFLElBQU07SUFDbkYsTUFBTSxPQUFpQixFQUFFO0lBQ3pCLElBQUk7UUFDRixNQUFNO1FBQ04sOENBQThDO1FBQzlDLGFBQWEsSUFBSSxFQUFFLEtBQUs7SUFDMUIsRUFBRSxPQUFPLE9BQU87UUFDZCxhQUFhLE1BQU0sT0FBTyxFQUFFO0lBQzlCO0FBQ0Y7QUFFQSxLQUFLLElBQUksQ0FBQyxpRUFBaUUsSUFBTTtJQUMvRSxNQUFNLE9BQWlCO1FBQUM7S0FBa0I7SUFDMUMsTUFBTSxXQUEwQjtRQUM5QixjQUFjO1FBQ2QsYUFBYTtJQUNmO0lBQ0EsTUFBTSxTQUFTLE1BQU07SUFDckIsYUFBYSxRQUFRO0FBQ3ZCO0FBR0Esc0JBQXNCO0FBRXRCLEtBQUssSUFBSSxDQUFDLDBEQUEwRCxJQUFNO0lBQ3hFLE1BQU0sV0FBVztJQUNqQixNQUFNLFNBQVMsS0FBSztJQUNwQixhQUFhLFFBQVEsRUFBRTtBQUN6QjtBQUVBLEtBQUssSUFBSSxDQUFDLHdFQUF3RSxJQUFNO0lBQ3RGLE1BQU0sV0FBVztJQUNqQixNQUFNLFdBQVc7UUFDZjtZQUNFLFVBQVU7WUFDVixRQUFRO1FBQ1Y7UUFDQTtZQUNFLFVBQVU7WUFDVixRQUFRO1FBQ1Y7UUFDQTtZQUNFLFVBQVU7WUFDVixRQUFRO1FBQ1Y7S0FDRDtJQUNELE1BQU0sU0FBUyxLQUFLO0lBQ3BCLGFBQWEsUUFBUTtBQUN2QjtBQUVBLEtBQUssSUFBSSxDQUFDLHlEQUF5RCxJQUFNO0lBQ3ZFLE1BQU0sV0FBVztJQUNqQixJQUFJO1FBQ0YsS0FBSztRQUNMLDhDQUE4QztRQUM5QyxhQUFhLElBQUksRUFBRSxLQUFLO0lBQzFCLEVBQUUsT0FBTyxPQUFPO1FBQ2QsYUFBYSxNQUFNLE9BQU8sRUFBRSxDQUFDLDJCQUEyQixFQUFFLFNBQVMsQ0FBQztJQUN0RTtBQUNGO0FBRUEsZ0JBQWdCO0FBRWhCLEtBQUssSUFBSSxDQUFDLGdFQUFnRSxJQUFNO0lBQzlFLE1BQU0sYUFBMEI7UUFDOUI7WUFDRSxVQUFVO1lBQ1YsUUFBUTtRQUNWO1FBQ0E7WUFDRSxVQUFVO1lBQ1YsUUFBUTtRQUNWO1FBQ0E7WUFDRSxVQUFVO1lBQ1YsUUFBUTtRQUNWO0tBQ0Q7SUFDRCxNQUFNLFdBQVc7UUFBQztRQUFNO1FBQVM7S0FBVztJQUM1QyxNQUFNLFNBQVMsSUFBSTtJQUNuQixhQUFhLFFBQVE7QUFDdkI7QUFHQSxLQUFLLElBQUksQ0FBQyx3REFBd0QsSUFBTTtJQUN0RSxNQUFNLGFBQTBCO1FBQzlCO1lBQ0UsVUFBVTtZQUNWLFFBQVE7UUFDVjtRQUNBO1lBQ0UsVUFBVTtZQUNWLFFBQVE7UUFDVjtRQUNBO1lBQ0UsVUFBVTtZQUNWLFFBQVE7UUFDVjtRQUNBO1lBQ0UsVUFBVTtZQUNWLFFBQVE7UUFDVjtLQUNEO0lBQ0QsTUFBTSxXQUFXO1FBQUM7UUFBTTtRQUFNO1FBQU07S0FBSztJQUN6QyxNQUFNLFNBQVMsSUFBSTtJQUNuQixhQUFhLFFBQVE7QUFDdkIifQ==