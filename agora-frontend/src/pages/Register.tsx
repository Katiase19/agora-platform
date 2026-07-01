import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../api/AuthContext";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courseOfStudy, setCourseOfStudy] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit() {
    setError("");

    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    const payload: Record<string, string | number> = {
      firstName,
      lastName,
      email,
      password,
    };

    if (courseOfStudy) payload.courseOfStudy = courseOfStudy;
    if (academicYear) payload.academicYear = Number(academicYear);

    apiClient
      .post("/auth/register", payload)
      .then((response) => {
        login(response.data.token);
        navigate("/");
      })
      .catch(() => {
        setError("Registration failed. Please check your details and try again.");
      });
  }

  return (
    <div className="max-w-sm mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-1">Create an Account</h1>
      <p className="text-sm text-gray-500 mb-4">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 underline">
          Log in
        </Link>
      </p>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Course of Study{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={courseOfStudy}
            onChange={(e) => setCourseOfStudy(e.target.value)}
            placeholder="e.g. Computer Science"
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Academic Year{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="e.g. 2"
            min={1}
            max={6}
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default Register;