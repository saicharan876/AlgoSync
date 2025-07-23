import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Signup.css'; 

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    city: "",
    region: "",
    country: "",
    institute: "",
    linkedin: "",
    github: "",
    codeforces: "",
    atcoder: "",
    leetcode: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data to send
    const dataToSend = {
      username: formData.username,
      email: formData.email,
      password: formData.password, 
      bio: formData.bio,
      city: formData.city,
      region: formData.region,
      country: formData.country,
      institute: formData.institute,
      linkedin: formData.linkedin,
      handles: {
        github: formData.github,
        codeforces: formData.codeforces,
        atcoder: formData.atcoder,
        leetcode: formData.leetcode,
      },
    };

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Signup failed");
        return;
      }

      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Something went wrong during signup.");
    }
  };

  return (
    <div className="signup-page">
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit}>
        
        <input
          className="username"
          name="username"
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          name="bio"
          type="text"
          placeholder="Bio"
          value={formData.bio}
          onChange={handleChange}
        />

        <input
          name="city"
          type="text"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
        />

        <input
          name="region"
          type="text"
          placeholder="Region"
          value={formData.region}
          onChange={handleChange}
        />

        <input
          name="country"
          type="text"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
        />

        <input
          name="institute"
          type="text"
          placeholder="Institute"
          value={formData.institute}
          onChange={handleChange}
        />

        <input
          name="linkedin"
          type="url"
          placeholder="LinkedIn URL"
          value={formData.linkedin}
          onChange={handleChange}
        />

        <input
          name="github"
          type="text"
          placeholder="GitHub handle"
          value={formData.github}
          onChange={handleChange}
        />

        <input
          name="codeforces"
          type="text"
          placeholder="Codeforces handle"
          value={formData.codeforces}
          onChange={handleChange}
        />

        <input
          name="atcoder"
          type="text"
          placeholder="AtCoder handle"
          value={formData.atcoder}
          onChange={handleChange}
        />

        <input
          name="leetcode"
          type="text"
          placeholder="LeetCode handle"
          value={formData.leetcode}
          onChange={handleChange}
        />

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignupPage;
