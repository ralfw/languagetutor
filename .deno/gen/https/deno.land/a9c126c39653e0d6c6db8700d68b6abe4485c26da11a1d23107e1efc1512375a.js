function intersection(a, b) {
    let intersection = 0;
    for (const item of a)if (b.has(item)) intersection += 1;
    return intersection;
}
function union(a, b) {
    let union = a.size;
    for (const item of b)if (!a.has(item)) union += 1;
    return union;
}
export function closest(string, options) {
    const stringSet = new Set(string);
    let bestItem = null;
    let bestScore = 0;
    for (const item of options){
        const itemSet = new Set(item);
        const score = intersection(stringSet, itemSet) / union(stringSet, itemSet);
        if (bestScore <= score) {
            bestScore = score;
            bestItem = item;
        }
    }
    return bestItem;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvY2xheUB2MC4yLjUvc3JjL2Rpc3RhbmNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIGludGVyc2VjdGlvbjxUPihhOiBTZXQ8VD4sIGI6IFNldDxUPik6IG51bWJlciB7XG4gIGxldCBpbnRlcnNlY3Rpb24gPSAwO1xuICBmb3IgKGNvbnN0IGl0ZW0gb2YgYSkgaWYgKGIuaGFzKGl0ZW0pKSBpbnRlcnNlY3Rpb24gKz0gMTtcbiAgcmV0dXJuIGludGVyc2VjdGlvbjtcbn1cblxuZnVuY3Rpb24gdW5pb248VD4oYTogU2V0PFQ+LCBiOiBTZXQ8VD4pOiBudW1iZXIge1xuICBsZXQgdW5pb24gPSBhLnNpemU7XG4gIGZvciAoY29uc3QgaXRlbSBvZiBiKSBpZiAoIWEuaGFzKGl0ZW0pKSB1bmlvbiArPSAxO1xuICByZXR1cm4gdW5pb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZXN0KFxuICBzdHJpbmc6IHN0cmluZyxcbiAgb3B0aW9uczogSXRlcmFibGU8c3RyaW5nPixcbik6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBzdHJpbmdTZXQgPSBuZXcgU2V0KHN0cmluZyk7XG4gIGxldCBiZXN0SXRlbSA9IG51bGw7XG4gIGxldCBiZXN0U2NvcmUgPSAwO1xuICBmb3IgKGNvbnN0IGl0ZW0gb2Ygb3B0aW9ucykge1xuICAgIGNvbnN0IGl0ZW1TZXQgPSBuZXcgU2V0KGl0ZW0pO1xuICAgIGNvbnN0IHNjb3JlID0gaW50ZXJzZWN0aW9uKHN0cmluZ1NldCwgaXRlbVNldCkgLyB1bmlvbihzdHJpbmdTZXQsIGl0ZW1TZXQpO1xuICAgIGlmIChiZXN0U2NvcmUgPD0gc2NvcmUpIHtcbiAgICAgIGJlc3RTY29yZSA9IHNjb3JlO1xuICAgICAgYmVzdEl0ZW0gPSBpdGVtO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYmVzdEl0ZW07XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxhQUFnQixDQUFTLEVBQUUsQ0FBUyxFQUFVO0lBQ3JELElBQUksZUFBZTtJQUNuQixLQUFLLE1BQU0sUUFBUSxFQUFHLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTyxnQkFBZ0I7SUFDdkQsT0FBTztBQUNUO0FBRUEsU0FBUyxNQUFTLENBQVMsRUFBRSxDQUFTLEVBQVU7SUFDOUMsSUFBSSxRQUFRLEVBQUUsSUFBSTtJQUNsQixLQUFLLE1BQU0sUUFBUSxFQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxPQUFPLFNBQVM7SUFDakQsT0FBTztBQUNUO0FBRUEsT0FBTyxTQUFTLFFBQ2QsTUFBYyxFQUNkLE9BQXlCLEVBQ1Y7SUFDZixNQUFNLFlBQVksSUFBSSxJQUFJO0lBQzFCLElBQUksV0FBVyxJQUFJO0lBQ25CLElBQUksWUFBWTtJQUNoQixLQUFLLE1BQU0sUUFBUSxRQUFTO1FBQzFCLE1BQU0sVUFBVSxJQUFJLElBQUk7UUFDeEIsTUFBTSxRQUFRLGFBQWEsV0FBVyxXQUFXLE1BQU0sV0FBVztRQUNsRSxJQUFJLGFBQWEsT0FBTztZQUN0QixZQUFZO1lBQ1osV0FBVztRQUNiLENBQUM7SUFDSDtJQUNBLE9BQU87QUFDVCxDQUFDIn0=