import { Html5Entities } from "https://deno.land/x/html_entities@v1.0/mod.js";
export function Load(filename) {
    const decoder = new TextDecoder('utf-8');
    let json = "";
    try {
        const data = Deno.readFileSync(filename);
        json = decoder.decode(data);
    } catch (error) {
        throw new Error("No such file or directory: " + filename);
    }
    if (json == "") return [];
    const cards = JSON.parse(json);
    return cards.map((card)=>({
            question: Html5Entities.decode(card.question),
            answer: Html5Entities.decode(card.answer)
        }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvRnJhZ3JhbnRTYWx0eU5ldGZyYW1ld29yay9tb2R1bGVzL1JlcGV0aWNvSnNvbkFkYXB0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHRtbDVFbnRpdGllcyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC94L2h0bWxfZW50aXRpZXNAdjEuMC9tb2QuanNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBGbGFzaGNhcmQge1xuICBxdWVzdGlvbjogc3RyaW5nO1xuICBhbnN3ZXI6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIExvYWQoZmlsZW5hbWU6IHN0cmluZyk6IEZsYXNoY2FyZFtdIHtcbiAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigndXRmLTgnKTtcbiAgbGV0IGpzb24gPSBcIlwiO1xuICBcbiAgdHJ5IHtcbiAgICBjb25zdCBkYXRhID0gRGVuby5yZWFkRmlsZVN5bmMoZmlsZW5hbWUpO1xuICAgIGpzb24gPSBkZWNvZGVyLmRlY29kZShkYXRhKTtcbiAgfVxuICBjYXRjaChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHN1Y2ggZmlsZSBvciBkaXJlY3Rvcnk6IFwiICsgZmlsZW5hbWUpO1xuICB9XG5cbiAgaWYgKGpzb24gPT0gXCJcIikgcmV0dXJuIFtdO1xuICBcbiAgY29uc3QgY2FyZHMgPSBKU09OLnBhcnNlKGpzb24pIGFzIHsgcXVlc3Rpb246IHN0cmluZzsgYW5zd2VyOiBzdHJpbmcgfVtdO1xuICByZXR1cm4gY2FyZHMubWFwKChjYXJkKSA9PiAoe1xuICAgIHF1ZXN0aW9uOiBIdG1sNUVudGl0aWVzLmRlY29kZShjYXJkLnF1ZXN0aW9uKSxcbiAgICBhbnN3ZXI6IEh0bWw1RW50aXRpZXMuZGVjb2RlKGNhcmQuYW5zd2VyKSxcbiAgfSkpO1xufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLGFBQWEsUUFBUSxnREFBZ0Q7QUFPOUUsT0FBTyxTQUFTLEtBQUssUUFBZ0IsRUFBZTtJQUNsRCxNQUFNLFVBQVUsSUFBSSxZQUFZO0lBQ2hDLElBQUksT0FBTztJQUVYLElBQUk7UUFDRixNQUFNLE9BQU8sS0FBSyxZQUFZLENBQUM7UUFDL0IsT0FBTyxRQUFRLE1BQU0sQ0FBQztJQUN4QixFQUNBLE9BQU0sT0FBTztRQUNYLE1BQU0sSUFBSSxNQUFNLGdDQUFnQyxVQUFVO0lBQzVEO0lBRUEsSUFBSSxRQUFRLElBQUksT0FBTyxFQUFFO0lBRXpCLE1BQU0sUUFBUSxLQUFLLEtBQUssQ0FBQztJQUN6QixPQUFPLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBUyxDQUFDO1lBQzFCLFVBQVUsY0FBYyxNQUFNLENBQUMsS0FBSyxRQUFRO1lBQzVDLFFBQVEsY0FBYyxNQUFNLENBQUMsS0FBSyxNQUFNO1FBQzFDLENBQUM7QUFDSCxDQUFDIn0=