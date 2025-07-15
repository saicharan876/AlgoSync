import React, { useEffect, useState } from "react";

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view your bookmarks.");
          return;
        }

        const res = await fetch("http://localhost:5000/api/bookmarks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to fetch bookmarks.");
          return;
        }

        setBookmarks(data);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        setError("Server error while fetching bookmarks.");
      }
    };

    fetchBookmarks();
  }, []);

  // Helper function to extract contest info from a problem description string
  const extractContestInfo = (content) => {
    if (!content) return null;

    // Example description: "Problem from Codeforces Contest 2124 - I"
    const regex = /Contest\s+(\d+)\s*-\s*([A-Z0-9]+)/i;
    const match = content.match(regex);
    if (!match) return null;

    return {
      contestId: match[1],
      index: match[2],
    };
  };

  // Given a problem description, get the Codeforces URL
  const getCodeforcesURL = (content) => {
    const contestInfo = extractContestInfo(content);
    if (!contestInfo) return "#";
    return `https://codeforces.com/contest/${contestInfo.contestId}/problem/${contestInfo.index}`;
  };

  // Opens the problem in a new tab, given its description
  const openProblem = (content) => {
    const url = getCodeforcesURL(content);
    if (url === "#") {
      alert("No valid Codeforces URL found.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bookmarks-page">
      <h2>Your Bookmarked Problems</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {bookmarks.length === 0 && !error ? (
        <p>No bookmarks yet.</p>
      ) : (
        <ul>
          {bookmarks.map((bookmark) => (
            <li key={bookmark._id}>
              <h4>{bookmark.name}</h4>
              <p>{bookmark.content}</p>
              <p>Difficulty: {bookmark.difficulty}</p>
              <p>Tags: {bookmark.tags.join(", ")}</p>
              <button onClick={() => openProblem(bookmark.content)}>
                Open Problem
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookmarksPage;
