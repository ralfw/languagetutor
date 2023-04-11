import { PromptForAssessment, PromptForQuestions, askAsync } from "../modules/qa/GPTAdapter.ts"

const assessmentPrompt = `Sei mein Spanisch-Lehrer der mir hilft, Spanisch zu lernen. Ich lege dir einen Satz auf Spanisch vor und meine Übersetzung auf Deutsch. Bitte prüfe die Qualität meiner Übersetzung. Liefere deine Beurteilung ausschließlich in Form einer JSON-Datenstruktur mit diesem Format:

{
  "correct": boolean,
  "explanation": string
}

Im Feld "correct" soll nur true oder false stehen, jenachdem, ob die Übersetzung korrekt ist oder nicht.

Im Feld explanation gib eine  ausführliche Begründung an, falls die Übersetzung nicht korrekt ist.

Bei deiner Prüfung sollst du nicht wörtlich prüfen, sonder sinngemäß.

Hier ist das Satzpaar, das du bitte prüfst:

Spanisch: Él raton come arroz.
Deutsch: Die Maus trinkt Reis.

Deine Beurteilung:`;

const assessment = await PromptForAssessment(assessmentPrompt);

console.log(assessment);

console.log("-------------")

const questionPrompt = `Sei mein Spanisch-Lehrer der mir hilft, Spanisch zu lernen. Ich wünsche mir von dir Übersetzungsaufgaben, die meinem Kenntnisstand von Spanisch entsprechen.

Ich kenne nur diese Worte:

casa
raton
ayer
beber
comer
azul
calle
abrigo
verde
ver

Außerdem kenne aber auch noch diese Aspekte des Spanisch:

- Personalpronomen
- Possesivpronomen
- Verben im Präsenz
- Relativpronomen

Bilde 5 Sätze auf Spanisch, in denen du ausschließlich die mir bekannten Aspekte und die Worte, die ich hier gelistet habe, benutzt. Verben darfst du in den Beispielsätzen nur im Präsenz benutzen! Die Sätze dürfen auch Relativsätze enthalten.

Liefere die Sätze ohne weiteren Kommentar jeweils auf einer eigenen Zeile in deiner Antwort:
`;

const questions = await PromptForQuestions(questionPrompt);

console.log(questions);