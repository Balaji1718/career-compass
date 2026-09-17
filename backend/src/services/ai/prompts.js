'use strict';

const SYSTEM_BASE =
  'You are a concise career-guidance assistant for computing students. ' +
  'You never invent numeric match scores: the scores you are given are already ' +
  'calculated by a deterministic engine and must be treated as facts. ' +
  'You reply with a single valid JSON object and nothing else.';

function careerExplanationPrompt(analysis) {
  return [
    `Career: ${analysis.careerTitle}`,
    `Deterministic match score (do not change): ${analysis.overallMatchScore}% (${analysis.matchClassification})`,
    `Skill coverage: ${analysis.skillCoverage}%`,
    `Matched skills: ${analysis.matchedSkills.map((s) => s.skillName).join(', ') || 'none'}`,
    `Weak skills: ${analysis.weakSkills
      .map((s) => `${s.skillName} (level ${s.userLevel}/${s.requiredLevel})`)
      .join(', ') || 'none'}`,
    `Missing skills: ${analysis.missingSkills
      .map((s) => `${s.skillName} (needs level ${s.requiredLevel})`)
      .join(', ') || 'none'}`,
    '',
    'Explain this result to the learner. Respond with JSON exactly shaped as:',
    '{"summary": string, "strengths": string[], "gaps": string[], "recommendations": string[]}',
  ].join('\n');
}

function learningRecommendationsPrompt(analysis) {
  const gaps = analysis.priorityGaps
    .slice(0, 8)
    .map(
      (g) =>
        `${g.skillName} | importance ${g.importance} | current ${g.userLevel} | required ${g.requiredLevel}`
    )
    .join('\n');
  return [
    `Career: ${analysis.careerTitle}`,
    'Priority gaps (already ranked deterministically, keep this order):',
    gaps || 'none',
    '',
    'Respond with JSON exactly shaped as:',
    '{"summary": string, "items": [{"skill": string, "priority": number, "reason": string, "practice": string[]}]}',
  ].join('\n');
}

function roadmapPrompt(analysis, stageSkills) {
  return [
    `Career goal: ${analysis.careerTitle}`,
    `Deterministic match score: ${analysis.overallMatchScore}%`,
    'Learn these skills in exactly this order (order was computed deterministically):',
    stageSkills
      .map(
        (s, i) =>
          `${i + 1}. ${s.skillName} (current ${s.userLevel}, target ${s.requiredLevel}, importance ${s.importance})`
      )
      .join('\n'),
    '',
    'Write one stage per skill, keeping the order. Respond with JSON exactly shaped as:',
    '{"summary": string, "stages": [{"title": string, "skill": string, "reason": string, "projectIdeas": string[], "estimatedHours": number}]}',
  ].join('\n');
}

function resumePrompt(resumeText) {
  return [
    'Extract technical and professional skills mentioned in this resume text.',
    'Only list skills that genuinely appear. Do not guess.',
    'Estimate proficiency 1 (Beginner) to 4 (Expert) from the wording.',
    '',
    'Resume text:',
    resumeText.slice(0, 12000),
    '',
    'Respond with JSON exactly shaped as:',
    '{"skills": [{"name": string, "proficiencyLevel": number, "evidence": string}]}',
  ].join('\n');
}

module.exports = {
  SYSTEM_BASE,
  careerExplanationPrompt,
  learningRecommendationsPrompt,
  roadmapPrompt,
  resumePrompt,
};
