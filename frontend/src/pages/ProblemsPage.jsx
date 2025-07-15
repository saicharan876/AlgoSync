import React, { useEffect, useState } from "react";
import ProblemCard from "../components/ProblemCard";

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [tagFilter, setTagFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const url = tagFilter
          ? `http://localhost:5000/api/problems/tag/${tagFilter}`
          : `http://localhost:5000/api/problems/all`;

        const res = await fetch(url);
        const data = await res.json();
        setProblems(data);
      } catch (err) {
        console.error("Error fetching problems:", err);
        alert("Failed to fetch problems.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [tagFilter]);

  const handleBookmark = async (problem) => {
    try {
      const token = localStorage.getItem("token");
      console.log(token);
      if (!token) {
        alert("Please login to bookmark problems");
        return;
      }

      const res = await fetch(`http://localhost:5000/api/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          
        },
        body: JSON.stringify({ problem }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to bookmark");

      alert("Problem bookmarked!");
      // Mark this problem as bookmarked visually
      const id = problem._id || `${problem.contestId}-${problem.index}`;
      setBookmarkedIds((prev) => [...prev, id]);
    } catch (err) {
      console.error("Bookmarking failed:", err);
      alert("Bookmarking failed. Please try again.");
    }
  };

  return (
    <div className="problems-page">
      <h2>Codeforces Problems</h2>

      <input
        type="text"
        placeholder="Filter by tag (e.g. dp, greedy)"
        value={tagFilter}
        onChange={(e) => setTagFilter(e.target.value.trim())}
        style={{ marginBottom: "1rem", padding: "8px", width: "60%" }}
      />

      {loading ? (
        <p>Loading problems...</p>
      ) : (
        <div className="problems-list">
          {problems.length === 0 ? (
            <p>No problems found.</p>
          ) : (
            problems.map((p) => {
              const key = p._id || `${p.contestId}-${p.index}`;
              return (
                <ProblemCard
                  key={key}
                  problem={p}
                  onBookmark={handleBookmark}
                  isBookmarked={bookmarkedIds.includes(key)}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ProblemsPage;
