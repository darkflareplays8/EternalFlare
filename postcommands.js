const BOT_ID = process.env.BOT_ID;
const API_TOKEN = process.env.API_TOKEN;

const commandsPayload = [
  { name: "about", description: "Get information about the bot and its creator" },
  { name: "ban", description: "Ban a user from the server" },
  { name: "coinflip", description: "Flip a coin and get heads or tails" },
  { name: "dice", description: "Roll a dice with an optional range (default 1-6)" },
  { name: "donate", description: "Get information about supporting the bot" },
  { name: "embed", description: "Send a custom embed message" },
  { name: "help", description: "List all available commands" },
  { name: "invite", description: "Get link to invite the EternalFlare bot to your server" },
  { name: "kick", description: "Kick a user from the server" },
  { name: "ping", description: "Check the bot's latency" },
  { name: "rban", description: "Ban all members with a specified role" },
  { name: "rkick", description: "Kick all members with a specified role" },
  { name: "source", description: "Get the source code of the bot" },
  { name: "yugi", description: "Ask the magic 8-ball a question" },
  { name: "8ball", description: "Show my opinion of yugi. (not yu-gioh)" },
  { name: "number", description: "Generate a random number between two values" },
  { name: "server", description: "Get a link to join the official discord server" },
  {name: "timeout", description: "Timeout a user for a specified duration" },
  { name: "untimeout", description: "Remove timeout from a user"}

];

async function postCommands() {
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
      console.error(`Failed to post commands: ${res.status} ${res.statusText}`);
      const errorText = await res.text();
      console.error(errorText);
      return;
    }

    const data = await res.json();
    console.log('Successfully posted commands:', data);
  } catch (error) {
    console.error('Error posting commands:', error);
  }
}

postCommands();
process.stdin.resume();  // Keeps the script running so you can read output
