import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const Joke: React.FC = () => {
  const [joke, setJoke] = useState<{ setup: string; punchline: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJoke = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://official-joke-api.appspot.com/random_joke");
      if (!res.ok) throw new Error("Failed to fetch joke");
      const data = await res.json();
      setJoke({ setup: data.setup, punchline: data.punchline });
    } catch (err) {
      setError("Couldn't fetch a joke. Try again!");
      setJoke(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a joke on first render
  React.useEffect(() => {
    fetchJoke();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-[40vh] py-10 bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100">
      <div className="w-full max-w-lg bg-white/90 rounded-2xl shadow-2xl p-0 border border-border overflow-hidden">
        <div className="flex items-center justify-center px-8 py-6 bg-gradient-to-r from-yellow-400 to-pink-300">
          <h2 className="text-2xl font-extrabold text-white drop-shadow tracking-tight">Make Me Laugh</h2>
        </div>
        <div className="p-8 flex flex-col items-center">
          {loading ? (
            <div className="text-blue-600 font-semibold mb-4">Loading...</div>
          ) : error ? (
            <div className="text-red-600 font-semibold mb-4">{error}</div>
          ) : joke ? (
            <div className="mb-6 text-center">
              <div className="text-lg font-bold text-blue-900 mb-2">{joke.setup}</div>
              <div className="text-pink-700 font-semibold">{joke.punchline}</div>
            </div>
          ) : null}
          <Button
            onClick={fetchJoke}
            className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white shadow-md hover:scale-105 transition"
          >
            New Joke
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Joke;