const axios = require("axios");
const CODEFORCES_API = "https://codeforces.com/api/problemset.problems";


function mapCodeforcesToLocalModel(cfProblem, createdBy = null) {
  let difficulty = "Easy";
  const rating = cfProblem.rating || 0;

  if (rating < 800) difficulty = "Easy";
  else if (rating < 1200) difficulty = "Medium";
  else if (rating >= 1400) difficulty = "Hard";

  return {
    title: cfProblem.name,
    description: `Problem from Codeforces Contest ${cfProblem.contestId} - ${cfProblem.index}`,
    tags: cfProblem.tags || [],
    difficulty,
    solution: "",
    createdBy,
  };
}

async function fetchCodeforcesProblems(tag = "", limit = 100) {
  try {
    const url = tag
      ? `${CODEFORCES_API}?tags=${encodeURIComponent(tag)}`
      : CODEFORCES_API;

    const { data } = await axios.get(url);
    if (data.status !== "OK") throw new Error("Codeforces API error");

    const problems = data.result.problems;

    return problems.slice(0, limit);
  } catch (err) {
    console.error("Fetch error:", err.message);
    return [];
  }
}

async function getCodeForcesProblemsByTag(tag = "", limit = 100, createdBy = null) {
  const rawProblems = await fetchCodeforcesProblems(tag, limit);
  return rawProblems.map(p => mapCodeforcesToLocalModel(p, createdBy));
}

async function getCodeForcesAllProblems(limit = 100, createdBy = null) {
  return getCodeForcesProblemsByTag("", limit, createdBy);
}

module.exports = { getCodeForcesProblemsByTag, getCodeForcesAllProblems,mapCodeforcesToLocalModel };
