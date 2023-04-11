import { Ask, PresentResult } from "../modules/qa/QAPortal.ts"

Ask(["q1", "q2", "q3"], 
    (question, answer) => {
      console.log("Q/A: " + question + "/" + answer);
    });


PresentResult(true, "No explanation");
PresentResult(false, "An elaborate explanation");