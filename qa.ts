import { Load } from "./modules/TxtAdapter.ts"
import { Parse } from "./modules/qa/CmdlinePortal.ts"
import { PromptForQuestionsAsync, PromptForAssessmentAsync } from "./modules/qa/GPTAdapter.ts"
import { InstantiatePromptForQuestions, InstantiatePromptForAssessment } from "./modules/qa/PromptAdapter.ts"
import { SelectWords } from "./modules/qa/QACore.ts"
import { AskAsync, PresentResult } from "./modules/qa/QAPortal.ts"

const cmdLineParams = Parse();
const allWords = Load(cmdLineParams.wordFilepaths[0]);
const words = SelectWords(allWords, cmdLineParams.numberOfWords);

let prompt = InstantiatePromptForQuestions(cmdLineParams.questionLanguage, 
                                           cmdLineParams.numberOfQuestions, 
                                           words);
const questions = await PromptForQuestionsAsync(prompt);

await AskAsync(questions,
   async (question, answer) => {
     prompt = InstantiatePromptForAssessment(cmdLineParams.questionLanguage, 
                                             cmdLineParams.answerLanguage, 
                                             question, answer);
     const result = await PromptForAssessmentAsync(prompt);
     PresentResult(result.correct, result.explanation);
   });

