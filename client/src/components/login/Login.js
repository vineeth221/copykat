import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../redux/AuthContext";
import {Link} from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault(); // ✅ First line — stop page reload
  
    console.log("Login button clicked"); // ✅ You should see this
    console.log("Backend URL:", process.env.REACT_APP_API_URL);

    setErrorMessage("");
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        login(data.token, data.user);
        window.location.href = "/home"; // ✅ force redirect
      } else {
        setErrorMessage(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Server error. Please try again later.");
    }
  };
  
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Login Form */}
      <div className="bg-white p-6 rounded-md shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Sign in</h2>

        {errorMessage && <p className="text-red-600 text-sm mb-2">{errorMessage}</p>}

        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 rounded-md"
          >
            Sign in
          </button>
        </form>

        <p className="text-xs text-gray-600 mt-4">
          By continuing, you agree to Elekart's{" "}
          <a href="#" className="text-blue-600">Conditions of Use</a> and{" "}
          <a href="#" className="text-blue-600">Privacy Notice</a>.
        </p>

        <Link to="/forgot-password" className="text-blue-600 text-sm mt-3 inline-block">
          Forgot Password?
        </Link>
      </div>

      {/* Create New Account */}
      <div className="mt-5 text-center">
        <p className="text-gray-600 text-sm">New to Elekart?</p>
        <Link
          to="/register"
          className="mt-2 inline-block bg-gray-200 hover:bg-gray-300 text-black font-medium py-2 px-6 rounded-md"
        >
          Create your Elekart account
        </Link>
      </div>
    </div>
  );
}