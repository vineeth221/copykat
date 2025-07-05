// src/api.js or src/components/Login.jsx
const backendUrl = import.meta.env.VITE_API_URL;

const loginUser = async (email, password) => {
  const response = await fetch(`${backendUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  return data;
};
