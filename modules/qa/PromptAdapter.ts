export function InstantiatePromptForQuestions(qLang:string, n:number, words:string[]):string {
  let prompt = Deno.readTextFileSync("promptforquestions.txt")

  return InstantiatePrompt(prompt, {
    "QLANG": qLang,
    "WORDS": words.join("\n"),
    "N": n
  })
}


export function InstantiatePromptForAssessment(qLang:string, aLang:string, question:string, answer:string):string {
  let prompt = Deno.readTextFileSync("promptforassessment.txt")
  return InstantiatePrompt(prompt, {
    "QLANG": qLang,
    "ALANG": aLang,
    "QUESTION": question,
    "ANSWER": answer
  })
}


export function InstantiatePrompt(prompt:string, values:object):string {
  Object.entries(values)
    .forEach(([key, value]) => prompt = prompt.replaceAll("{"+key+"}", value));
  return prompt;
}