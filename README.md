# ⚡ Flash Man AI - Technical Documentation

Flash Man is a production-grade, stateful AI Personal Assistant. It features cross-session "Global Memory," dual intelligence modes (Docs vs. General), and a high-performance SQLite backend.

---

## 🏗️ System Architecture & Data Flow

### **The Lifecycle of a Message**
1.  **Frontend Dispatch**: 
    *   The `useChat.js` hook captures user input and updates the local UI state.
    *   It sends a `POST` request to `/api/chat` with: `sessionId`, `message`, and `mode`.
2.  **Backend Integration (`ChatController`)**:
    *   **Persistence**: Automatically saves the user message to the `messages` table.
    *   **Smart Naming**: If the session is new, `LLMService.generateTitle()` creates a catchy title based on the first message.
    *   **Context Assembly**: 
        *   Retrieves last **10 messages** from the current session.
        *   Retrieves last **20 messages** from the global history (all sessions).
3.  **Intelligence Layer (`LLMService`)**:
    *   Injects `docs.json` content.
    *   Injects "Global Memory" extracted from previous sessions.
    *   Calls **SambaNova Llama 3.1** with a specialized System Prompt based on the selected **Mode**.
4.  **Completion & Sync**:
    *   The assistant's reply is saved to the DB.
    *   The session timestamp is updated.
    *   The reply is returned to the React UI.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat` | Send a message to Flash Man. | `{ sessionId, message, mode: "docs" \| "general" }` |
| `GET` | `/api/conversations/:id` | Fetch all messages for a specific session. | `id` (UUID) |
| `GET` | `/api/sessions` | List all previous chat sessions with titles. | None |

---

## 🗄️ Database Schema (SQLite)

The database is stored in `backend/database.sqlite`.

### **Table: `sessions`**
Used to maintain chat context and titles.
*   `id` (TEXT, PK): Unique UUID.
*   `title` (TEXT): AI-generated chat title.
*   `created_at` (DATETIME): Creation time.
*   `updated_at` (DATETIME): Last activity.

### **Table: `messages`**
Used to store historical chat logs.
*   `id` (INTEGER, PK): Primary key.
*   `session_id` (TEXT, FK): Relates to `sessions`.
*   `role` (TEXT): Either `'user'` or `'assistant'`.
*   `content` (TEXT): The message text.
*   `created_at` (DATETIME): Message timestamp.

---

## 🛠️ Debugging & Monitoring

### **1. How to View Logs**
*   **Development**: Logs are printed directly to the terminal where you ran `npm start` (Backend).
*   **Console**: Frontend errors appear in the Browser Developer Tools (F12) under the **Console** tab.
*   **Network**: To see raw API data, check the **Network** tab in Browser DevTools and filter by `XHR/Fetch`.

### **2. How to Inspect the Database**
Since this uses SQLite, you can use any SQLite browser or the command line:
*   **Command Line**: 
    ```bash
    sqlite3 backend/database.sqlite
    ```
*   **Check Sessions**: `SELECT * FROM sessions;`
*   **Check Messages**: `SELECT * FROM messages WHERE session_id = 'YOUR_SESSION_ID';`

### **3. Changing Documentation**
You can update the bot's static knowledge base by editing `backend/docs.json`. The bot reads this file fresh on every request in "Docs Specialist" mode.

---

## ⚙️ Configuration (.env)

| Variable | Description |
| :--- | :--- |
| `OPENAI_API_KEY` | Your SambaNova API Key. |
| `OPENAI_BASE_URL` | Set to `https://api.sambanova.ai/v1`. |
| `LLM_MODEL` | Set to `Meta-Llama-3.1-8B-Instruct`. |
| `PORT` | Backend port (Default: 5000). |
