export function Parse(args) {
    if (args.length < 1) {
        throw new Error('Missing JSON filename as first parameter on command line.');
    }
    const jsonFilepath = args[0];
    const txtFilepath = jsonFilepath.replace(/\.json$/, '.txt');
    return {
        jsonFilepath,
        txtFilepath
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvRnJhZ3JhbnRTYWx0eU5ldGZyYW1ld29yay9tb2R1bGVzL0NtZGxpbmVQb3J0YWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGludGVyZmFjZSBDbWRsaW5lUGFyYW1zIHtcbiAganNvbkZpbGVwYXRoOiBzdHJpbmc7XG4gIHR4dEZpbGVwYXRoOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQYXJzZShhcmdzOnN0cmluZ1tdKTogQ21kbGluZVBhcmFtcyB7XG4gIGlmIChhcmdzLmxlbmd0aCA8IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgSlNPTiBmaWxlbmFtZSBhcyBmaXJzdCBwYXJhbWV0ZXIgb24gY29tbWFuZCBsaW5lLicpO1xuICB9XG5cbiAgY29uc3QganNvbkZpbGVwYXRoID0gYXJnc1swXTtcbiAgY29uc3QgdHh0RmlsZXBhdGggPSBqc29uRmlsZXBhdGgucmVwbGFjZSgvXFwuanNvbiQvLCAnLnR4dCcpO1xuXG4gIHJldHVybiB7IGpzb25GaWxlcGF0aCwgdHh0RmlsZXBhdGggfTtcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0EsT0FBTyxTQUFTLE1BQU0sSUFBYSxFQUFpQjtJQUNsRCxJQUFJLEtBQUssTUFBTSxHQUFHLEdBQUc7UUFDbkIsTUFBTSxJQUFJLE1BQU0sNkRBQTZEO0lBQy9FLENBQUM7SUFFRCxNQUFNLGVBQWUsSUFBSSxDQUFDLEVBQUU7SUFDNUIsTUFBTSxjQUFjLGFBQWEsT0FBTyxDQUFDLFdBQVc7SUFFcEQsT0FBTztRQUFFO1FBQWM7SUFBWTtBQUNyQyxDQUFDIn0=