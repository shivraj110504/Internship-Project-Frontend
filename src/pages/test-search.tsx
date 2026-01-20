// Training/stackoverflow/stack/src/pages/test-search.tsx
// TEMPORARY DEBUG PAGE - Delete after testing

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosinstance";

export default function TestSearchPage() {
  const { user, searchUsers } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [directResults, setDirectResults] = useState<any>(null);

  const testAuthContextSearch = async () => {
    setError(null);
    setResults(null);
    try {
      console.log("Testing AuthContext searchUsers with query:", query);
      const data = await searchUsers(query);
      console.log("AuthContext search results:", data);
      setResults(data);
    } catch (err: any) {
      console.error("AuthContext search error:", err);
      setError(err.response?.data || err.message);
    }
  };

  const testDirectAPI = async () => {
    setError(null);
    setDirectResults(null);
    try {
      console.log("Testing direct API call with query:", query);
      const { data } = await axiosInstance.get("/post/search", {
        params: { query }
      });
      console.log("Direct API results:", data);
      setDirectResults(data);
    } catch (err: any) {
      console.error("Direct API error:", err);
      setError(err.response?.data || err.message);
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">🔍 Search Debug Tool</h1>

        <div className="space-y-6">
          {/* Current User Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Current User:</h2>
            <pre className="text-xs bg-white p-3 rounded overflow-auto">
              {JSON.stringify({
                id: user?._id,
                name: user?.name,
                handle: user?.handle,
                email: user?.email,
                friendsCount: user?.friends?.length || 0
              }, null, 2)}
            </pre>
          </div>

          {/* Search Input */}
          <div>
            <label className="block font-semibold mb-2">Search Query:</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter name or @handle"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Try: "shiv", "@shiv", "{user?.name?.substring(0, 3)}"
            </p>
          </div>

          {/* Test Buttons */}
          <div className="flex gap-3">
            <Button onClick={testAuthContextSearch}>
              Test via AuthContext
            </Button>
            <Button onClick={testDirectAPI} variant="outline">
              Test Direct API Call
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">❌ Error:</h3>
              <pre className="text-xs text-red-700 overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )}

          {/* AuthContext Results */}
          {results && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">
                ✅ AuthContext Results ({Array.isArray(results) ? results.length : 0}):
              </h3>
              <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}

          {/* Direct API Results */}
          {directResults && (
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">
                ✅ Direct API Results ({Array.isArray(directResults) ? directResults.length : 0}):
              </h3>
              <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-96">
                {JSON.stringify(directResults, null, 2)}
              </pre>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📋 Debug Steps:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Check if you're logged in (see Current User above)</li>
              <li>Enter a search query (try your own name first)</li>
              <li>Click "Test via AuthContext" to test the normal flow</li>
              <li>Click "Test Direct API Call" to test the backend directly</li>
              <li>Check browser console (F12) for detailed logs</li>
              <li>Check backend terminal for search logs</li>
            </ol>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
}