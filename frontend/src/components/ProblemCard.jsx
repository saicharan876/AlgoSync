import React from "react";
import './ProblemCard.css'

const ProblemCard = ({ problem, onBookmark }) => {
  
  const extractContestInfo = () => {
    if (!problem.description) return null;

    // Example description: "Problem from Codeforces Contest 2124 - I"
    const regex = /Contest\s+(\d+)\s*-\s*([A-Z0-9]+)/i;
    const match = problem.description.match(regex);
    if (!match) return null;

    return {
      contestId: match[1],
      index: match[2],
    };
  };

  const contestInfo = extractContestInfo();

  const getCodeforcesURL = () => {
    if (!contestInfo) return "#";
    return `https://codeforces.com/contest/${contestInfo.contestId}/problem/${contestInfo.index}`;
  };

  const openProblem = () => {
    const url = getCodeforcesURL();
    if (url === "#") {
      alert("No valid Codeforces URL found.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="problem-card">
      <div className="details">
        <h3 className="problem-name">{problem.name || "Untitled Problem"}</h3>
        {problem.description && <p className="description">{problem.description}</p>}
        <p className="tags"><span style={{opacity:0.5}}>Tags</span>: {problem.tags?.join(", ") || "None"}</p>
        <p className="difficulty"><span style={{opacity:0.5}}>Difficulty</span>: {problem.difficulty || "N/A"}</p>
      </div>

      <div className="card-actions">
        <button onClick={() => onBookmark(problem)} className="button">Bookmark</button>
        {contestInfo && (
          <button onClick={openProblem} className="button">Open Problem</button>
        )}
      </div>
    </div>
  );
};

export default ProblemCard;
