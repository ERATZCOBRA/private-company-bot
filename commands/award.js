require('dotenv').config();
const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

// Configurable Unicode line
const LINE_CHAR = '━';
const LINE_LENGTH = 24;
const BLUE_LINE = LINE_CHAR.repeat(LINE_LENGTH);

// Role access and target channel ID from .env
const AWARD_COMMAND_ACCESS_ROLE_IDS = process.env.AWARD_COMMAND_ACCESS_ROLE_IDS?.split(',') || [];
const AWARD_TARGET_CHANNEL_ID = process.env.AWARD_TARGET_CHANNEL_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('award')
    .setDescription('Officially grant an award to a personnel')
    .addUserOption(option =>
      option.setName('personnel')
        .setDescription('Personnel receiving the award')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('award')
        .setDescription('Name of the award being granted')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('approved-by')
        .setDescription('Person who approved the award')
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;

    // Check if user has access
    const hasAccess = AWARD_COMMAND_ACCESS_ROLE_IDS.some(roleId => member.roles.cache.has(roleId));
    if (!hasAccess) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const personnel = interaction.options.getUser('personnel');
    const award = interaction.options.getString('award');
    const approvedBy = interaction.options.getUser('approved-by');

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    const embed = new EmbedBuilder()
      .setTitle('**ㅤㅤㅤPrivate Company Awardsㅤㅤㅤ**')
      .setDescription(
        `${BLUE_LINE}\n\n` +
        `The Private Company is proud to present the **${award}** to ${personnel} in recognition of their outstanding performance and dedication. Their exceptional contributions have significantly supported the company’s mission and values. We commend them for their excellence and commitment.\n\n` +
        `**Approved by:** ${approvedBy}`
      )
      .setColor(0x3498db) // A clean blue color
      .setFooter({
        text: `Signed by ${interaction.user.username} • Time: ${formattedTime}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    try {
      const targetChannel = await interaction.client.channels.fetch(AWARD_TARGET_CHANNEL_ID);

      if (!targetChannel) {
        return interaction.reply({
          content: '❌ Could not find the award announcement channel.',
          ephemeral: true,
        });
      }

      // Mention the personnel above the embed
      await targetChannel.send({
        content: `${personnel}`,
        embeds: [embed],
      });

      await interaction.reply({
        content: '✅ Award announcement successfully posted.',
        ephemeral: true,
      });

    } catch (error) {
      console.error('Error posting award:', error);
      await interaction.reply({
        content: '❌ An unexpected error occurred while posting the award.',
        ephemeral: true,
      });
    }
  },
};
