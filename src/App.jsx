import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, Loader2, Clipboard } from "lucide-react";
import ReactMarkdown from "react-markdown";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const userImage = "arun.jpg";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function createAnswer() {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
         API_URL,
        { contents: [{ parts: [{ text: input }] }] }
      );
      const generatedText =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI";
      setMessages((prev) => [...prev, { role: "assistant", content: generatedText }]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      createAnswer();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col w-full h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 py-4 px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Bot className="text-green-400" size={24} />
          <h1 className="text-xl font-semibold">My AI Assistant</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-50 py-6 space-y-6 w-full mx-auto">
        {messages.map((message, index) => {
          const codeMatch = message.content.match(/```([\s\S]*?)```/);
          return (
            <div
              key={index}
              className={`flex justify-center items-center gap-5 p-6 rounded-2xl shadow-xl max-w-fit ${
                message.role === "assistant"
                  ? " py-10 px-3 text-white self-start"
                  : "bg-gray-800 text-white flex-row-reverse"
              }`}
            >
              {message.role === "assistant" ? (
                <Bot className="text-green-400 mt-1" size={24} />
              ) : (
                <img src={userImage} alt="User" className="w-10 h-10 rounded-full mt-1" />
              )}
              <div className="prose prose-invert break-words relative">
                {codeMatch ? (
                  <SyntaxHighlighter language="javascript" style={dracula}>
                    {codeMatch[1]}
                  </SyntaxHighlighter>
                ) : (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                )}
                {codeMatch && (
                  <button
                    onClick={() => copyToClipboard(codeMatch[1])}
                    className="absolute top-2 right-2 bg-gray-700 p-2 rounded-md hover:bg-gray-600"
                  >
                    <Clipboard size={18} className="text-white" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400 bg-gray-800 p-4 rounded-xl shadow-md max-w-[75%] self-start">
            <Loader2 className="animate-spin" size={20} />
            <span>Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-gray-800 p-4 sticky bottom-0 w-full shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-400 border-none resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={createAnswer}
            disabled={isLoading || !input.trim()}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
