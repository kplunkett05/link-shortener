"use client";

import { useState } from "react";
import QRCode from "react-qr-code";

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShortUrl("");
    setCopied(false);

    try{
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url, customAlias: alias}),
      });

      const data = await response.json();

      if(response.ok){
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

  const handleCopy = () =>{
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayUrl = shortUrl.replace(/^https?:\/\//, "");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900 text-white font-sans">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
          linkflat
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* URL Input */}
          <input
            type="text"
            placeholder="Enter URL (e.g. google.com)"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="p-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Alias Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-200 ml-1">Custom Alias (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 'my-flattened-link'"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="p-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`p-4 rounded-lg font-bold transition-all ${
              loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Shrinking..." : "Shorten URL"}
          </button>
        </form>

        {/* RESULTS AREA */}
        {shortUrl && (
          <div className="mt-8 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* The Link Card */}
            <div className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between">
              {/* Display the 'clean' URL */}
              <a href={shortUrl} target="_blank" className="text-green-400 underline truncate mr-4">
                {displayUrl}
              </a>
              
              {/* Copy Button */}
              <button 
                onClick={handleCopy}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <QRCode value={shortUrl} size={150} />
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
