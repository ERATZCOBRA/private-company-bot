require('dotenv').config();
const {
  EmbedBuilder,
  Events,
} = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const timestamp = Math.floor(Date.now() / 1000);
    const user = interaction.user;
    const commandName = interaction.commandName;
    const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL_ID);

    let success = true;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      success = false;
      console.error(error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ There was an error while executing this command.',
          ephemeral: true,
        });
      }
    }

    if (!logChannel) {
      console.warn('⚠️ Logging channel not found. Check LOG_CHANNEL_ID in your .env file.');
      return;
    }

    const statusIcon = success ? '✅' : '❌';
    const statusColor = success ? 0x2ecc71 : 0xe74c3c; // green / red
    const statusText = success ? 'Success' : 'Failed';

    const logEmbed = new EmbedBuilder()
      .setAuthor({ name: 'Command Log', iconURL: user.displayAvatarURL() })
      .setColor(statusColor)
      .setDescription([
        `**Command:** \`/${commandName}\``,
        `**User:** ${user} (\`${user.tag}\`)`,
        `**Status:** ${statusIcon} ${statusText}`,
        `**Time:** <t:${timestamp}:F>`,
      ].join('\n'))
      .setFooter({ text: `User ID: ${user.id}` })
      .setTimestamp();

    await logChannel.send({ embeds: [logEmbed] });
  },
};
