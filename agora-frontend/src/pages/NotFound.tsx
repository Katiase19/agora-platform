import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="max-w-md mx-auto p-6 mt-16 text-center">
      <p className="text-6xl font-black text-blue-600">404</p>
      <h1 className="text-xl font-semibold mt-3 text-gray-900">Page not found</h1>
      <p className="text-sm text-gray-500 mt-1">The page you're looking for doesn't exist or was moved.</p>
      <Link
        to="/"
        className="inline-block mt-6 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Back to the forum
      </Link>
    </div>
  );
}

export default NotFound;
