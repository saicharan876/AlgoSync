import React, { useEffect, useState } from "react";
import "./BookmarkPage.css"

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
      <h2 className="h1">Your Bookmarked Problems</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {bookmarks.length === 0 && !error ? (
        <p className="h1">No bookmarks yet.</p>
      ) : (
        <ul>
          {bookmarks.map((bookmark) => (
            <li key={bookmark._id} className="bookpb">
              <div className="left">
                <h4 className="problem-name">{bookmark.name}</h4>
                <p className="description">{bookmark.content}</p>
                <p className="difficulty"><span style={{opacity:0.5}}>Difficulty</span>:{bookmark.difficulty}</p>
                <p className="tags"><span style={{opacity:0.5}}>Tags</span>: {bookmark.tags.join(", ")}</p>
              </div>
              <div className="right">
                <button onClick={() => openProblem(bookmark.content)} className="b1">
                  Open Problem
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookmarksPage;
