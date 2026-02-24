# 🌊 Flash Man AI - Step-by-Step Interaction Flow

This guide provides a "deep dive" into exactly what happens under the hood when you interact with the Flash Man chat interface.

---

### **1. The Trigger: User Action**
*   **Action**: User types *"Hey, what did we talk about in my other chat earlier?"* in the input box and clicks **Send**.
*   **Frontend Logic (`useChat.js`)**: 
    *   Captures the text.
    *   **Optimistic UI**: Immediately pushes the message into the `messages` array so the user sees their own text instantly.
    *   **Loading State**: Sets `loading = true`, which triggers the "Flash Man is thinking..." bouncing dots animation.

---

### **2. The Transmission: HTTP/API**
*   **Request**: An `axios` POST request is sent to `http://localhost:5000/api/chat`.
*   **Payload**:
    ```json
    {
      "sessionId": "abc-123-uuid",
      "message": "Hey, what did we talk about in my other chat earlier?",
      "mode": "general"
    }
    ```

---

### **3. The Gatekeeper: Middleware**
*   **Rate Limiting**: `rateLimiter.js` checks the requester's IP. If they've sent more than 30 messages in the last minute, the request is rejected with a `429 Too Many Requests` status to protect the SambaNova API credits.

---

### **4. The Orchestrator: Backend Controller (`chatController.js`)**
This is where the complex integration happens:
1.  **DB Check**: `dbService` ensures a session entry exists for `abc-123-uuid`.
2.  **Immediate Persistence**: The user's query is saved to the `messages` table in SQLite.
3.  **Local Memory Fetch**: The controller asks the DB for the last **10 messages** belonging *only* to this specific session.
4.  **Global Memory Fetch**: The controller asks the DB for the last **20 messages** belonging to *any* session ID, including their titles. This allows the AI to "remember" beyond the current window.

---

### **5. The Brain: LLM Service (`llmService.js`)**
The service constructs a massive "Context Package" for the AI:
*   **Documentation**: It reads the raw contents of `docs.json`.
*   **The Prompt**: It chooses between two sets of instructions:
    *   *Docs Mode*: "You are a restricted librarian."
    *   *General Mode*: "You are Flash Man. Use your memory."
*   **External Call**: It sends the context, history, and current question to **SambaNova Llama 3.1 8B**.

---

### **6. The Title Generator (Optional Step)**
*   If this was the **first message** of a session, a secondary, lightweight call is made to the LLM. It's asked: *"Summarize this user message into a 3-word title."*
*   The title is then updated in the `sessions` table (e.g., "Previous Conversation Query") and appears in the sidebar instantly via a metadata refresh.

---

### **7. The Response: Storage & Sync**
1.  **AI Result**: The LLM returns a string: *"Oh, in your 'Reset Instructions' chat, you were asking about password security!"*
2.  **Final Persistence**: This response is saved to the `messages` table.
3.  **Timestamp Bump**: The session's `updated_at` column is updated to the current time, moving this chat to the top of the sidebar list.

---

### **8. The Resolution: Frontend Update**
*   The `axios` promise resolves.
*   `useChat.js` receives the JSON response.
*   The typing indicator disappears.
*   The message list scrolls automatically to the bottom.
*   **State Sync**: The user now sees the AI response with a timestamp.

---

### **🔍 Summary of System Interactions**
*   **Frontend ⇄ Backend**: REST API (JSON).
*   **Backend ⇄ AI**: SambaNova OpenAI-Compatible Client.
*   **Backend ⇄ DB**: Asynchronous SQL queries (sqlite3).
*   **Backend ⇄ Disk**: Node.js `fs` module (for `docs.json`).
