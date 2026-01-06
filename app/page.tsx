"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShortUrl("");

    try{
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: url}),
      });

      const data = await response.json();

      if(data.shortId){
        const domain = window.location.origin;
        setShortUrl(`${domain}/${data.shortId}`);
      }
      else{
        alert("Error: " + data.error);
      }
    }
    catch(error){
      console.error(error);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    // A simple centered container
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="z-10 w-full max-w-md items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
          Link Shrinker
        </h1>

        {/* The Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="url"
            placeholder="Paste your long URL here..."
            required
            value={url}
            // "onChange" updates our State every time you type a key
            onChange={(e) => setUrl(e.target.value)} 
            className="p-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading} // Gray out button if working
            className={`p-4 rounded-lg font-bold transition-all ${
              loading 
                ? "bg-gray-600 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Shrinking..." : "Shorten URL"}
          </button>
        </form>

        {/* The Result: Only shows if shortUrl is not empty */}
        {shortUrl && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <p className="mb-2 text-gray-400">Your short link:</p>
            <div className="flex items-center gap-2">
              <a 
                href={shortUrl} 
                target="_blank" // Open in new tab
                className="text-xl text-green-400 underline break-all"
              >
                {shortUrl}
              </a>
            </div>
            {/* Optional: Add a copy button logic later */}
          </div>
        )}
      </div>
    </main>
  );
}
