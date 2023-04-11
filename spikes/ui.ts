import { AskAsync, PresentResult } from "../modules/qa/QAPortal.ts"

await Ask(["q1", "q2", "q3"], 
    async (question, answer) => {
      console.log("Q/A: " + question + "/" + answer);
    });


PresentResult(true, "No explanation");
PresentResult(false, "An elaborate explanation");