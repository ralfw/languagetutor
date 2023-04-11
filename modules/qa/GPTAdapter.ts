import { readJsonSync } from "https://deno.land/std/fs/mod.ts";

// High level adapter

export async function PromptForQuestions(prompt:string):string[] {
  const txt = await askAsync(prompt, 0.25);
  return txt.split("\n");
}


export interface Assessment {
  correct:boolean
  explanation:string
}

export async function PromptForAssessment(prompt:string):Assessment {
  const json = await askAsync(prompt, 0.25)
  return JSON.parse(json) as Assessment;
}


// Low level adapter

const SECRET_KEY = Deno.env.get("openaiapikey");
const MAX_TOKENS = 2048;
const DEFAULT_MODEL = "text-davinci-003";
const DEFAULT_TEMPERATURE = 0.7

interface OpenAIRequestPayload {
  model: string;
  prompt: string;
  temperature: number;
  max_tokens: number;
}

interface OpenAIResponse {
  choices: {
    text: string;
    index: number;
    logprobs: any;
    finish_reason: string;
  }[];
}


export async function askAsync(
  prompt: string,
  temperature = DEFAULT_TEMPERATURE,
  model = DEFAULT_MODEL
): Promise<string> {
  const payload: OpenAIRequestPayload = {
    model,
    prompt,
    temperature,
    max_tokens: MAX_TOKENS,
  };
  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${SECRET_KEY}`,
  });
  const body = JSON.stringify(payload);

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers,
    body,
  });
  const res: OpenAIResponse = await response.json();

  try {
    const generatedText = res.choices[0].text.trim();
    return generatedText;
  } catch(error) {
    throw new Error("No response from GPT-3 API! [" + error + "]");
  }
}