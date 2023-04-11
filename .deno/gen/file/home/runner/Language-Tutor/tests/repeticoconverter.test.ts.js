import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { Store } from "../modules/TxtAdapter.ts";
import { Parse } from "../modules/repeticoconverter/CmdlinePortal.ts";
import { Load } from "../modules/repeticoconverter/RepeticoJsonAdapter.ts";
import { Map } from "../modules/repeticoconverter/ConverterCore.ts";
// TxtAdapter
Deno.test("Writing words to txt file", ()=>{
    const filename = "./tests/testwords.txt";
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
    const filename = './tests/repetico_empty.json';
    const result = Load(filename);
    assertEquals(result, []);
});
Deno.test('Load should return an array of Flashcard objects for valid JSON data', ()=>{
    const filename = './tests/repetico_sample.json';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvTGFuZ3VhZ2UtVHV0b3IvdGVzdHMvcmVwZXRpY29jb252ZXJ0ZXIudGVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuMTgyLjAvdGVzdGluZy9hc3NlcnRzLnRzXCI7XG5cbmltcG9ydCB7IFN0b3JlIH0gZnJvbSBcIi4uL21vZHVsZXMvVHh0QWRhcHRlci50c1wiO1xuaW1wb3J0IHsgUGFyc2UsIENtZGxpbmVQYXJhbXMgfSBmcm9tIFwiLi4vbW9kdWxlcy9yZXBldGljb2NvbnZlcnRlci9DbWRsaW5lUG9ydGFsLnRzXCJcbmltcG9ydCB7IExvYWQsIEZsYXNoY2FyZCB9IGZyb20gXCIuLi9tb2R1bGVzL3JlcGV0aWNvY29udmVydGVyL1JlcGV0aWNvSnNvbkFkYXB0ZXIudHNcIlxuaW1wb3J0IHsgTWFwIH0gZnJvbSBcIi4uL21vZHVsZXMvcmVwZXRpY29jb252ZXJ0ZXIvQ29udmVydGVyQ29yZS50c1wiXG5cbi8vIFR4dEFkYXB0ZXJcblxuRGVuby50ZXN0KFwiV3JpdGluZyB3b3JkcyB0byB0eHQgZmlsZVwiLCAoKSA9PiB7XG4gIGNvbnN0IGZpbGVuYW1lID0gXCIuL3Rlc3RzL3Rlc3R3b3Jkcy50eHRcIjtcblxuICB0cnkge1xuICAgIERlbm8ucmVtb3ZlU3luYyhmaWxlbmFtZSk7XG4gIH0gY2F0Y2ggKGUpIHsgLyoqLyB9XG5cbiAgU3RvcmUoZmlsZW5hbWUsIFtcImFcIiwgXCJiYlwiLCBcImNjY1wiXSk7XG5cbiAgY29uc3QgcmVzdWx0ID0gRGVuby5yZWFkVGV4dEZpbGVTeW5jKGZpbGVuYW1lKTtcbiAgYXNzZXJ0RXF1YWxzKHJlc3VsdCwgXCJhXFxuYmJcXG5jY2NcIik7XG59KTtcblxuLy8gQ21kbGluZVBvcnRhbFxuXG5EZW5vLnRlc3QoJ1BhcnNlIHNob3VsZCB0aHJvdyBhbiBlcnJvciBpZiBsZXNzIHRoYW4gMiBhcmd1bWVudHMgYXJlIHByb3ZpZGVkJywgKCkgPT4ge1xuICBjb25zdCBhcmdzOiBzdHJpbmdbXSA9IFtdO1xuICB0cnkge1xuICAgIFBhcnNlKGFyZ3MpO1xuICAgIC8vIElmIG5vIGVycm9yIGlzIHRocm93biwgdGhlIHRlc3Qgc2hvdWxkIGZhaWxcbiAgICBhc3NlcnRFcXVhbHModHJ1ZSwgZmFsc2UpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGFzc2VydEVxdWFscyhlcnJvci5tZXNzYWdlLCAnTWlzc2luZyBKU09OIGZpbGVuYW1lIGFzIGZpcnN0IHBhcmFtZXRlciBvbiBjb21tYW5kIGxpbmUuJyk7XG4gIH1cbn0pO1xuXG5EZW5vLnRlc3QoJ1BhcnNlIHNob3VsZCByZXR1cm4gdGhlIGNvcnJlY3QgZmlsZXBhdGhzIGZvciB2YWxpZCBhcmd1bWVudHMnLCAoKSA9PiB7XG4gIGNvbnN0IGFyZ3M6IHN0cmluZ1tdID0gWycuL2FiYy9kYXRhLmpzb24nXTtcbiAgY29uc3QgZXhwZWN0ZWQ6IENtZGxpbmVQYXJhbXMgPSB7XG4gICAganNvbkZpbGVwYXRoOiAnLi9hYmMvZGF0YS5qc29uJyxcbiAgICB0eHRGaWxlcGF0aDogJy4vYWJjL2RhdGEudHh0JyxcbiAgfTtcbiAgY29uc3QgcmVzdWx0ID0gUGFyc2UoYXJncyk7XG4gIGFzc2VydEVxdWFscyhyZXN1bHQsIGV4cGVjdGVkKTtcbn0pO1xuXG5cbi8vIFJlcGV0aWNvSnNvbkFkYXB0ZXJcblxuRGVuby50ZXN0KCdMb2FkIHNob3VsZCByZXR1cm4gYW4gZW1wdHkgYXJyYXkgaWYgdGhlIGZpbGUgaXMgZW1wdHknLCAoKSA9PiB7XG4gIGNvbnN0IGZpbGVuYW1lID0gJy4vdGVzdHMvcmVwZXRpY29fZW1wdHkuanNvbic7XG4gIGNvbnN0IHJlc3VsdCA9IExvYWQoZmlsZW5hbWUpO1xuICBhc3NlcnRFcXVhbHMocmVzdWx0LCBbXSk7XG59KTtcblxuRGVuby50ZXN0KCdMb2FkIHNob3VsZCByZXR1cm4gYW4gYXJyYXkgb2YgRmxhc2hjYXJkIG9iamVjdHMgZm9yIHZhbGlkIEpTT04gZGF0YScsICgpID0+IHtcbiAgY29uc3QgZmlsZW5hbWUgPSAnLi90ZXN0cy9yZXBldGljb19zYW1wbGUuanNvbic7XG4gIGNvbnN0IGV4cGVjdGVkID0gW1xuICAgIHtcbiAgICAgIHF1ZXN0aW9uOiAnPHA+ZGVyIC8gZGllPC9wPicsXG4gICAgICBhbnN3ZXI6ICc8cD5lbCAvIGxhPC9wPicsXG4gICAgfSxcbiAgICB7XG4gICAgICBxdWVzdGlvbjogJzxwPmVpbiAvIGVpbmU8L3A+JyxcbiAgICAgIGFuc3dlcjogJzxwPnVuIC8gdW5hPC9wPicsXG4gICAgfSxcbiAgICB7XG4gICAgICBxdWVzdGlvbjogJ23DvGRlPGJyPjxicj5JY2ggYmluIG3DvGRlIG5hY2ggZWluZW0gZ2FuemVuIFRhZyBBcmJlaXQuJyxcbiAgICAgIGFuc3dlcjogJ2NhbnNhZGEgPGJyPjxicj5Fc3RveSBjYW5zYWRhIGRlc3B1w6lzIGRlIHRyYWJhamFyIHRvZG8gZWwgZMOtYS4nLFxuICAgIH0sXG4gIF07XG4gIGNvbnN0IHJlc3VsdCA9IExvYWQoZmlsZW5hbWUpO1xuICBhc3NlcnRFcXVhbHMocmVzdWx0LCBleHBlY3RlZCk7XG59KTtcblxuRGVuby50ZXN0KCdMb2FkIHNob3VsZCB0aHJvdyBhbiBlcnJvciBpZiB0aGUgZmlsZSBkb2VzIG5vdCBleGlzdCcsICgpID0+IHtcbiAgY29uc3QgZmlsZW5hbWUgPSAnbm9uZXhpc3RlbnQuanNvbic7XG4gIHRyeSB7XG4gICAgTG9hZChmaWxlbmFtZSk7XG4gICAgLy8gSWYgbm8gZXJyb3IgaXMgdGhyb3duLCB0aGUgdGVzdCBzaG91bGQgZmFpbFxuICAgIGFzc2VydEVxdWFscyh0cnVlLCBmYWxzZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYXNzZXJ0RXF1YWxzKGVycm9yLm1lc3NhZ2UsIGBObyBzdWNoIGZpbGUgb3IgZGlyZWN0b3J5OiAke2ZpbGVuYW1lfWApO1xuICB9XG59KTtcblxuLy8gQ29udmVydGVyQ29yZVxuXG5EZW5vLnRlc3QoJ01hcCBzaG91bGQgcmV0dXJuIGFuIGFycmF5IG9mIHN0cmluZ3Mgd2l0aCB0aGUgYW5zd2VyIHZhbHVlcycsICgpID0+IHtcbiAgY29uc3QgZmxhc2hjYXJkczogRmxhc2hjYXJkW10gPSBbXG4gICAge1xuICAgICAgcXVlc3Rpb246ICdxMScsXG4gICAgICBhbnN3ZXI6ICdhMScsXG4gICAgfSxcbiAgICB7XG4gICAgICBxdWVzdGlvbjogJ3EyJyxcbiAgICAgIGFuc3dlcjogJ2EyIGEyJyxcbiAgICB9LFxuICAgIHtcbiAgICAgIHF1ZXN0aW9uOiAncTMnLFxuICAgICAgYW5zd2VyOiAnYTMgYTMgYTMnLFxuICAgIH0sXG4gIF07XG4gIGNvbnN0IGV4cGVjdGVkID0gW1wiYTFcIiwgXCJhMiBhMlwiLCBcImEzIGEzIGEzXCJdO1xuICBjb25zdCByZXN1bHQgPSBNYXAoZmxhc2hjYXJkcyk7XG4gIGFzc2VydEVxdWFscyhyZXN1bHQsIGV4cGVjdGVkKTtcbn0pO1xuXG5cbkRlbm8udGVzdCgnTWFwIHNob3VsZCBleHRyYWN0IG9ubHkgdGhlIGZpcnN0IGxpbmUgb2YgdGhlIGFuc3dlcicsICgpID0+IHtcbiAgY29uc3QgZmxhc2hjYXJkczogRmxhc2hjYXJkW10gPSBbXG4gICAge1xuICAgICAgcXVlc3Rpb246ICdxMScsXG4gICAgICBhbnN3ZXI6ICc8ZGl2PmExPC9kaXY+JyxcbiAgICB9LFxuICAgIHtcbiAgICAgIHF1ZXN0aW9uOiAncTInLFxuICAgICAgYW5zd2VyOiAnPHA+YTI8L3A+YW5kIG1vcmUnLFxuICAgIH0sXG4gICAge1xuICAgICAgcXVlc3Rpb246ICdxMycsXG4gICAgICBhbnN3ZXI6ICc8c3Bhbj5hMzwvc3Bhbj48YnI+YW5kIG1vcmUnLFxuICAgIH0sXG4gICAge1xuICAgICAgcXVlc3Rpb246ICdxNCcsXG4gICAgICBhbnN3ZXI6ICc8c3BhbiBzdHlsZT1cImFiY1wiPmE0PC9zcGFuPicsXG4gICAgfSxcbiAgXTtcbiAgY29uc3QgZXhwZWN0ZWQgPSBbXCJhMVwiLCBcImEyXCIsIFwiYTNcIiwgXCJhNFwiXTtcbiAgY29uc3QgcmVzdWx0ID0gTWFwKGZsYXNoY2FyZHMpO1xuICBhc3NlcnRFcXVhbHMocmVzdWx0LCBleHBlY3RlZCk7XG59KTsiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxZQUFZLFFBQVEsbURBQW1EO0FBRWhGLFNBQVMsS0FBSyxRQUFRLDJCQUEyQjtBQUNqRCxTQUFTLEtBQUssUUFBdUIsZ0RBQStDO0FBQ3BGLFNBQVMsSUFBSSxRQUFtQixzREFBcUQ7QUFDckYsU0FBUyxHQUFHLFFBQVEsZ0RBQStDO0FBRW5FLGFBQWE7QUFFYixLQUFLLElBQUksQ0FBQyw2QkFBNkIsSUFBTTtJQUMzQyxNQUFNLFdBQVc7SUFFakIsSUFBSTtRQUNGLEtBQUssVUFBVSxDQUFDO0lBQ2xCLEVBQUUsT0FBTyxHQUFHLENBQU87SUFFbkIsTUFBTSxVQUFVO1FBQUM7UUFBSztRQUFNO0tBQU07SUFFbEMsTUFBTSxTQUFTLEtBQUssZ0JBQWdCLENBQUM7SUFDckMsYUFBYSxRQUFRO0FBQ3ZCO0FBRUEsZ0JBQWdCO0FBRWhCLEtBQUssSUFBSSxDQUFDLHFFQUFxRSxJQUFNO0lBQ25GLE1BQU0sT0FBaUIsRUFBRTtJQUN6QixJQUFJO1FBQ0YsTUFBTTtRQUNOLDhDQUE4QztRQUM5QyxhQUFhLElBQUksRUFBRSxLQUFLO0lBQzFCLEVBQUUsT0FBTyxPQUFPO1FBQ2QsYUFBYSxNQUFNLE9BQU8sRUFBRTtJQUM5QjtBQUNGO0FBRUEsS0FBSyxJQUFJLENBQUMsaUVBQWlFLElBQU07SUFDL0UsTUFBTSxPQUFpQjtRQUFDO0tBQWtCO0lBQzFDLE1BQU0sV0FBMEI7UUFDOUIsY0FBYztRQUNkLGFBQWE7SUFDZjtJQUNBLE1BQU0sU0FBUyxNQUFNO0lBQ3JCLGFBQWEsUUFBUTtBQUN2QjtBQUdBLHNCQUFzQjtBQUV0QixLQUFLLElBQUksQ0FBQywwREFBMEQsSUFBTTtJQUN4RSxNQUFNLFdBQVc7SUFDakIsTUFBTSxTQUFTLEtBQUs7SUFDcEIsYUFBYSxRQUFRLEVBQUU7QUFDekI7QUFFQSxLQUFLLElBQUksQ0FBQyx3RUFBd0UsSUFBTTtJQUN0RixNQUFNLFdBQVc7SUFDakIsTUFBTSxXQUFXO1FBQ2Y7WUFDRSxVQUFVO1lBQ1YsUUFBUTtRQUNWO1FBQ0E7WUFDRSxVQUFVO1lBQ1YsUUFBUTtRQUNWO1FBQ0E7WUFDRSxVQUFVO1lBQ1YsUUFBUTtRQUNWO0tBQ0Q7SUFDRCxNQUFNLFNBQVMsS0FBSztJQUNwQixhQUFhLFFBQVE7QUFDdkI7QUFFQSxLQUFLLElBQUksQ0FBQyx5REFBeUQsSUFBTTtJQUN2RSxNQUFNLFdBQVc7SUFDakIsSUFBSTtRQUNGLEtBQUs7UUFDTCw4Q0FBOEM7UUFDOUMsYUFBYSxJQUFJLEVBQUUsS0FBSztJQUMxQixFQUFFLE9BQU8sT0FBTztRQUNkLGFBQWEsTUFBTSxPQUFPLEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxTQUFTLENBQUM7SUFDdEU7QUFDRjtBQUVBLGdCQUFnQjtBQUVoQixLQUFLLElBQUksQ0FBQyxnRUFBZ0UsSUFBTTtJQUM5RSxNQUFNLGFBQTBCO1FBQzlCO1lBQ0UsVUFBVTtZQUNWLFFBQVE7UUFDVjtRQUNBO1lBQ0UsVUFBVTtZQUNWLFFBQVE7UUFDVjtRQUNBO1lBQ0UsVUFBVTtZQUNWLFFBQVE7UUFDVjtLQUNEO0lBQ0QsTUFBTSxXQUFXO1FBQUM7UUFBTTtRQUFTO0tBQVc7SUFDNUMsTUFBTSxTQUFTLElBQUk7SUFDbkIsYUFBYSxRQUFRO0FBQ3ZCO0FBR0EsS0FBSyxJQUFJLENBQUMsd0RBQXdELElBQU07SUFDdEUsTUFBTSxhQUEwQjtRQUM5QjtZQUNFLFVBQVU7WUFDVixRQUFRO1FBQ1Y7UUFDQTtZQUNFLFVBQVU7WUFDVixRQUFRO1FBQ1Y7UUFDQTtZQUNFLFVBQVU7WUFDVixRQUFRO1FBQ1Y7UUFDQTtZQUNFLFVBQVU7WUFDVixRQUFRO1FBQ1Y7S0FDRDtJQUNELE1BQU0sV0FBVztRQUFDO1FBQU07UUFBTTtRQUFNO0tBQUs7SUFDekMsTUFBTSxTQUFTLElBQUk7SUFDbkIsYUFBYSxRQUFRO0FBQ3ZCIn0=