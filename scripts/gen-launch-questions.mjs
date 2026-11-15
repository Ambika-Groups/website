// Writes LAUNCH-QUESTIONS.md from scripts/launch-questions.mjs. Run: npm run launch-questions
// Tick marks the client already made ("[x]") are kept when the file is regenerated.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ownerStatus, questions, tierLabel } from "./launch-questions.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const file = join(root, "LAUNCH-QUESTIONS.md");

const ticked = new Set();
if (existsSync(file)) {
  for (const m of readFileSync(file, "utf8").matchAll(/<!-- q:(\w+) -->[\s\S]*?\*\*Status:\*\* \[(x| )\]/g)) if (m[2] === "x") ticked.add(m[1]);
}

const statusLine = (q, tier) => {
  const st = ownerStatus[q.key]?.status;
  if (st === "answered") return "[x] Answered";
  if (st === "skipped") return "[ ] Skipped by the owner (safe to skip)";
  if (st === "later") return "[ ] Answer coming later";
  return `[${ticked.has(q.key) ? "x" : " "}] Answered   ${tier === "nice" ? "(safe to skip)" : "(must be answered before launch)"}`;
};
const groupOf = (q) => q.page.split(" (")[0];
const md = [];
md.push(
  "# Launch questions",
  "",
  "Everything the website still needs from you before it can go live, in plain words. Answer them one by one, in any order: **Part 1 first** (the site should not launch without these), then Part 2 as you can.",
  "",
  "- **Where the answer goes** says exactly where to type it. **Quick path:** most answers can be typed straight into `src/config/launch-answers.ts` (each entry is named after its question, e.g. `q5_phone` answers Q5), then rebuild. That needs no admin or Firebase account. **Long term:** the admin (**/admin → Site settings**, then **Publish site**). When both have an answer, the admin wins; `npm run launch-check` says which answers come from the file and which from the admin.",
  "- **If skipped** says what visitors will see. Part 2 questions are **safe to skip**: the site hides that section or uses a safe default instead of showing placeholder text.",
  "- **Status** shows where each question stands after the owner's answers (answered, skipped, or coming later); tick it for any you answer yourself. Then run `npm run launch-check`: it lists what is still missing, using these question numbers (Q1, Q2, …), and says READY when Part 1 is done and no placeholder is visible.",
  "",
  `${questions.length} questions: ${questions.filter((q) => q.tier === "must").length} must-have, ${questions.filter((q) => q.tier === "nice").length} nice-to-have.`,
  "",
  "<!-- Generated from scripts/launch-questions.mjs by `npm run launch-questions`. Edit that file, not the questions below. -->",
  "",
);

for (const tier of ["must", "nice"]) {
  md.push(`## Part ${tier === "must" ? 1 : 2}: ${tierLabel[tier]}`, "");
  let lastGroup = "";
  questions.forEach((q, i) => {
    if (q.tier !== tier) return;
    if (groupOf(q) !== lastGroup) {
      lastGroup = groupOf(q);
      md.push(`### ${lastGroup}`, "");
    }
    md.push(
      `#### Q${i + 1}. ${q.question}`,
      `<!-- q:${q.key} -->`,
      "",
      `- **Example answer:** ${q.example.replace(/\n/g, " / ")}`,
      `- **If skipped:** ${q.ifSkipped}`,
      `- **Where the answer goes:** ${q.answerKey ? `**Quick path:** open \`src/config/launch-answers.ts\`, fill \`${q.answerKey}\`, save and rebuild (no admin needed). **Long term:** ${q.where}` : q.where}`,
      `- **Used on:** ${q.page}`,
      ...(ownerStatus[q.key] ? [`- **Owner's answer and notes:** ${ownerStatus[q.key].note}`] : []),
      `- **Status:** ${statusLine(q, tier)}`,
      "",
    );
  });
}
md.push("---", "", "After the answers: `npm run launch-check`, then deploy (DEPLOY.md, \"The launch order\").", "");
writeFileSync(file, md.join("\n"));
console.log(`LAUNCH-QUESTIONS.md written: ${questions.length} questions (${ticked.size} ticked kept).`);
