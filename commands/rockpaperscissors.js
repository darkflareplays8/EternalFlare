async function startGame(challenger, opponent, rounds, challengeId, client, channel) {
  const moves = ['rock', 'paper', 'scissors'];
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('rock').setLabel('🪨 Rock').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('paper').setLabel('📄 Paper').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('scissors').setLabel('✂️ Scissors').setStyle(ButtonStyle.Primary),
  );

  for (let round = 1; round <= rounds; round++) {
    const choices = {};
    const players = [challenger, opponent];

    for (const player of players) {
      try {
        const dm = await player.send({
          content: `**Round ${round}**: Choose your move!`,
          components: [buttons],
        });

        const collector = dm.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 30_000,
          max: 1,
        });

        const choice = await new Promise((resolve) => {
          collector.on('collect', async i => {
            await i.update({ content: `You chose **${i.customId}**.`, components: [] });
            resolve(i.customId);
          });

          collector.on('end', collected => {
            if (!collected.size) resolve(null);
          });
        });

        if (!choice) {
          await player.send('You did not choose in time. You forfeit this round.');
          choices[player.id] = 'none';
        } else {
          choices[player.id] = choice;
        }
      } catch {
        choices[player.id] = 'none';
      }
    }

    const result = getRoundResult(choices[challenger.id], choices[opponent.id]);

    let summary = `**Round ${round} Results:**\n${challenger.tag} chose **${choices[challenger.id]}**, ${opponent.tag} chose **${choices[opponent.id]}**\n`;

    if (result === 'draw') {
      summary += 'Result: **Draw**!';
    } else {
      const winner = result === 'challenger' ? challenger : opponent;
      activeGames.get(challengeId).scores[winner.id]++;
      summary += `Winner: **${winner.tag}**`;
    }

    // Send summary DM to both players
    await challenger.send(summary);
    await opponent.send(summary);

    // Announce round result publicly in the original channel
    await channel.send(summary);
  }

  const finalScores = activeGames.get(challengeId).scores;
  const finalResult =
    finalScores[challenger.id] > finalScores[opponent.id]
      ? `${challenger.tag} wins the match!`
      : finalScores[opponent.id] > finalScores[challenger.id]
      ? `${opponent.tag} wins the match!`
      : 'The match is a draw!';

  // Send final score DMs to both players
  await challenger.send(`**Final Score**: ${challenger.tag} ${finalScores[challenger.id]} - ${finalScores[opponent.id]} ${opponent.tag}\n${finalResult}`);
  await opponent.send(`**Final Score**: ${challenger.tag} ${finalScores[challenger.id]} - ${finalScores[opponent.id]} ${opponent.tag}\n${finalResult}`);

  // Announce final score publicly in the original channel
  await channel.send(`**Final Score**: ${challenger.tag} ${finalScores[challenger.id]} - ${finalScores[opponent.id]} ${opponent.tag}\n${finalResult}`);

  activeGames.delete(challengeId);
}
