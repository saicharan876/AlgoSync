import React, { useState } from "react";

const CreateProblemPage = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    difficulty: "",
    solution: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    console.log("Token:", token);

    try {
      const res = await fetch(`http://localhost:5000/api/problems/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((tag) => tag.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Creation failed");
        return;
      }

      alert("Problem created!");
    } catch (err) {
      console.error("Error:", err);
      alert("Server error");
    }
  };

  return (
    <div className="create-problem-page">
      <h2>Create New Problem</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          name="tags"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={handleChange}
        />
        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          required
        >
          <option value="">Select Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <textarea
          name="solution"
          placeholder="Solution"
          value={form.solution}
          onChange={handleChange}
        />
        <button type="submit">Submit Problem</button>
      </form>
    </div>
  );
};

export default CreateProblemPage;
