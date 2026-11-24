import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, type RegisterRequest } from "../api/authApi";
import { getErrorMessage } from "../api/config";
import { useAuth } from "../api/AuthContext";

const inputClass =
  "w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courseOfStudy, setCourseOfStudy] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const payload: RegisterRequest = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
    };
    if (courseOfStudy.trim()) payload.courseOfStudy = courseOfStudy.trim();
    if (academicYear) payload.academicYear = Number(academicYear);

    setSubmitting(true);
    registerUser(payload)
      .then((data) => {
        login(data.token, data.user);
        navigate("/");
      })
      .catch((err) => {
        setError(getErrorMessage(err, "Registration failed. Please check your details and try again."));
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 mt-4 sm:mt-10">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-1 text-gray-900">Create an Account</h1>
        <p className="text-sm text-gray-500 mb-5">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Log in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input id="firstName" type="text" autoComplete="given-name" value={firstName}
                onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
            </div>

            <div className="flex-1">
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input id="lastName" type="text" autoComplete="family-name" value={lastName}
                onChange={(e) => setLastName(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input id="email" type="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input id="password" type="password" autoComplete="new-password" value={password}
              onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            <p className={`text-xs mt-1 ${password && password.length < 8 ? "text-amber-600" : "text-gray-400"}`}>
              Minimum 8 characters
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex-[2]">
              <label htmlFor="courseOfStudy" className="block text-sm font-medium mb-1">
                Course of Study{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input id="courseOfStudy" type="text" value={courseOfStudy}
                onChange={(e) => setCourseOfStudy(e.target.value)}
                placeholder="e.g. Computer Science" className={inputClass} />
            </div>

            <div className="flex-1">
              <label htmlFor="academicYear" className="block text-sm font-medium mb-1">
                Academic Year{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select id="academicYear" value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)} className={inputClass}>
                <option value="">—</option>
                {[1, 2, 3, 4, 5, 6].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
