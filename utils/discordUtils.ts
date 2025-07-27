import { load } from "jsr:@std/dotenv";

await load({ export: true });

export async function sendDiscordNotification(quote: string) {
	const embed = {
		title: "❓❔ Question of the Day ❓❔",
		color: 0xFEF250, // lemon yellow
        description: quote,
		//timestamp: new Date().toISOString(),
	};

	await fetch(Deno.env.get("DISCORD_WEBHOOK_URL")!, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			embeds: [embed],
		}),
	});
}
