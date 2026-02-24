const { db } = require('../db');

class DatabaseService {
    async createSessionIfNotExists(sessionId) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT OR IGNORE INTO sessions (id) VALUES (?)`,
                [sessionId],
                function (err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    async updateSessionTimestamp(sessionId) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [sessionId],
                function (err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    async updateSessionTitle(sessionId, title) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE sessions SET title = ? WHERE id = ?`,
                [title, sessionId],
                function (err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    async getSession(sessionId) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM sessions WHERE id = ?`,
                [sessionId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    async saveMessage(sessionId, role, content) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)`,
                [sessionId, role, content],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    async getLastMessages(sessionId, limit = 10) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?`,
                [sessionId, limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows.reverse());
                }
            );
        });
    }

    async getAllMessages(sessionId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC`,
                [sessionId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    async getAllSessions() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT id as sessionId, title, updated_at FROM sessions ORDER BY updated_at DESC`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
    async getGlobalHistory(limit = 20) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT role, content, sessions.title as sessionTitle 
                 FROM messages 
                 JOIN sessions ON messages.session_id = sessions.id 
                 ORDER BY messages.created_at DESC LIMIT ?`,
                [limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows.reverse());
                }
            );
        });
    }
}

module.exports = new DatabaseService();
