import { load } from "jsr:@std/dotenv";

await load({ export: true });

export async function sendDiscordNotification(quote: string) {
	const embed1 = {
		color: 0xFEF250, // lemon yellow
		image: { url: Deno.env.get("IMAGE_URL") },
	};

	const embed2 = {
		title: `· · ─ ·𝒒𝒖𝒆𝒔𝒕𝒊𝒐𝒏 𝒐𝒇 𝒕𝒉𝒆 𝒅𝒂𝒚 · ─ · ·`,
		color: 0xFEF250, // lemon yellow
		description: quote,
		thumbnail: { url: Deno.env.get("THUMBNAIL_URL") },
		footer: { text: `𐔌՞. .՞𐦯` },
	};

	const response = await fetch(Deno.env.get("DISCORD_WEBHOOK_URL")!, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			embeds: [embed1, embed2],
		}),
	});

	if (!response.ok) {
		throw new Error(`Discord webhook failed: ${response.status}`);
	}
}
