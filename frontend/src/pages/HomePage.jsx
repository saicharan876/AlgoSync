import { useEffect, useRef, useState } from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom';

const Homepage = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const [codeSymbols] = useState([
    { content: '</>', speed: 0.5, x: 10, y: 30 },
    { content: '{}', speed: 0.7, x: 85, y: 70 },
    { content: '()', speed: 0.4, x: 70, y: 20 },
    { content: '[]', speed: 0.6, x: 20, y: 80 },
    { content: '=>', speed: 0.8, x: 65, y: 50 },
    { content: '&&', speed: 0.3, x: 30, y: 60 }
  ]);

  // Mouse move effect for particles
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Simple particle effect on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: Math.random() * 2 - 1,
      speedY: Math.random() * 2 - 1,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(72, 92, 255, 0.4)';
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className="homepage">
      <canvas ref={canvasRef} className="particle-canvas" />
      <div className="content">
        <div className="hero">
          <h1 className="hero-title">
            <span className="gradient-text">Collaborate. Code. Connect.</span>
          </h1>
          <p className="hero-subtitle">
            Join a community where developers share, learn, and grow together.
          </p>
          <div className="hero-buttons">
            <Link to='/login'><button className="primary-btn">Get Started</button></Link>
            <Link to='/chatroom'><button className="secondary-btn">Learn More</button></Link>
          </div>
        </div>
        <div className="floating-symbols">
          {codeSymbols.map((sym, i) => (
            <div
              key={i}
              className="code-symbol"
              style={{
                left: `${sym.x}%`,
                top: `${sym.y}%`,
                animationDuration: `${10 / sym.speed}s`
              }}
            >
              {sym.content}
            </div>
          ))}
        </div>
        <div className="features">
            <div className="feature-card">
                <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f5bd5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                </div>
                <h3>Real-time Collaboration</h3>
                <p>Code together with your peers in real-time.</p>
            </div>
            <div className="feature-card">
                <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f5bd5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                </div>
                <h3>Bookmark & Organize</h3>
                <p>Save your important questions and solutions.</p>
            </div>
            <div className="feature-card">
                <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f5bd5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                </div>
                <h3>Build Your Profile</h3>
                <p>Showcase your skills and connect with others.</p>
            </div>
        </div>
    </div>
</div>
  );
};

export default Homepage;
