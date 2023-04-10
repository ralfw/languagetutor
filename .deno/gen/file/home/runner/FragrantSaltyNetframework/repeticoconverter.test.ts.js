import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { Store } from "./modules/TxtAdapter.ts";
import { Parse } from "./modules/CmdlinePortal.ts";
import { Load } from "./modules/RepeticoJsonAdapter.ts";
import { Map } from "./modules/ConverterCore.ts";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvRnJhZ3JhbnRTYWx0eU5ldGZyYW1ld29yay9yZXBldGljb2NvbnZlcnRlci50ZXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC4xODIuMC90ZXN0aW5nL2Fzc2VydHMudHNcIjtcblxuaW1wb3J0IHsgU3RvcmUgfSBmcm9tIFwiLi9tb2R1bGVzL1R4dEFkYXB0ZXIudHNcIjtcbmltcG9ydCB7IFBhcnNlLCBDbWRsaW5lUGFyYW1zIH0gZnJvbSBcIi4vbW9kdWxlcy9DbWRsaW5lUG9ydGFsLnRzXCJcbmltcG9ydCB7IExvYWQsIEZsYXNoY2FyZCB9IGZyb20gXCIuL21vZHVsZXMvUmVwZXRpY29Kc29uQWRhcHRlci50c1wiXG5pbXBvcnQgeyBNYXAgfSBmcm9tIFwiLi9tb2R1bGVzL0NvbnZlcnRlckNvcmUudHNcIlxuXG4vLyBUeHRBZGFwdGVyXG5cbkRlbm8udGVzdChcIldyaXRpbmcgd29yZHMgdG8gdHh0IGZpbGVcIiwgKCkgPT4ge1xuICBjb25zdCBmaWxlbmFtZSA9IFwiLi90ZXN0d29yZHMudHh0XCI7XG5cbiAgdHJ5IHtcbiAgICBEZW5vLnJlbW92ZVN5bmMoZmlsZW5hbWUpO1xuICB9IGNhdGNoIChlKSB7IC8qKi8gfVxuXG4gIFN0b3JlKGZpbGVuYW1lLCBbXCJhXCIsIFwiYmJcIiwgXCJjY2NcIl0pO1xuXG4gIGNvbnN0IHJlc3VsdCA9IERlbm8ucmVhZFRleHRGaWxlU3luYyhmaWxlbmFtZSk7XG4gIGFzc2VydEVxdWFscyhyZXN1bHQsIFwiYVxcbmJiXFxuY2NjXCIpO1xufSk7XG5cbi8vIENtZGxpbmVQb3J0YWxcblxuRGVuby50ZXN0KCdQYXJzZSBzaG91bGQgdGhyb3cgYW4gZXJyb3IgaWYgbGVzcyB0aGFuIDIgYXJndW1lbnRzIGFyZSBwcm92aWRlZCcsICgpID0+IHtcbiAgY29uc3QgYXJnczogc3RyaW5nW10gPSBbXTtcbiAgdHJ5IHtcbiAgICBQYXJzZShhcmdzKTtcbiAgICAvLyBJZiBubyBlcnJvciBpcyB0aHJvd24sIHRoZSB0ZXN0IHNob3VsZCBmYWlsXG4gICAgYXNzZXJ0RXF1YWxzKHRydWUsIGZhbHNlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBhc3NlcnRFcXVhbHMoZXJyb3IubWVzc2FnZSwgJ01pc3NpbmcgSlNPTiBmaWxlbmFtZSBhcyBmaXJzdCBwYXJhbWV0ZXIgb24gY29tbWFuZCBsaW5lLicpO1xuICB9XG59KTtcblxuRGVuby50ZXN0KCdQYXJzZSBzaG91bGQgcmV0dXJuIHRoZSBjb3JyZWN0IGZpbGVwYXRocyBmb3IgdmFsaWQgYXJndW1lbnRzJywgKCkgPT4ge1xuICBjb25zdCBhcmdzOiBzdHJpbmdbXSA9IFsnLi9hYmMvZGF0YS5qc29uJ107XG4gIGNvbnN0IGV4cGVjdGVkOiBDbWRsaW5lUGFyYW1zID0ge1xuICAgIGpzb25GaWxlcGF0aDogJy4vYWJjL2RhdGEuanNvbicsXG4gICAgdHh0RmlsZXBhdGg6ICcuL2FiYy9kYXRhLnR4dCcsXG4gIH07XG4gIGNvbnN0IHJlc3VsdCA9IFBhcnNlKGFyZ3MpO1xuICBhc3NlcnRFcXVhbHMocmVzdWx0LCBleHBlY3RlZCk7XG59KTtcblxuXG4vLyBSZXBldGljb0pzb25BZGFwdGVyXG5cbkRlbm8udGVzdCgnTG9hZCBzaG91bGQgcmV0dXJuIGFuIGVtcHR5IGFycmF5IGlmIHRoZSBmaWxlIGlzIGVtcHR5JywgKCkgPT4ge1xuICBjb25zdCBmaWxlbmFtZSA9ICcuL3JlcGV0aWNvX2VtcHR5Lmpzb24nO1xuICBjb25zdCByZXN1bHQgPSBMb2FkKGZpbGVuYW1lKTtcbiAgYXNzZXJ0RXF1YWxzKHJlc3VsdCwgW10pO1xufSk7XG5cbkRlbm8udGVzdCgnTG9hZCBzaG91bGQgcmV0dXJuIGFuIGFycmF5IG9mIEZsYXNoY2FyZCBvYmplY3RzIGZvciB2YWxpZCBKU09OIGRhdGEnLCAoKSA9PiB7XG4gIGNvbnN0IGZpbGVuYW1lID0gJy4vcmVwZXRpY29fc2FtcGxlLmpzb24nO1xuICBjb25zdCBleHBlY3RlZCA9IFtcbiAgICB7XG4gICAgICBxdWVzdGlvbjogJzxwPmRlciAvIGRpZTwvcD4nLFxuICAgICAgYW5zd2VyOiAnPHA+ZWwgLyBsYTwvcD4nLFxuICAgIH0sXG4gICAge1xuICAgICAgcXVlc3Rpb246ICc8cD5laW4gLyBlaW5lPC9wPicsXG4gICAgICBhbnN3ZXI6ICc8cD51biAvIHVuYTwvcD4nLFxuICAgIH0sXG4gICAge1xuICAgICAgcXVlc3Rpb246ICdtw7xkZTxicj48YnI+SWNoIGJpbiBtw7xkZSBuYWNoIGVpbmVtIGdhbnplbiBUYWcgQXJiZWl0LicsXG4gICAgICBhbnN3ZXI6ICdjYW5zYWRhIDxicj48YnI+RXN0b3kgY2Fuc2FkYSBkZXNwdcOpcyBkZSB0cmFiYWphciB0b2RvIGVsIGTDrWEuJyxcbiAgICB9LFxuICBdO1xuICBjb25zdCByZXN1bHQgPSBMb2FkKGZpbGVuYW1lKTtcbiAgYXNzZXJ0RXF1YWxzKHJlc3VsdCwgZXhwZWN0ZWQpO1xufSk7XG5cbkRlbm8udGVzdCgnTG9hZCBzaG91bGQgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIGZpbGUgZG9lcyBub3QgZXhpc3QnLCAoKSA9PiB7XG4gIGNvbnN0IGZpbGVuYW1lID0gJ25vbmV4aXN0ZW50Lmpzb24nO1xuICB0cnkge1xuICAgIExvYWQoZmlsZW5hbWUpO1xuICAgIC8vIElmIG5vIGVycm9yIGlzIHRocm93biwgdGhlIHRlc3Qgc2hvdWxkIGZhaWxcbiAgICBhc3NlcnRFcXVhbHModHJ1ZSwgZmFsc2UpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGFzc2VydEVxdWFscyhlcnJvci5tZXNzYWdlLCBgTm8gc3VjaCBmaWxlIG9yIGRpcmVjdG9yeTogJHtmaWxlbmFtZX1gKTtcbiAgfVxufSk7XG5cbi8vIENvbnZlcnRlckNvcmVcblxuRGVuby50ZXN0KCdNYXAgc2hvdWxkIHJldHVybiBhbiBhcnJheSBvZiBzdHJpbmdzIHdpdGggdGhlIGFuc3dlciB2YWx1ZXMnLCAoKSA9PiB7XG4gIGNvbnN0IGZsYXNoY2FyZHM6IEZsYXNoY2FyZFtdID0gW1xuICAgIHtcbiAgICAgIHF1ZXN0aW9uOiAncTEnLFxuICAgICAgYW5zd2VyOiAnYTEnLFxuICAgIH0sXG4gICAge1xuICAgICAgcXVlc3Rpb246ICdxMicsXG4gICAgICBhbnN3ZXI6ICdhMiBhMicsXG4gICAgfSxcbiAgICB7XG4gICAgICBxdWVzdGlvbjogJ3EzJyxcbiAgICAgIGFuc3dlcjogJ2EzIGEzIGEzJyxcbiAgICB9LFxuICBdO1xuICBjb25zdCBleHBlY3RlZCA9IFtcImExXCIsIFwiYTIgYTJcIiwgXCJhMyBhMyBhM1wiXTtcbiAgY29uc3QgcmVzdWx0ID0gTWFwKGZsYXNoY2FyZHMpO1xuICBhc3NlcnRFcXVhbHMocmVzdWx0LCBleHBlY3RlZCk7XG59KTtcblxuXG5EZW5vLnRlc3QoJ01hcCBzaG91bGQgZXh0cmFjdCBvbmx5IHRoZSBmaXJzdCBsaW5lIG9mIHRoZSBhbnN3ZXInLCAoKSA9PiB7XG4gIGNvbnN0IGZsYXNoY2FyZHM6IEZsYXNoY2FyZFtdID0gW1xuICAgIHtcbiAgICAgIHF1ZXN0aW9uOiAncTEnLFxuICAgICAgYW5zd2VyOiAnPGRpdj5hMTwvZGl2PicsXG4gICAgfSxcbiAgICB7XG4gICAgICBxdWVzdGlvbjogJ3EyJyxcbiAgICAgIGFuc3dlcjogJzxwPmEyPC9wPmFuZCBtb3JlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgIHF1ZXN0aW9uOiAncTMnLFxuICAgICAgYW5zd2VyOiAnPHNwYW4+YTM8L3NwYW4+PGJyPmFuZCBtb3JlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgIHF1ZXN0aW9uOiAncTQnLFxuICAgICAgYW5zd2VyOiAnPHNwYW4gc3R5bGU9XCJhYmNcIj5hNDwvc3Bhbj4nLFxuICAgIH0sXG4gIF07XG4gIGNvbnN0IGV4cGVjdGVkID0gW1wiYTFcIiwgXCJhMlwiLCBcImEzXCIsIFwiYTRcIl07XG4gIGNvbnN0IHJlc3VsdCA9IE1hcChmbGFzaGNh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