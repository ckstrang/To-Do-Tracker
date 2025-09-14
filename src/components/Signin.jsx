import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { Button, Input } from "./UI";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const { session, signInUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInUser(email, password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSignIn}
        className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-lg p-8"
      >
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
          Sign In
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signin"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign up here!
          </Link>
        </p>

        <div className="flex flex-col space-y-4">
          <Input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Username"
          />
          <Input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <Button type="submit" disabled={loading}>
            Sign In
          </Button>
          {error && <p>{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default SignIn;
