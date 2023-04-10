import { Store } from "./repeticoconverter.ts";
import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvRnJhZ3JhbnRTYWx0eU5ldGZyYW1ld29yay9tb2R1bGVzL3JlcGV0aWNvY29udmVydGVyLnRlc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3RvcmUgfSBmcm9tIFwiLi9yZXBldGljb2NvbnZlcnRlci50c1wiO1xuXG5pbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuMTgyLjAvdGVzdGluZy9hc3NlcnRzLnRzXCI7XG5cbkRlbm8udGVzdChcIldyaXRpbmcgd29yZHMgdG8gdHh0IGZpbGVcIiwgKCkgPT4ge1xuICBjb25zdCBmaWxlbmFtZSA9IFwiLi90ZXN0d29yZHMudHh0XCI7XG5cbiAgdHJ5IHsgRGVuby5yZW1vdmVTeW5jKGZpbGVuYW1lKTsgfSBjYXRjaCAoZSkgey8qKi99XG5cbiAgU3RvcmUoZmlsZW5hbWUsIFtcImFcIiwgXCJiYlwiLCBcImNjY1wiXSk7XG5cbiAgY29uc3QgcmVzdWx0ID0gRGVuby5yZWFkVGV4dEZpbGVTeW5jKGZpbGVuYW1lKTtcbiAgYXNzZXJ0RXF1YWxzKHJlc3VsdCwgXCJhXFxuYmJcXG5jY2NcIik7XG59KTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLEtBQUssUUFBUSx5QkFBeUI7QUFFL0MsU0FBUyxZQUFZLFFBQVEsbURBQW1EO0FBRWhGLEtBQUssSUFBSSxDQUFDLDZCQUE2QixJQUFNO0lBQzNDLE1BQU0sV0FBVztJQUVqQixJQUFJO1FBQUUsS0FBSyxVQUFVLENBQUM7SUFBVyxFQUFFLE9BQU8sR0FBRyxDQUFLO0lBRWxELE1BQU0sVUFBVTtRQUFDO1FBQUs7UUFBTTtLQUFNO0lBRWxDLE1BQU0sU0FBUyxLQUFLLGdCQUFnQixDQUFDO0lBQ3JDLGFBQWEsUUFBUTtBQUN2QiJ9