const fetch = require('node-fetch');

const BOT_ID = process.env.BOT_ID;
const API_TOKEN = process.env.API_TOKEN;

const commandsPayload = [
  // 🛡️ Moderation
{ name: "ban", description: "Ban a user from the server" },
{ name: "kick", description: "Kick a user from the server" },
{ name: "timeout", description: "Timeout a user for a specified duration" },
{ name: "untimeout", description: "Remove timeout from a user" },
{ name: "rban", description: "Ban all members with a specified role" },
{ name: "rkick", description: "Kick all members with a specified role" },

// 🎮 Fun & Games
{ name: "coinflip", description: "Flip a coin and get heads or tails" },
{ name: "dice", description: "Roll a dice with an optional range (default 1-6)" },
{ name: "number", description: "Generate a random number between two values" },
{ name: "yugi", description: "Ask the magic 8-ball a question" },
{ name: "8ball", description: "Show my opinion of yugi. (not yu-gioh)" },
{ name: "rockpaperscissors", description: "Challenge someone to a rockpaperscissors game!" },

// 📚 Info & Utility
{ name: "about", description: "Get information about the bot and its creator" },
{ name: "help", description: "List all available commands" },
{ name: "ping", description: "Check the bot's latency" },
{ name: "invite", description: "Get link to invite the EternalFlare bot to your server" },
{ name: "server", description: "Get a link to join the official discord server" },
{ name: "source", description: "Get the source code of the bot" },

// 🧰 Extras
{ name: "donate", description: "Get information about supporting the bot" },
{ name: "embed", description: "Send a custom embed message" }
];

module.exports = async function postCommands() {
  if (!BOT_ID || !API_TOKEN) {
    console.error("[ERROR] BOT_ID or API_TOKEN not set in environment variables.");
    return;
  }

  console.log("[INFO] Posting commands to Discord Bot List...");

  try {
    const res = await fetch(`https://discordbotlist.com/api/v1/bots/${BOT_ID}/commands`, {
      method: 'POST',
      headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commandsPayload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[ERROR] Failed to post commands: ${res.status} ${res.statusText}`);
      console.error(`[DETAILS] ${errorText}`);
      return;
    }

    const data = await res.json();
    console.log("[SUCCESS] Commands posted successfully:", data);
  } catch (error) {
    console.error("[ERROR] Exception while posting commands:", error);
  }
};
