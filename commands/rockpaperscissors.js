const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require('discord.js');

const activeGames = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rockpaperscissors')
    .setDescription('Challenge someone to a Rock Paper Scissors game!')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The person you want to challenge')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('rounds')
        .setDescription('Number of rounds (max 5)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const challenger = interaction.user;
    const opponent = interaction.options.getUser('user');
    const rounds = interaction.options.getInteger('rounds');

    if (challenger.id === opponent.id) {
      return interaction.editReply({ content: 'You cannot challenge yourself!', ephemeral: true });
    }

    const challengeId = `${challenger.id}_${opponent.id}`;
    if (activeGames.has(challengeId)) {
      return interaction.editReply({ content: 'A game is already active between you two.', ephemeral: true });
    }

    // Accept and Decline buttons
    const acceptButton = new ButtonBuilder()
      .setCustomId(`rps_accept_${challengeId}`)
      .setLabel('Accept')
      .setStyle(ButtonStyle.Success);

    const declineButton = new ButtonBuilder()
      .setCustomId(`rps_decline_${challengeId}`)
      .setLabel('Decline')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(acceptButton, declineButton);

    const embed = new EmbedBuilder()
      .setTitle('Rock Paper Scissors Challenge!')
      .setDescription(`${opponent}, you have been challenged by ${challenger} for ${rounds} round(s)!`)
      .setColor(0xFF4500);

    await interaction.editReply({ embeds: [embed], components: [row] });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000,
    });

    collector.on('collect', async i => {
      if (i.user.id !== opponent.id) {
        return i.reply({ content: 'Only the challenged user can accept or decline!', flags: 64 });
      }

      if (i.customId === `rps_accept_${challengeId}`) {
        collector.stop();
        activeGames.set(challengeId, {
          round: 0,
          maxRounds: rounds,
          scores: { [challenger.id]: 0, [opponent.id]: 0 }
        });

        await i.update({
          content: `${opponent.tag} accepted the challenge! Check your DMs to play.`,
          embeds: [],
          components: [],
        });

        await startGame(challenger, opponent, rounds, challengeId, interaction.client, interaction.channel, message);
      } else if (i.customId === `rps_decline_${challengeId}`) {
        collector.stop();
        await i.update({
          content: `${opponent.tag} declined the challenge.`,
          embeds: [],
          components: [],
        });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({
          content: 'Challenge expired. No response received.',
          embeds: [],
          components: [],
        });
      }
    });
  },
};

async function startGame(challenger, opponent, rounds, challengeId, client, channel, challengeMessage) {
  const moveButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('rock').setLabel('🪨 Rock').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('paper').setLabel('📄 Paper').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('scissors').setLabel('✂️ Scissors').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('forfeit').setLabel('Forfeit').setStyle(ButtonStyle.Danger)
  );

  let earlyForfeit = false;
  let matchEndedEarly = false;

  for (let round = 1; round <= rounds; round++) {
    const choices = {};
    const players = [challenger, opponent];

    for (const player of players) {
      try {
        const dm = await player.send({
          content: `**Round ${round}**: Choose your move! Or press Forfeit to end the match.`,
          components: [moveButtons],
        });

        const collector = dm.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 30_000,
          max: 1,
        });

        const choice = await new Promise((resolve) => {
          collector.on('collect', async i => {
            if (i.customId === 'forfeit') {
              await i.update({ content: 'You forfeited the match.', components: [] });
              resolve('forfeit');
            } else {
              await i.update({ content: `You chose **${i.customId}**.`, components: [] });
              resolve(i.customId);
            }
          });

          collector.on('end', collected => {
            if (!collected.size) resolve(null);
          });
        });

        if (choice === 'forfeit') {
          earlyForfeit = player.id;
          matchEndedEarly = true;
          break;
        } else if (!choice) {
          await player.send('You did not choose in time. You forfeit this round.');
          choices[player.id] = 'none';
        } else {
          choices[player.id] = choice;
        }
      } catch {
        choices[player.id] = 'none';
      }
    }

    // If someone forfeited the match, end early
    if (earlyForfeit) {
      const forfeiter = earlyForfeit === challenger.id ? challenger : opponent;
      const winner = earlyForfeit === challenger.id ? opponent : challenger;
      const summary = `**${forfeiter.tag} forfeited the match! ${winner.tag} wins by default.**`;

      // Announce result in DMs and edit the original message in channel
      await challenger.send(summary);
      await opponent.send(summary);

      if (challengeMessage && challengeMessage.editable) {
        await challengeMessage.edit({
          content: summary,
          embeds: [],
          components: [],
        });
      } else {
        await channel.send(summary);
      }

      activeGames.delete(challengeId);
      return;
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

    // DM both players
    await challenger.send(summary);
    await opponent.send(summary);

    // Announce publicly in the original channel
    await channel.send(summary);
  }

  // If match ended early due to forfeit, don't show final scores again
  if (matchEndedEarly) return;

  const finalScores = activeGames.get(challengeId).scores;
  const finalResult =
    finalScores[challenger.id] > finalScores[opponent.id]
      ? `${challenger.tag} wins the match!`
      : finalScores[opponent.id] > finalScores[challenger.id]
      ? `${opponent.tag} wins the match!`
      : 'The match is a draw!';

  const finalSummary = `**Final Score**: ${challenger.tag} ${finalScores[challenger.id]} - ${finalScores[opponent.id]} ${opponent.tag}\n${finalResult}`;

  await challenger.send(finalSummary);
  await opponent.send(finalSummary);

  // Edit the original challenge message in the channel with the final result
  if (challengeMessage && challengeMessage.editable) {
    await challengeMessage.edit({
      content: finalSummary,
      embeds: [],
      components: [],
    });
  } else {
    await channel.send(finalSummary);
  }

  activeGames.delete(challengeId);
}

function getRoundResult(move1, move2) {
  if (move1 === move2 || move1 === 'none' || move2 === 'none') return 'draw';

  const winMap = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper',
  };

  return winMap[move1] === move2 ? 'challenger' : 'opponent';
}
