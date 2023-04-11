// Source: https://github.com/dyedgreen/clay
import { Command, number, string } from "https://deno.land/x/clay/mod.ts";

export interface CmdlineParams {
  wordsFilepaths:string[]
  numberOfQuestions:number
  numberOfWords:number
  questionLanguage:string
  answerLanguage:string
}

export function Parse(): CmdlineParams {
  const cmd = new Command("Language Tutor - Q&A")
  .required(string, "filename", { flags: ["f", "filename"], description: "Name of a .txt file with a list of words. One word per line." })
  .optional(number, "numberOfQuestions", { flags: ["n", "numQuestions"], description: "How many questions to ask in a session." })
  .optional(number, "numberOfWords", { flags: ["w", "numWords"], description: "How many words to select from the file to build questions from." })
  .required(string, "questionLanguage", { flags: ["q", "qLang"], description: "Which language to phrase questions in, e.g. Spanish, French." })
  .required(string, "answerLanguage", { flags: ["a", "aLang"], description: "Which language the answers will be phrased in, e.g. English, German." });

  const params = cmd.run();

  return {
    wordFilepaths: [params.filename],
    numberOfQuestions: (params.numberOfQuestions == null) ? 10 : params.numberOfQuestions,
    numberOfWords: (params.numberOfWords == null) ? 50 : params.numberOfWords,
    questionLanguage: params.questionLanguage,
    answerLanguage: params.answerLanguage
  }
}
