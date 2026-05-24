import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    if (!email || !password) {

      alert(
        "Please enter email and password"
      );

      return;
    }

    try {

      setLoading(true);

      const response =
        await axios.post(

          "https://ai-resume-generator-3.onrender.com/api/auth/login",

          {
            email: email,
            password: password,
          }
        );

      alert(response.data);

      if (
        response.data ===
        "Login successful"
      ) {

        // SAVE USER
        localStorage.setItem(
          "userEmail",
          email
        );

        navigate("/dashboard");
      }

    } catch (error) {

      console.log(error);

      alert("Login failed");
    }

    setLoading(false);
  };

  return (

    <div className="min-h-screen flex bg-gray-950">

      {/* LEFT SECTION */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-gray-900 items-center justify-center p-12">

        <div>

          <h1 className="text-6xl font-bold text-white leading-tight">

            Build ATS-Friendly

            <br />

            Resumes with AI

          </h1>

          <p className="text-gray-200 mt-6 text-lg leading-relaxed max-w-lg">

            Generate modern FAANG-style resumes instantly using AI.

            Optimize your resume according to any job description.

          </p>

          <div className="mt-10 flex gap-4">

            <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white backdrop-blur-md">

              AI Powered

            </div>

            <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white backdrop-blur-md">

              ATS Optimized

            </div>

          </div>

        </div>

      </div>

      {/* RIGHT SECTION */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-6">

        <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl">

          <h2 className="text-4xl font-bold text-gray-900 text-center">

            Welcome Back

          </h2>

          <p className="text-center text-gray-500 mt-3">

            Login to continue building your AI resume

          </p>

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >

            {/* EMAIL */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">

                Email

              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            {/* PASSWORD */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">

                Password

              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition duration-300"
            >

              {
                loading
                  ? "Logging in..."
                  : "Login"
              }

            </button>

          </form>

          {/* REGISTER */}
          <p className="text-center text-gray-500 mt-6">

            Don’t have an account?

            <Link
              to="/register"
              className="text-indigo-600 font-semibold ml-2"
            >

              Register

            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;