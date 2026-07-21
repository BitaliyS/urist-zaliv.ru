import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { env } from '$env/dynamic/private';
import type { LeadPayload } from './lead-mail';

let db: Database.Database | null = null;

function dbPath(): string {
	return env.LEAD_DB_PATH || './data/leads.sqlite';
}

function getDb(): Database.Database {
	if (db) return db;

	const path = dbPath();
	mkdirSync(dirname(path), { recursive: true });

	db = new Database(path);
	db.pragma('journal_mode = WAL');
	db.exec(`
		CREATE TABLE IF NOT EXISTS leads (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			name TEXT NOT NULL,
			phone TEXT NOT NULL,
			message TEXT NOT NULL,
			ip TEXT,
			email_sent INTEGER NOT NULL DEFAULT 0,
			ntfy_sent INTEGER NOT NULL DEFAULT 0
		)
	`);

	return db;
}

export function saveLead(payload: LeadPayload): number {
	const result = getDb()
		.prepare(
			`INSERT INTO leads (name, phone, message, ip)
			 VALUES (@name, @phone, @message, @ip)`
		)
		.run(payload);

	return Number(result.lastInsertRowid);
}

export function markLeadNotified(id: number, channel: 'email' | 'ntfy'): void {
	const column = channel === 'email' ? 'email_sent' : 'ntfy_sent';
	getDb().prepare(`UPDATE leads SET ${column} = 1 WHERE id = ?`).run(id);
}
