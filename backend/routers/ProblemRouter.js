const express = require('express');
const router = express.Router();

const {CreateProblem,GetAllProblems,GetProblemsByTag} = require('../controllers/ProblemController.js');
const {Auth} = require('../middleware/auth.js');


// Route to create a new problem
router.post('/create',Auth, CreateProblem);
router.get('/all', GetAllProblems);
router.get('/tag/:tag', GetProblemsByTag);

module.exports = router;


