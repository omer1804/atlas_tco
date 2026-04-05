import { useState } from "react";

const CORRECT_PASSWORD = "Kk123456!";

export default function PasswordGate({ children }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  if (unlocked) return children;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === CORRECT_PASSWORD) {
      setUnlocked(true);
    } else {
      setError(true);
      setInput("");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center">
        <div className="mb-6">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Atlas TCO Analyzer</h2>
          <p className="text-sm text-slate-500 mt-1">Enter your password to access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            className={`w-full border rounded-xl px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 transition-all ${
              error
                ? "border-red-400 focus:ring-red-300 bg-red-50"
                : "border-slate-200 focus:ring-blue-300"
            }`}
          />
          {error && (
            <p className="text-xs text-red-500">Incorrect password. Please try again.</p>
          )}
          <button
            type="submit"
            className="w-full bg-slate-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            Enter
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-6">
          Contact <span className="font-medium text-slate-600">Omer Agami</span> if you would like the password details
        </p>
      </div>
    </div>
  );
}