import axios from "axios";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Ensure API key is loaded

export async function analyzeAndDebugCode(code) {
  const prompt = `
  You are an AI JavaScript debugger and performance optimizer. Analyze the following code and provide:
  - **Bug Fixes**
  - **Performance Optimizations**
  - **Security Issues**
  - **Best Practices**
  
  Code:
  ${code}
  `;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`, // ✅ Fix: API Key included in URL
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data.candidates[0].content;
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    return `Error: ${error.response?.data?.error?.message || "Unable to fetch AI response."}`;
  }
}
