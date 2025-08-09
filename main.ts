import { sendDiscordNotification } from "./utils/discordUtils.ts";
import { load } from "jsr:@std/dotenv";

await load({ export: true });

const endpoint = Deno.env.get("SHEET_ENDPOINT");
if (!endpoint) {
	throw new Error("SHEET_ENDPOINT environment variable is not set");
}

// @ts-ignore Deno.cron is unstable, run with --unstable-cron flag
Deno.cron("QOTD", Deno.env.get("CRON_STRING"), async () => {
	// Fetch  data
	const response = await fetch(endpoint);
	const { data } = await response.json();

	// Open KV and fetch last index
	// @ts-ignore Deno.openKv is unstable, run with --unstable-kv flag
	const kv = await Deno.openKv(
		// `https://api.deno.com/databases/${
		// 	Deno.env.get("DENO_KV_DATABASE_ID")
		// }/connect`,
	);
	const current = await kv.get<number>(["lastIndex"]);
	const index = current.value ?? 0;
	const nextIndex = (index + 1) % data.length;

	// Perform atomic operation to update index
	const result = await kv.atomic()
		.check(current) // Ensure the value hasn't changed
		.set(["lastIndex"], nextIndex)
		.commit();

	if (!result.ok) {
		console.log("Another instance already updated the index, skipping");
		return;
	}

	// Post to Discord webhook
	await sendDiscordNotification(data[index].question);
	console.log(`Cron: posted question of index ${index} to Discord.`);
});
