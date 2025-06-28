import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
  
    try {
      const response = await fetch("http://localhost:8005/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
  
      const data = await response.json();
  
      if (data.message === "User registered successfully") {
        const registeredEmail = email;
        const otp = data.otp || "";
  
        // ✅ Clear fields and force re-render
        setEmail("");
        setPassword("");
        setName("");
  
        setTimeout(() => {
          navigate("/login", { state: { email: registeredEmail, otp: otp } });
        }, 500);
      } else {
        setErrorMessage(data.message || "Registration failed. Try again.");
      }
    } catch (error) {
      setErrorMessage("Error registering. Please try again.");
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Amazon Logo */}
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
        alt="Amazon Logo"
        className="w-32 mb-5"
      />

      {/* Registration Form */}
      <div className="bg-white p-6 rounded-md shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Create Account</h2>
        {errorMessage && <p className="text-red-600 text-sm mb-2">{errorMessage}</p>}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

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
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 rounded-md"
          >
            Continue
          </button>
        </form>

        <p className="text-xs text-gray-600 mt-4">
          By creating an account, you agree to Amazon's {" "}
          <a href="#" className="text-blue-600">Conditions of Use</a> and {" "}
          <a href="#" className="text-blue-600">Privacy Notice</a>.
        </p>
      </div>

      {/* Already have an account */}
      <div className="mt-5 text-center">
        <p className="text-gray-600 text-sm">Already have an account?</p>
        <Link
          to="/login"
          className="mt-2 inline-block bg-gray-200 hover:bg-gray-300 text-black font-medium py-2 px-6 rounded-md"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
