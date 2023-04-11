export async function AskAsync(questions:string[], onAnswer: (question:string, answer:string) => void) {
  let i=1;
  for(let question of questions) {
    console.log();
    console.log(`${i++}. Q: ${question}`);
    const answer = prompt("A:");
    await onAnswer(question, answer);
  }
}

export function PresentResult(correct:boolean, explanation:string) {
  if (correct)
    console.log("Congratulations, that's correct!");
  else {
    console.log("Sorry, not correct. Explanation: " + explanation)
  }
}