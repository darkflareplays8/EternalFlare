/**
 * Simple ping command
 */

module.exports = {
  name: 'ping',
  description: 'Ping-pong command to check bot latency',
  execute(message, args) {
    const startTime = Date.now();
    message.reply('Pinging...').then(sent => {
      const endTime = Date.now();
      const latency = endTime - startTime;
      sent.edit(`Pong! 🏓 Latency: ${latency}ms | API Latency: ${Math.round(message.client.ws.ping)}ms`);
    });
  }
};