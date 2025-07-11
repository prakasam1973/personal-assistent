import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center min-h-[80vh] py-10 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-10 border border-border flex flex-col items-center">
        <h1 className="text-6xl font-extrabold text-blue-600 mb-4 tracking-tight">404</h1>
        <p className="text-2xl text-blue-900 font-semibold mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8 text-center">
          The page you are looking for does not exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-block bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold px-6 py-3 rounded-lg shadow hover:scale-105 transition"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
