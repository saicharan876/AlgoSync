const mongoose = require('mongoose');
const Problem = require('../models/ProblemsModel');
const User = require('../models/UserModel');

const {getCodeForcesProblemsByTag,getCodeForcesAllProblems} = require('../utils/CodeForcesAPI'); 

// Function to create a new problem
async function CreateProblem(req, res) {
    try {
        const { title, description, tags, difficulty, solution } = req.body;
        const createdBy = req.user.id || req.user._id;

        const newProblem = new Problem({
            title,
            description,
            tags,
            difficulty,
            solution,
            createdBy
        });

        await newProblem.save();
        res.status(201).json({ message: 'Problem created successfully', problem: newProblem });
    } catch (error) {
        console.error('Error creating problem:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
async function GetAllProblems(req, res) {
  try {
    const localProblems = await Problem.find(); // from your MongoDB
    const codeforcesProblems = await getCodeForcesAllProblems(); // from Codeforces API

    const combinedProblems = [...localProblems, ...codeforcesProblems];

    res.status(200).json(combinedProblems);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}



async function GetProblemsByTag(req, res) {
  const tag = req.params.tag;
  try {
    const problems = await getCodeForcesProblemsByTag(tag);  
    res.status(200).json(problems);
  } catch (error) {
    console.error('Error fetching problems by tag:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {CreateProblem, GetAllProblems, GetProblemsByTag};
