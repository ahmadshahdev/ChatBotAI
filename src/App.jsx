import { useState } from "react";
import "./App.css";
import Answer from "./components/answer";

function App() {
	const [question, setQuestion] = useState("");
	const [result, setResult] = useState([]);

	const askQuestion = async () => {
		if (!question.trim()) return; // Don't send empty requests

		try {
			const apiKey = import.meta.env.VITE_CHATBOAT_API_KEY;
			// Reverted to YOUR working URL:
			const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

			const response = await fetch(URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contents: [
						{
							parts: [
								{
									text: question,
								},
							],
						},
					],
				}),
			});

			const data = await response.json();

			let datastring = data.candidates[0].content.parts[0].text;
			datastring = datastring.split("# ");
			datastring = datastring.map((item) => item.trim());

			// Extract the text safely
			if (data.candidates && data.candidates.length > 0) {
				setResult(datastring);
				console.log(datastring);
				//setQuestion(""); // Clears the input box automatically
			}
		} catch (error) {
			console.error(error);
			setResult("Error communicating with the AI.");
		}
	};

	return (
		<div className="grid grid-cols-5 h-screen text-center text-white">
			<div className="col-span-1 bg-zinc-800">history</div>

			<div className="col-span-4 flex flex-col">
				{/* Scrollbar is hidden here, but scrolling still works */}
				<div className=" container flex-1 overflow-y-auto hide-scrollbar p-8 text-left">
					<div className="text-white">
						<ul>
							{/* {result} */}

							{result &&
								result.map((item, index) => (
									<li className="text-left p-1.5">
										<Answer ans={item} key={index} />
									</li>
								))}
						</ul>
					</div>
				</div>

				<div className="p-4">
					<div className="bg-zinc-800 w-1/2 text-white text-center mx-auto p-4 rounded-3xl border-2 border-zinc-700 flex h-16">
						<input
							name="text"
							type="text"
							value={question}
							onChange={(event) =>
								setQuestion(event.target.value)
							}
							className="outline-none bg-transparent flex-1 px-4"
							placeholder="Ask me Anything"
						/>
						<button onClick={askQuestion} className=" font-bold">
							Ask
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
