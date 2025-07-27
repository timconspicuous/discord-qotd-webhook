import { sendDiscordNotification } from "./utils/discordUtils.ts";
import { load } from "jsr:@std/dotenv";

await load({ export: true });

const endpoint = Deno.env.get("SHEET_ENDPOINT");
if (!endpoint) {
	throw new Error("SHEET_ENDPOINT environment variable is not set");
}

const response = await fetch(endpoint);
const { data } = await response.json();

// @ts-ignore Deno.cron is unstable, run with --unstable-cron flag
Deno.cron("QOTD", Deno.env.get("CRON_STRING"), async () => {
	// Open KV and get last index
	// @ts-ignore Deno.openKv is unstable, run with --unstable-kv flag
	const kv = await Deno.openKv(
		// `https://api.deno.com/databases/${
		// 	Deno.env.get("DENO_KV_DATABASE_ID")
		// }/connect`,
	);
	const result = await kv.get<number>(["lastIndex"]);
	let index = result.value ?? 0;

	await sendDiscordNotification(data[index].question);
	console.log(`Cron: posted question of index ${index} to Discord.`);

	// Update last index in KV
	index = (index + 1) % data.length;
	await kv.set(["lastIndex"], index);
});
