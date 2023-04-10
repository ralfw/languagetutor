// CmdlinePortal

export interface CmdlineParams {
  n:number
  s:string
  l:number
  f:string[]
}

export function Parse(args:string[]): CmdlineParams {
  throw new Error("Not implemented");
}

// TxtAdapter

export function Load(filename:string): string[] {
  throw new Error("Not implemented");
}

// GTPAdapter

export function PromptForQuestions(prompt:string):string[] {
  throw new Error("Not implemented")
}

export interface Assessment {
  correct:boolean
  explanation:string
}
export function PromptForAssessment(prompt:string):Assessment {
  throw new Error("Not implemented")
}

// PromptAdapter

export function InstantiatePromptForQuestions(n:number, s:number, words:string[]):string {
  throw new Error("Not implemented")
}

export function InstantiatePromptForAssessment(s:number, answer:string):string {
  throw new Error("Not implemented")
}

// QACore

export function SelectWords(words:string[], l:number):string[] {
  throw new Error("Not implemented")
}

// QAPortal

export function Ask(question:string):string {
  throw new Error("Not implemented")
}

export function PresentResult(correct:boolean, explanation:string) {
  throw new Error("Not implemented")
}