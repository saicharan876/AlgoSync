import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import Homepage from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import CreateProblemPage from "./pages/CreateProblemPage";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-center" />
        <div className="page">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginPage authType="Login" />} />
            <Route path="/signup" element={<SignupPage authType="Signup" />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/create" element={<CreateProblemPage />} />

            {/* Example Protected Route */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <h1>Welcome to the Dashboard</h1>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
