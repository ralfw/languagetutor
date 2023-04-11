import { InstantiatePromptForQuestions, InstantiatePromptForAssessment } from "../modules/qa/PromptAdapter.ts"

const qPrompt = InstantiatePromptForQuestions("SPANISCH", 5, ["casa", "gato", "coche"]);
console.log(qPrompt);

console.log("-------")

const aPrompt = InstantiatePromptForAssessment("SPANISCH", "DEUTSCH", "Él raton come arroz.", "Die Maust isst Reis.")
console.log(aPrompt);