import { useState } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";

function App() {
	const [question, setQuestion] = useState("");

	// CRITICAL FIX: This MUST be an empty string "", not an array []
	const [result, setResult] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const askQuestion = async () => {
		if (!question.trim()) return;

		setIsLoading(true);

		try {
			const apiKey = import.meta.env.VITE_CHATBOAT_API_KEY;
			const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

			const response = await fetch(URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contents: [{ parts: [{ text: question }] }],
				}),
			});

			if (!response.ok) throw new Error("API Error");

			const data = await response.json();

			if (data.candidates && data.candidates.length > 0) {
				// Grab the raw text string directly from Gemini
				const rawMarkdown = data.candidates[0].content.parts[0].text;
				setResult(rawMarkdown);
				setQuestion("");
			}
		} catch (error) {
			console.error(error);
			setResult("Error communicating with the AI.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="grid grid-cols-5 h-screen text-center text-white">
			<div className="col-span-1 bg-zinc-800 border-r border-zinc-700 pt-6">
				<h1 className="font-bold text-xl">ChatBoatAI</h1>
			</div>

			<div className="col-span-4 flex flex-col bg-zinc-900">
				<div className="container flex-1 overflow-y-auto hide-scrollbar p-10 text-left">
					{/* If we have a result, render it with Markdown and spacing */}
                    {result && (
                        <div className="bg-zinc-800 p-6 rounded-2xl shadow-lg border border-zinc-700">
                            
                            {/* FIX: We moved the text classes to this wrapper div! */}
                            <div className="leading-relaxed text-zinc-200">
                                <ReactMarkdown
                                    /* FIX: No className here anymore! */
                                    components={{
                                        p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-4 text-blue-400" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2 text-blue-300" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2 ml-2" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 ml-2" {...props} />,
                                        li: ({node, ...props}) => <li className="text-zinc-300" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />
                                    }}
                                >
                                    {result}
                                </ReactMarkdown>
                            </div>

                        </div>
                    )}

					{/* Show a loading message while waiting */}
					{isLoading && (
						<div className="text-zinc-500 animate-pulse mt-4">
							ChatBoatAI is thinking...
						</div>
					)}
				</div>

				<div className="p-6">
					<div className="bg-zinc-800 w-3/4 text-white text-center mx-auto p-2 rounded-3xl border border-zinc-700 flex h-16 shadow-lg">
						<input
							name="text"
							type="text"
							value={question}
							onChange={(event) =>
								setQuestion(event.target.value)
							}
							// Let the user hit Enter to send
							onKeyDown={(e) =>
								e.key === "Enter" && askQuestion()
							}
							className="outline-none bg-transparent flex-1 px-6 text-lg"
							placeholder="Ask me Anything..."
							disabled={isLoading}
						/>
						<button
							onClick={askQuestion}
							disabled={isLoading || !question.trim()}
							className={`bg-blue-600 text-white px-8 rounded-full font-bold transition-opacity hover:bg-blue-500 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
						>
							Ask
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
