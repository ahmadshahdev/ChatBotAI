import { useState, useRef, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";

function App() {
	const [input, setInput] = useState("");

	// 1. NEW STATE: An array to hold all our past Question/Answer pairs
	// 1. UPDATED STATE: Load from localStorage on initial render
	const [chatHistory, setChatHistory] = useState(() => {
		const savedChat = localStorage.getItem("chatBoatHistory");
		// If there's data in local storage, parse it back into an array
		if (savedChat) {
			return JSON.parse(savedChat);
		}
		// Otherwise, start fresh
		return [];
	});

	const [isLoading, setIsLoading] = useState(false);

	// 2. NEW STATE: Holds the question currently being processed
	const [currentQuestion, setCurrentQuestion] = useState("");

	// 3. NEW STATE: Tracks if the mobile sidebar is open
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	// 4. NEW REF: Used to automatically scroll the chat window to the bottom

	const messagesEndRef = useRef(null);

	// Automatically save to localStorage whenever chatHistory changes
	useEffect(() => {
		localStorage.setItem("chatBoatHistory", JSON.stringify(chatHistory));
	}, [chatHistory]);

	// Auto-scrolls to the newest message whenever the history updates
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chatHistory, currentQuestion, isLoading]);

	const askQuestion = async () => {
		if (!input.trim()) return;

		// Save the input locally and clear the box immediately for better UX
		const questionText = input;
		setInput("");
		setCurrentQuestion(questionText);
		setIsLoading(true);

		try {
			const apiKey = import.meta.env.VITE_CHATBOAT_API_KEY;
			const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

			const response = await fetch(URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contents: [{ parts: [{ text: questionText }] }],
				}),
			});

			if (!response.ok) throw new Error("API Error");

			const data = await response.json();

			if (data.candidates && data.candidates.length > 0) {
				const rawMarkdown = data.candidates[0].content.parts[0].text;

				// 4. ADD TO HISTORY: Append the new Q&A pair to our array with a unique ID
				setChatHistory((prev) => [
					...prev,
					{
						id: Date.now(),
						question: questionText,
						answer: rawMarkdown,
					},
				]);
			}
		} catch (error) {
			console.error(error);
			setChatHistory((prev) => [
				...prev,
				{
					id: Date.now(),
					question: questionText,
					answer: "Error communicating with the AI. Please try again.",
				},
			]);
		} finally {
			setCurrentQuestion(""); // Clear the temporary question
			setIsLoading(false);
		}
	};

	// 5. DELETE FUNCTION: Filters out the specific chat pair we want to remove
	const deleteChat = (idToDelete) => {
		setChatHistory((prev) => prev.filter((chat) => chat.id !== idToDelete));
	};

	return (
		<div className="flex h-screen text-white bg-zinc-950 overflow-hidden">
			{/* NEW: Dark Overlay for mobile (clicks outside close the sidebar) */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black/60 z-40 md:hidden"
					onClick={() => setIsSidebarOpen(false)}
				></div>
			)}

			{/* --- SIDEBAR (History) --- */}
			{/* UPDATED: Slides in on mobile, fixed on desktop */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}
			>
				<div className="flex justify-between items-center mb-6 mt-2">
					<h1 className="font-bold text-2xl text-blue-500 mx-auto md:mx-0">
						ChatBoatAI
					</h1>
					{/* NEW: Close button for mobile */}
					<button
						className="md:hidden text-zinc-400 hover:text-white text-2xl"
						onClick={() => setIsSidebarOpen(false)}
					>
						×
					</button>
				</div>

				<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">
					Chat History
				</h2>

				<div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
					{chatHistory.length === 0 ? (
						<p className="text-zinc-600 text-sm italic px-2">
							No history yet.
						</p>
					) : (
						chatHistory.map((chat) => (
							<div
								key={chat.id}
								className="group flex justify-between items-center bg-zinc-800 hover:bg-zinc-700 p-3 rounded-lg transition-colors cursor-pointer"
							>
								<span className="text-sm text-zinc-300 truncate pr-2">
									{chat.question}
								</span>
								<button
									onClick={(e) => {
										e.stopPropagation(); // Prevents click from bubbling up
										deleteChat(chat.id);
									}}
									className="text-zinc-500 hover:text-red-400 md:opacity-0 group-hover:opacity-100 transition-opacity"
									title="Delete conversation"
								>
									✕
								</button>
							</div>
						))
					)}
				</div>

				{/* Sidebar Watermark */}
				<div className="mt-auto pt-4 border-t border-zinc-800 text-center">
					<p className="text-xs text-zinc-500 font-medium tracking-wide">
						Developed by Syed Ahmad Shah
					</p>
				</div>
			</div>

			{/* --- MAIN CHAT AREA --- */}
			<div className="flex-1 flex flex-col relative w-full">
				{/* UPDATED: Mobile Header with Hamburger Menu */}
				<div className="md:hidden bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
					<button
						onClick={() => setIsSidebarOpen(true)}
						className="text-zinc-400 hover:text-white text-2xl focus:outline-none"
					>
						☰
					</button>
					<h1 className="font-bold text-xl text-blue-500">
						ChatBoatAI
					</h1>
					<div className="w-8"></div>{" "}
					{/* Invisible spacer to keep title perfectly centered */}
				</div>

				{/* Chat Window */}
				<div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
					{chatHistory.length === 0 && !currentQuestion && (
						<div className="flex h-full items-center justify-center text-zinc-500 text-xl font-medium text-center px-4">
							How can I help you today?
						</div>
					)}

					{chatHistory.map((chat) => (
						<div key={chat.id} className="space-y-6">
							<div className="flex justify-end">
								<div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[70%] shadow-md">
									{chat.question}
								</div>
							</div>

							<div className="flex justify-start">
								<div className="bg-zinc-800 p-5 md:p-6 rounded-2xl rounded-tl-sm shadow-lg border border-zinc-700 max-w-[95%] md:max-w-[85%] overflow-hidden">
									<div className="leading-relaxed text-zinc-200 break-words">
										<ReactMarkdown
											components={{
												p: ({ node, ...props }) => (
													<p
														className="mb-4 last:mb-0"
														{...props}
													/>
												),
												h2: ({ node, ...props }) => (
													<h2
														className="text-xl font-bold mt-6 mb-3 text-blue-400"
														{...props}
													/>
												),
												h3: ({ node, ...props }) => (
													<h3
														className="text-lg font-bold mt-4 mb-2 text-blue-300"
														{...props}
													/>
												),
												ul: ({ node, ...props }) => (
													<ul
														className="list-disc list-inside mb-4 space-y-2 ml-2"
														{...props}
													/>
												),
												ol: ({ node, ...props }) => (
													<ol
														className="list-decimal list-inside mb-4 space-y-2 ml-2"
														{...props}
													/>
												),
												li: ({ node, ...props }) => (
													<li
														className="text-zinc-300"
														{...props}
													/>
												),
												strong: ({
													node,
													...props
												}) => (
													<strong
														className="font-semibold text-white"
														{...props}
													/>
												),
												code: ({ node, ...props }) => (
													<code
														className="bg-zinc-900 px-1.5 py-0.5 rounded text-blue-300 text-sm break-words whitespace-pre-wrap"
														{...props}
													/>
												),
											}}
										>
											{chat.answer}
										</ReactMarkdown>
									</div>
								</div>
							</div>
						</div>
					))}

					{isLoading && (
						<div className="space-y-6">
							<div className="flex justify-end">
								<div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[70%] shadow-md">
									{currentQuestion}
								</div>
							</div>
							<div className="flex justify-start">
								<div className="bg-zinc-800 p-4 rounded-2xl rounded-tl-sm border border-zinc-700 text-zinc-400 animate-pulse">
									ChatBoatAI is typing...
								</div>
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<div className="p-3 md:p-4 bg-zinc-950 border-t border-zinc-900">
					<div className="bg-zinc-800 max-w-4xl w-full text-white mx-auto p-1.5 md:p-2 rounded-full border border-zinc-700 flex items-center h-12 md:h-14 shadow-lg focus-within:border-blue-500 transition-colors">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) =>
								e.key === "Enter" && askQuestion()
							}
							className="outline-none bg-transparent flex-1 px-4 md:px-6 text-base md:text-lg w-full"
							placeholder="Message ChatBoatAI..."
							disabled={isLoading}
						/>
						<button
							onClick={askQuestion}
							disabled={isLoading || !input.trim()}
							className={`bg-blue-600 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full font-bold transition-all hover:bg-blue-500 text-sm md:text-base ${isLoading || !input.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
						>
							Send
						</button>
					</div>

					{/* Input Area Watermark */}
					<div className="max-w-4xl mx-auto mt-2 text-center">
						<p className="text-[10px] text-zinc-600">
							ChatBoatAI © 2026 | Syed Ahmad Shah
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
