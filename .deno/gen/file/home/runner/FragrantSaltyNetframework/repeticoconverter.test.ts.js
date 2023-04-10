import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { Store } from "./modules/TxtAdapter.ts";
import { Parse } from "./modules/CmdlineParser.ts";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvRnJhZ3JhbnRTYWx0eU5ldGZyYW1ld29yay9yZXBldGljb2NvbnZlcnRlci50ZXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC4xODIuMC90ZXN0aW5nL2Fzc2VydHMudHNcIjtcblxuaW1wb3J0IHsgU3RvcmUgfSBmcm9tIFwiLi9tb2R1bGVzL1R4dEFkYXB0ZXIudHNcIjtcbmltcG9ydCB7IFBhcnNlLCBDbWRsaW5lUGFyYW1zIH0gZnJvbSBcIi4vbW9kdWxlcy9DbWRsaW5lUGFyc2VyLnRzXCJcblxuRGVuby50ZXN0KFwiV3JpdGluZyB3b3JkcyB0byB0eHQgZmlsZVwiLCAoKSA9PiB7XG4gIGNvbnN0IGZpbGVuYW1lID0gXCIuL3Rlc3R3b3Jkcy50eHRcIjtcblxuICB0cnkge1xuICAgIERlbm8ucmVtb3ZlU3luYyhmaWxlbmFtZSk7XG4gIH0gY2F0Y2ggKGUpIHsgLyoqLyB9XG5cbiAgU3RvcmUoZmlsZW5hbWUsIFtcImFcIiwgXCJiYlwiLCBcImNjY1wiXSk7XG5cbiAgY29uc3QgcmVzdWx0ID0gRGVuby5yZWFkVGV4dEZpbGVTeW5jKGZpbGVuYW1lKTtcbiAgYXNzZXJ0RXF1YWxzKHJlc3VsdCwgXCJhXFxuYmJcXG5jY2NcIik7XG59KTtcblxuXG5cbkRlbm8udGVzdCgnUGFyc2Ugc2hvdWxkIHRocm93IGFuIGVycm9yIGlmIGxlc3MgdGhhbiAyIGFyZ3VtZW50cyBhcmUgcHJvdmlkZWQnLCAoKSA9PiB7XG4gIGNvbnN0IGFyZ3M6IHN0cmluZ1tdID0gW107XG4gIHRyeSB7XG4gICAgUGFyc2UoYXJncyk7XG4gICAgLy8gSWYgbm8gZXJyb3IgaXMgdGhyb3duLCB0aGUgdGVzdCBzaG91bGQgZmFpbFxuICAgIGFzc2VydEVxdWFscyh0cnVlLCBmYWxzZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYXNzZXJ0RXF1YWxzKGVycm9yLm1lc3NhZ2UsICdNaXNzaW5nIEpTT04gZmlsZW5hbWUgYXMgZmlyc3QgcGFyYW1ldGVyIG9uIGNvbW1hbmQgbGluZS4nKTtcbiAgfVxufSk7XG5cbkRlbm8udGVzdCgnUGFyc2Ugc2hvdWxkIHJldHVybiB0aGUgY29ycmVjdCBmaWxlcGF0aHMgZm9yIHZhbGlkIGFyZ3VtZW50cycsICgpID0+IHtcbiAgY29uc3QgYXJnczogc3RyaW5nW10gPSBbJy4vYWJjL2RhdGEuanNvbiddO1xuICBjb25zdCBleHBlY3RlZDogQ21kbGluZVBhcmFtcyA9IHtcbiAgICBqc29uRmlsZXBhdGg6ICcuL2FiYy9kYXRhLmpzb24nLFxuICAgIHR4dEZpbGVwYXRoOiAnLi9hYmMvZGF0YS50eHQnLFxuICB9O1xuICBjb25zdCByZXN1bHQgPSBQYXJzZShhcmdzKTtcbiAgYXNzZXJ0RXF1YWxzKHJlc3VsdCwgZXhwZWN0ZWQpO1xufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxZQUFZLFFBQVEsbURBQW1EO0FBRWhGLFNBQVMsS0FBSyxRQUFRLDBCQUEwQjtBQUNoRCxTQUFTLEtBQUssUUFBdUIsNkJBQTRCO0FBRWpFLEtBQUssSUFBSSxDQUFDLDZCQUE2QixJQUFNO0lBQzNDLE1BQU0sV0FBVztJQUVqQixJQUFJO1FBQ0YsS0FBSyxVQUFVLENBQUM7SUFDbEIsRUFBRSxPQUFPLEdBQUcsQ0FBTztJQUVuQixNQUFNLFVBQVU7UUFBQztRQUFLO1FBQU07S0FBTTtJQUVsQyxNQUFNLFNBQVMsS0FBSyxnQkFBZ0IsQ0FBQztJQUNyQyxhQUFhLFFBQVE7QUFDdkI7QUFJQSxLQUFLLElBQUksQ0FBQyxxRUFBcUUsSUFBTTtJQUNuRixNQUFNLE9BQWlCLEVBQUU7SUFDekIsSUFBSTtRQUNGLE1BQU07UUFDTiw4Q0FBOEM7UUFDOUMsYUFBYSxJQUFJLEVBQUUsS0FBSztJQUMxQixFQUFFLE9BQU8sT0FBTztRQUNkLGFBQWEsTUFBTSxPQUFPLEVBQUU7SUFDOUI7QUFDRjtBQUVBLEtBQUssSUFBSSxDQUFDLGlFQUFpRSxJQUFNO0lBQy9FLE1BQU0sT0FBaUI7UUFBQztLQUFrQjtJQUMxQyxNQUFNLFdBQTBCO1FBQzlCLGNBQWM7UUFDZCxhQUFhO0lBQ2Y7SUFDQSxNQUFNLFNBQVMsTUFBTTtJQUNyQixhQUFhLFFBQVE7QUFDdkIifQ==