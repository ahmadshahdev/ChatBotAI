# ChatBoatAI 🤖

ChatBoatAI is a responsive, intelligent web-based chatbot built using React.js and Tailwind CSS. It integrates the Google Gemini AI (`gemini-2.5-flash` model) to provide real-time, context-aware answers. 

Developed by **Syed Ahmad Shah**.

## ✨ Features
* **Persistent Memory:** Uses browser `localStorage` to save your chat history even after you refresh the page.
* **Markdown Rendering:** Automatically formats the AI's responses (bolding, headings, code blocks, and bullet points) for perfect readability.
* **Mobile Responsive:** Features a sleek, sliding hamburger menu for mobile devices while maintaining a fixed sidebar on desktop.
* **Premium UI/UX:** Built with a dark-mode aesthetic, custom scrollbars, auto-scrolling chat windows, and distinct message bubbles.

## 🛠️ Tech Stack
* **Frontend:** React.js (Vite)
* **Styling:** Tailwind CSS
* **API:** Google Gemini API (2.5 Flash)
* **Packages:** `react-markdown`

## 🧠 How It Works (Core Architecture)

### State Management
* `input`: Holds the text currently being typed by the user.
* `chatHistory`: An array of objects storing all past Question/Answer pairs. Initializes from `localStorage`.
* `isLoading`: A boolean that disables the send button and triggers the typing animation while waiting for the API.
* `isSidebarOpen`: Controls the sliding mobile menu visibility.

### Core Functions
* `askQuestion()`: The main engine. It prevents empty submissions, triggers the loading state, sends a secure POST request to the Gemini API, extracts the markdown response, and updates the chat history.
* `deleteChat(id)`: Uses the `.filter()` method to remove specific conversations from the history array.

### React Hooks
* **Local Storage Sync:** A `useEffect` hook watches the `chatHistory` array. Whenever a message is added or deleted, it automatically uses `JSON.stringify` to update the browser's hard drive.
* **Auto-Scrolling:** A `useEffect` hook tied to a `useRef` at the bottom of the chat window ensures the screen smoothly scrolls down whenever a new message appears.

## 🚀 How to Run Locally

1. Clone this repository to your local machine.
2. Open the folder in your terminal and run `npm install` to download the dependencies.
3. Create a `.env` file in the root directory and add your Gemini API key:
   `VITE_CHATBOAT_API_KEY=your_api_key_here`
4. Run `npm run dev` to start the local server.