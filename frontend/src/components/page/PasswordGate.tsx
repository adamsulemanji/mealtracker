"use client";
import { useState, useEffect } from "react";

const SESSION_KEY = "mt_auth";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
	const [authed, setAuthed] = useState<boolean | null>(null);
	const [input, setInput] = useState("");
	const [error, setError] = useState(false);

	useEffect(() => {
		setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
	}, []);

	if (authed === null) return null; // avoid flash before sessionStorage check

	if (authed) return <>{children}</>;

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const password = process.env.NEXT_PUBLIC_SITE_PASSWORD;
		if (input === password) {
			sessionStorage.setItem(SESSION_KEY, "1");
			setAuthed(true);
		} else {
			setError(true);
			setInput("");
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-4 w-full max-w-xs px-4"
			>
				<h1 className="text-lg font-semibold text-center text-foreground">
					Hey
				</h1>
				<input
					type="password"
					value={input}
					onChange={(e) => { setInput(e.target.value); setError(false); }}
					placeholder="Password"
					autoFocus
					className="border border-border rounded-md px-3 py-2 bg-background text-foreground text-sm outline-none focus:ring-1 focus:ring-ring"
				/>
				{error && (
					<p className="text-xs text-destructive text-center">Incorrect password</p>
				)}
				<button
					type="submit"
					className="rounded-md bg-primary text-primary-foreground text-sm py-2 font-medium hover:opacity-90 transition-opacity"
				>
					Enter
				</button>
			</form>
		</div>
	);
}
