// Source: https://github.com/dyedgreen/clay
import { Command, number, string } from "https://deno.land/x/clay/mod.ts";
export function Parse() {
    const cmd = new Command("Language Tutor - Q&A").required(string, "filename", {
        flags: [
            "f",
            "filename"
        ],
        description: "Name of a .txt file with a list of words. One word per line."
    }).optional(number, "numberOfQuestions", {
        flags: [
            "n",
            "numQuestions"
        ],
        description: "How many questions to ask in a session."
    }).optional(number, "numberOfWords", {
        flags: [
            "w",
            "numWords"
        ],
        description: "How many words to select from the file to build questions from."
    }).required(string, "questionLanguage", {
        flags: [
            "q",
            "qLang"
        ],
        description: "Which language to phrase questions in, e.g. Spanish, French."
    }).required(string, "answerLanguage", {
        flags: [
            "a",
            "aLang"
        ],
        description: "Which language the answers will be phrased in, e.g. English, German."
    });
    const params = cmd.run();
    return {
        wordFilepaths: [
            params.filename
        ],
        numberOfQuestions: params.numberOfQuestions == null ? 10 : params.numberOfQuestions,
        numberOfWords: params.numberOfWords == null ? 50 : params.numberOfWords,
        questionLanguage: params.questionLanguage,
        answerLanguage: params.answerLanguage
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvTGFuZ3VhZ2UtVHV0b3IvbW9kdWxlcy9xYS9DbWRsaW5lUG9ydGFsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNvdXJjZTogaHR0cHM6Ly9naXRodWIuY29tL2R5ZWRncmVlbi9jbGF5XG5pbXBvcnQgeyBDb21tYW5kLCBudW1iZXIsIHN0cmluZyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC94L2NsYXkvbW9kLnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ21kbGluZVBhcmFtcyB7XG4gIHdvcmRzRmlsZXBhdGhzOnN0cmluZ1tdXG4gIG51bWJlck9mUXVlc3Rpb25zOm51bWJlclxuICBudW1iZXJPZldvcmRzOm51bWJlclxuICBxdWVzdGlvbkxhbmd1YWdlOnN0cmluZ1xuICBhbnN3ZXJMYW5ndWFnZTpzdHJpbmdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFBhcnNlKCk6IENtZGxpbmVQYXJhbXMge1xuICBjb25zdCBjbWQgPSBuZXcgQ29tbWFuZChcIkxhbmd1YWdlIFR1dG9yIC0gUSZBXCIpXG4gIC5yZXF1aXJlZChzdHJpbmcsIFwiZmlsZW5hbWVcIiwgeyBmbGFnczogW1wiZlwiLCBcImZpbGVuYW1lXCJdLCBkZXNjcmlwdGlvbjogXCJOYW1lIG9mIGEgLnR4dCBmaWxlIHdpdGggYSBsaXN0IG9mIHdvcmRzLiBPbmUgd29yZCBwZXIgbGluZS5cIiB9KVxuICAub3B0aW9uYWwobnVtYmVyLCBcIm51bWJlck9mUXVlc3Rpb25zXCIsIHsgZmxhZ3M6IFtcIm5cIiwgXCJudW1RdWVzdGlvbnNcIl0sIGRlc2NyaXB0aW9uOiBcIkhvdyBtYW55IHF1ZXN0aW9ucyB0byBhc2sgaW4gYSBzZXNzaW9uLlwiIH0pXG4gIC5vcHRpb25hbChudW1iZXIsIFwibnVtYmVyT2ZXb3Jkc1wiLCB7IGZsYWdzOiBbXCJ3XCIsIFwibnVtV29yZHNcIl0sIGRlc2NyaXB0aW9uOiBcIkhvdyBtYW55IHdvcmRzIHRvIHNlbGVjdCBmcm9tIHRoZSBmaWxlIHRvIGJ1aWxkIHF1ZXN0aW9ucyBmcm9tLlwiIH0pXG4gIC5yZXF1aXJlZChzdHJpbmcsIFwicXVlc3Rpb25MYW5ndWFnZVwiLCB7IGZsYWdzOiBbXCJxXCIsIFwicUxhbmdcIl0sIGRlc2NyaXB0aW9uOiBcIldoaWNoIGxhbmd1YWdlIHRvIHBocmFzZSBxdWVzdGlvbnMgaW4sIGUuZy4gU3BhbmlzaCwgRnJlbmNoLlwiIH0pXG4gIC5yZXF1aXJlZChzdHJpbmcsIFwiYW5zd2VyTGFuZ3VhZ2VcIiwgeyBmbGFnczogW1wiYVwiLCBcImFMYW5nXCJdLCBkZXNjcmlwdGlvbjogXCJXaGljaCBsYW5ndWFnZSB0aGUgYW5zd2VycyB3aWxsIGJlIHBocmFzZWQgaW4sIGUuZy4gRW5nbGlzaCwgR2VybWFuLlwiIH0pO1xuXG4gIGNvbnN0IHBhcmFtcyA9IGNtZC5ydW4oKTtcblxuICByZXR1cm4ge1xuICAgIHdvcmRGaWxlcGF0aHM6IFtwYXJhbXMuZmlsZW5hbWVdLFxuICAgIG51bWJlck9mUXVlc3Rpb25zOiAocGFyYW1zLm51bWJlck9mUXVlc3Rpb25zID09IG51bGwpID8gMTAgOiBwYXJhbXMubnVtYmVyT2ZRdWVzdGlvbnMsXG4gICAgbnVtYmVyT2ZXb3JkczogKHBhcmFtcy5udW1iZXJPZldvcmRzID09IG51bGwpID8gNTAgOiBwYXJhbXMubnVtYmVyT2ZXb3JkcyxcbiAgICBxdWVzdGlvbkxhbmd1YWdlOiBwYXJhbXMucXVlc3Rpb25MYW5ndWFnZSxcbiAgICBhbnN3ZXJMYW5ndWFnZTogcGFyYW1zLmFuc3dlckxhbmd1YWdlXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSw0Q0FBNEM7QUFDNUMsU0FBUyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sUUFBUSxrQ0FBa0M7QUFVMUUsT0FBTyxTQUFTLFFBQXVCO0lBQ3JDLE1BQU0sTUFBTSxJQUFJLFFBQVEsd0JBQ3ZCLFFBQVEsQ0FBQyxRQUFRLFlBQVk7UUFBRSxPQUFPO1lBQUM7WUFBSztTQUFXO1FBQUUsYUFBYTtJQUErRCxHQUNySSxRQUFRLENBQUMsUUFBUSxxQkFBcUI7UUFBRSxPQUFPO1lBQUM7WUFBSztTQUFlO1FBQUUsYUFBYTtJQUEwQyxHQUM3SCxRQUFRLENBQUMsUUFBUSxpQkFBaUI7UUFBRSxPQUFPO1lBQUM7WUFBSztTQUFXO1FBQUUsYUFBYTtJQUFrRSxHQUM3SSxRQUFRLENBQUMsUUFBUSxvQkFBb0I7UUFBRSxPQUFPO1lBQUM7WUFBSztTQUFRO1FBQUUsYUFBYTtJQUErRCxHQUMxSSxRQUFRLENBQUMsUUFBUSxrQkFBa0I7UUFBRSxPQUFPO1lBQUM7WUFBSztTQUFRO1FBQUUsYUFBYTtJQUF1RTtJQUVqSixNQUFNLFNBQVMsSUFBSSxHQUFHO0lBRXRCLE9BQU87UUFDTCxlQUFlO1lBQUMsT0FBTyxRQUFRO1NBQUM7UUFDaEMsbUJBQW1CLEFBQUMsT0FBTyxpQkFBaUIsSUFBSSxJQUFJLEdBQUksS0FBSyxPQUFPLGlCQUFpQjtRQUNyRixlQUFlLEFBQUMsT0FBTyxhQUFhLElBQUksSUFBSSxHQUFJLEtBQUssT0FBTyxhQUFhO1FBQ3pFLGtCQUFrQixPQUFPLGdCQUFnQjtRQUN6QyxnQkFBZ0IsT0FBTyxjQUFjO0lBQ3ZDO0FBQ0YsQ0FBQyJ9