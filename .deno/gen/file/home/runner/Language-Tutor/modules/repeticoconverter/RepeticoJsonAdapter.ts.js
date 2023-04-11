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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvTGFuZ3VhZ2UtVHV0b3IvbW9kdWxlcy9yZXBldGljb2NvbnZlcnRlci9SZXBldGljb0pzb25BZGFwdGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0bWw1RW50aXRpZXMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9odG1sX2VudGl0aWVzQHYxLjAvbW9kLmpzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmxhc2hjYXJkIHtcbiAgcXVlc3Rpb246IHN0cmluZztcbiAgYW5zd2VyOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBMb2FkKGZpbGVuYW1lOiBzdHJpbmcpOiBGbGFzaGNhcmRbXSB7XG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoJ3V0Zi04Jyk7XG4gIGxldCBqc29uID0gXCJcIjtcbiAgXG4gIHRyeSB7XG4gICAgY29uc3QgZGF0YSA9IERlbm8ucmVhZEZpbGVTeW5jKGZpbGVuYW1lKTtcbiAgICBqc29uID0gZGVjb2Rlci5kZWNvZGUoZGF0YSk7XG4gIH1cbiAgY2F0Y2goZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBzdWNoIGZpbGUgb3IgZGlyZWN0b3J5OiBcIiArIGZpbGVuYW1lKTtcbiAgfVxuXG4gIGlmIChqc29uID09IFwiXCIpIHJldHVybiBbXTtcbiAgXG4gIGNvbnN0IGNhcmRzID0gSlNPTi5wYXJzZShqc29uKSBhcyB7IHF1ZXN0aW9uOiBzdHJpbmc7IGFuc3dlcjogc3RyaW5nIH1bXTtcbiAgcmV0dXJuIGNhcmRzLm1hcCgoY2FyZCkgPT4gKHtcbiAgICBxdWVzdGlvbjogSHRtbDVFbnRpdGllcy5kZWNvZGUoY2FyZC5xdWVzdGlvbiksXG4gICAgYW5zd2VyOiBIdG1sNUVudGl0aWVzLmRlY29kZShjYXJkLmFuc3dlciksXG4gIH0pKTtcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxhQUFhLFFBQVEsZ0RBQWdEO0FBTzlFLE9BQU8sU0FBUyxLQUFLLFFBQWdCLEVBQWU7SUFDbEQsTUFBTSxVQUFVLElBQUksWUFBWTtJQUNoQyxJQUFJLE9BQU87SUFFWCxJQUFJO1FBQ0YsTUFBTSxPQUFPLEtBQUssWUFBWSxDQUFDO1FBQy9CLE9BQU8sUUFBUSxNQUFNLENBQUM7SUFDeEIsRUFDQSxPQUFNLE9BQU87UUFDWCxNQUFNLElBQUksTUFBTSxnQ0FBZ0MsVUFBVTtJQUM1RDtJQUVBLElBQUksUUFBUSxJQUFJLE9BQU8sRUFBRTtJQUV6QixNQUFNLFFBQVEsS0FBSyxLQUFLLENBQUM7SUFDekIsT0FBTyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQVMsQ0FBQztZQUMxQixVQUFVLGNBQWMsTUFBTSxDQUFDLEtBQUssUUFBUTtZQUM1QyxRQUFRLGNBQWMsTUFBTSxDQUFDLEtBQUssTUFBTTtRQUMxQyxDQUFDO0FBQ0gsQ0FBQyJ9