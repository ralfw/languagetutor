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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvTGFuZ3VhZ2UtVHV0b3IvbW9kdWxlcy9xYS9DbWRsaW5lUG9ydGFsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1hbmQsIG51bWJlciwgc3RyaW5nIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3gvY2xheS9tb2QudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBDbWRsaW5lUGFyYW1zIHtcbiAgd29yZHNGaWxlcGF0aHM6c3RyaW5nW11cbiAgbnVtYmVyT2ZRdWVzdGlvbnM6bnVtYmVyXG4gIG51bWJlck9mV29yZHM6bnVtYmVyXG4gIHF1ZXN0aW9uTGFuZ3VhZ2U6c3RyaW5nXG4gIGFuc3dlckxhbmd1YWdlOnN0cmluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUGFyc2UoKTogQ21kbGluZVBhcmFtcyB7XG4gIGNvbnN0IGNtZCA9IG5ldyBDb21tYW5kKFwiTGFuZ3VhZ2UgVHV0b3IgLSBRJkFcIilcbiAgLnJlcXVpcmVkKHN0cmluZywgXCJmaWxlbmFtZVwiLCB7IGZsYWdzOiBbXCJmXCIsIFwiZmlsZW5hbWVcIl0sIGRlc2NyaXB0aW9uOiBcIk5hbWUgb2YgYSAudHh0IGZpbGUgd2l0aCBhIGxpc3Qgb2Ygd29yZHMuIE9uZSB3b3JkIHBlciBsaW5lLlwiIH0pXG4gIC5vcHRpb25hbChudW1iZXIsIFwibnVtYmVyT2ZRdWVzdGlvbnNcIiwgeyBmbGFnczogW1wiblwiLCBcIm51bVF1ZXN0aW9uc1wiXSwgZGVzY3JpcHRpb246IFwiSG93IG1hbnkgcXVlc3Rpb25zIHRvIGFzayBpbiBhIHNlc3Npb24uXCIgfSlcbiAgLm9wdGlvbmFsKG51bWJlciwgXCJudW1iZXJPZldvcmRzXCIsIHsgZmxhZ3M6IFtcIndcIiwgXCJudW1Xb3Jkc1wiXSwgZGVzY3JpcHRpb246IFwiSG93IG1hbnkgd29yZHMgdG8gc2VsZWN0IGZyb20gdGhlIGZpbGUgdG8gYnVpbGQgcXVlc3Rpb25zIGZyb20uXCIgfSlcbiAgLnJlcXVpcmVkKHN0cmluZywgXCJxdWVzdGlvbkxhbmd1YWdlXCIsIHsgZmxhZ3M6IFtcInFcIiwgXCJxTGFuZ1wiXSwgZGVzY3JpcHRpb246IFwiV2hpY2ggbGFuZ3VhZ2UgdG8gcGhyYXNlIHF1ZXN0aW9ucyBpbiwgZS5nLiBTcGFuaXNoLCBGcmVuY2guXCIgfSlcbiAgLnJlcXVpcmVkKHN0cmluZywgXCJhbnN3ZXJMYW5ndWFnZVwiLCB7IGZsYWdzOiBbXCJhXCIsIFwiYUxhbmdcIl0sIGRlc2NyaXB0aW9uOiBcIldoaWNoIGxhbmd1YWdlIHRoZSBhbnN3ZXJzIHdpbGwgYmUgcGhyYXNlZCBpbiwgZS5nLiBFbmdsaXNoLCBHZXJtYW4uXCIgfSk7XG5cbiAgY29uc3QgcGFyYW1zID0gY21kLnJ1bigpO1xuXG4gIHJldHVybiB7XG4gICAgd29yZEZpbGVwYXRoczogW3BhcmFtcy5maWxlbmFtZV0sXG4gICAgbnVtYmVyT2ZRdWVzdGlvbnM6IChwYXJhbXMubnVtYmVyT2ZRdWVzdGlvbnMgPT0gbnVsbCkgPyAxMCA6IHBhcmFtcy5udW1iZXJPZlF1ZXN0aW9ucyxcbiAgICBudW1iZXJPZldvcmRzOiAocGFyYW1zLm51bWJlck9mV29yZHMgPT0gbnVsbCkgPyA1MCA6IHBhcmFtcy5udW1iZXJPZldvcmRzLFxuICAgIHF1ZXN0aW9uTGFuZ3VhZ2U6IHBhcmFtcy5xdWVzdGlvbkxhbmd1YWdlLFxuICAgIGFuc3dlckxhbmd1YWdlOiBwYXJhbXMuYW5zd2VyTGFuZ3VhZ2VcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsa0NBQWtDO0FBVTFFLE9BQU8sU0FBUyxRQUF1QjtJQUNyQyxNQUFNLE1BQU0sSUFBSSxRQUFRLHdCQUN2QixRQUFRLENBQUMsUUFBUSxZQUFZO1FBQUUsT0FBTztZQUFDO1lBQUs7U0FBVztRQUFFLGFBQWE7SUFBK0QsR0FDckksUUFBUSxDQUFDLFFBQVEscUJBQXFCO1FBQUUsT0FBTztZQUFDO1lBQUs7U0FBZTtRQUFFLGFBQWE7SUFBMEMsR0FDN0gsUUFBUSxDQUFDLFFBQVEsaUJBQWlCO1FBQUUsT0FBTztZQUFDO1lBQUs7U0FBVztRQUFFLGFBQWE7SUFBa0UsR0FDN0ksUUFBUSxDQUFDLFFBQVEsb0JBQW9CO1FBQUUsT0FBTztZQUFDO1lBQUs7U0FBUTtRQUFFLGFBQWE7SUFBK0QsR0FDMUksUUFBUSxDQUFDLFFBQVEsa0JBQWtCO1FBQUUsT0FBTztZQUFDO1lBQUs7U0FBUTtRQUFFLGFBQWE7SUFBdUU7SUFFakosTUFBTSxTQUFTLElBQUksR0FBRztJQUV0QixPQUFPO1FBQ0wsZUFBZTtZQUFDLE9BQU8sUUFBUTtTQUFDO1FBQ2hDLG1CQUFtQixBQUFDLE9BQU8saUJBQWlCLElBQUksSUFBSSxHQUFJLEtBQUssT0FBTyxpQkFBaUI7UUFDckYsZUFBZSxBQUFDLE9BQU8sYUFBYSxJQUFJLElBQUksR0FBSSxLQUFLLE9BQU8sYUFBYTtRQUN6RSxrQkFBa0IsT0FBTyxnQkFBZ0I7UUFDekMsZ0JBQWdCLE9BQU8sY0FBYztJQUN2QztBQUNGLENBQUMifQ==