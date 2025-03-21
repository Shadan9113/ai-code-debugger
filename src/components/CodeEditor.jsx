import { useState } from "react";
import Editor from "@monaco-editor/react";
import { analyzeAndDebugCode } from "../utils/openai";

export default function CodeEditor() {
  const [code, setCode] = useState("// Write your JavaScript code here...");
  const [aiResult, setAiResult] = useState(""); // Current AI response
  const [fixedCode, setFixedCode] = useState(""); // AI-fixed code
  const [consoleOutput, setConsoleOutput] = useState(""); // Console logs/errors
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // Store AI response history

  const handleAnalyzeAndDebug = async () => {
    setLoading(true);
    const result = await analyzeAndDebugCode(code);
    setAiResult(result);

    // Save response in history
    setHistory((prev) => [...prev, { code, response: result }]);

    // Extract AI-fixed code from response
    const match = result.match(/```javascript([\s\S]*?)```/);
    if (match) {
      setFixedCode(match[1].trim());
    }

    setLoading(false);
  };

  const applyFixedCode = () => {
    if (fixedCode) {
      setCode(fixedCode);
    }
  };

  const runCode = () => {
    try {
      let logs = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.join(" "));
        originalConsoleLog(...args);
      };

      new Function(code)(); // Execute the user’s code in a sandboxed function

      console.log = originalConsoleLog;
      setConsoleOutput(logs.join("\n"));
    } catch (error) {
      setConsoleOutput(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center p-5 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4 text-blue-400">AI Debugger & Code Analyzer</h1>

      <div className="w-full max-w-3xl border border-gray-700 rounded-lg overflow-hidden shadow-lg">
        <Editor 
          height="300px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value)}
        />
      </div>

      <div className="flex gap-3 mt-4">
        <button 
          onClick={handleAnalyzeAndDebug}
          className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-600 shadow-md"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "AI Analyze & Debug"}
        </button>

        {fixedCode && (
          <button 
            onClick={applyFixedCode}
            className="px-6 py-2 bg-green-500 rounded hover:bg-green-600 shadow-md"
          >
            Fix My Code
          </button>
        )}

        <button 
          onClick={runCode}
          className="px-6 py-2 bg-yellow-500 rounded hover:bg-yellow-600 shadow-md"
        >
          Run Code
        </button>
      </div>

      {/* Display AI Debugging + Analysis Response */}
      {aiResult && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg w-full max-w-3xl shadow-lg">
          <h2 className="text-lg font-semibold text-purple-300">AI Debugging & Analysis:</h2>
          <pre className="whitespace-pre-wrap text-gray-200">{aiResult}</pre>
        </div>
      )}

      {/* Display Console Output */}
      {consoleOutput && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg w-full max-w-3xl shadow-lg">
          <h2 className="text-lg font-semibold text-yellow-300">Console Output:</h2>
          <pre className="whitespace-pre-wrap text-gray-100">{consoleOutput}</pre>
        </div>
      )}

      {/* AI Response History Section */}
      {history.length > 0 && (
        <div className="mt-6 w-full max-w-3xl bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-blue-300 mb-2">History</h2>
          <div className="max-h-40 overflow-y-auto">
            {history.map((item, index) => (
              <div key={index} className="border-b border-gray-600 py-2">
                <p className="text-gray-400 text-sm">Code:</p>
                <pre className="whitespace-pre-wrap text-gray-300">{item.code}</pre>
                <p className="text-gray-400 text-sm mt-2">AI Response:</p>
                <pre className="whitespace-pre-wrap text-green-400">{item.response}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
