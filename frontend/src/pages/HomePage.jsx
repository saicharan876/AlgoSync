import React from 'react';
import "./HomePage.css"
import Footer from '../components/Footer';
import { CheckSquare2Icon } from 'lucide-react'

const Home = () => {
  return (
    <div className='home-page'>
      <div className="page-container">
        <div className='intro'>
          <div>
            <h1 className='main-head'>Welcome to AlgoSync</h1>
            <p className='p1'>
              <CheckSquare2Icon className='checkicon'/>
              <span> Practice algorithmic problems by topic, powered by real Codeforces questions. </span>
            </p>
            <p className='p1'>
              <CheckSquare2Icon className='checkicon'/>
              <span>Collaborate with peers in real time to solve, discuss, and grow together.</span>
            </p>
            <p className='p1'>
              <CheckSquare2Icon className='checkicon'/>
              <span>Bookmark important questions and revisit them anytime to reinforce<p> learning and track your progress.</p>
              </span>
            </p>
          </div>
          {/*<p>This is your dashboard or landing page after login.</p> */}
          <img className='img' src='image.jpg' alt='coding-image'/>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Home;
