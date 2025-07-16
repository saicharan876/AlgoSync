const axios = require("axios");

const languageToId = {
  python3: 71,
  cpp: 54,
  java: 62,
  nodejs: 93,
  c: 50,
  ruby: 72,
  go: 60,
  bash: 46,
  php: 68,
  rust: 94,
  // Extend as needed
};

async function compileCode(code, language) {
  const langId = languageToId[language];
  if (!langId) throw new Error("Unsupported language");
  console.log("Received compile request:", code?.slice(0, 30), language);


  // Submit code for compilation
  const res = await axios.post(
    "https://judge0-ce.p.rapidapi.com/submissions",
    {
      source_code: code,
      language_id: langId,
      wait: false, 
    },
    {
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      },
    }
  );

  const token = res.data.token;
  const maxAttempts = 10;
  const delay = 1000;

  // Poll for result up to maxAttempts
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const statusRes = await axios.get(
      `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
      {
        headers: {
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        },
      }
    );

    const result = statusRes.data;
    const statusId = result.status?.id;

    if (statusId > 2) {
      // Finished
      return (
        result.stdout ||
        result.stderr ||
        result.compile_output ||
        "No output received"
      );
    }

    // Wait before next attempt
    await new Promise((r) => setTimeout(r, delay));

  }

  throw new Error("Compilation timeout. Try again later.");
}

module.exports = compileCode;
