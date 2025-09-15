require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-flow-status")
    .setDescription("Update the ticket flow status")
    .addStringOption(option =>
      option.setName("type")
        .setDescription("Select the ticket flow status")
        .setRequired(true)
        .addChoices(
          { name: "Green", value: "green" },
          { name: "Yellow", value: "yellow" },
          { name: "Red", value: "red" }
        )
    ),
  
  async execute(interaction) {
    const allowedRoleId = process.env.TICKET_STATUS_ACCESS_ROLE_ID; // role that can use command
    const channelId = process.env.TICKET_STATUS_CHANNEL_ID; // target channel

    // Check role access
    if (!interaction.member.roles.cache.has(allowedRoleId)) {
      return interaction.reply({ content: "❌ You do not have permission to use this command.", ephemeral: true });
    }

    const type = interaction.options.getString("type");
    const targetChannel = interaction.guild.channels.cache.get(channelId);

    if (!targetChannel) {
      return interaction.reply({ content: "❌ The configured channel ID is invalid.", ephemeral: true });
    }

    // Customize embed depending on type
    let color, emoji, sentences;
    if (type === "green") {
      color = 0x00ff00;
      emoji = "🟩";
      sentences = "Tickets are currently being handled smoothly.\nEverything is on track and progressing well.";
    } else if (type === "yellow") {
      color = 0xffff00;
      emoji = "🟨";
      sentences = "Tickets are being handled, but responses may be slightly slow.\nWe appreciate your patience as we manage them.";
    } else {
      color = 0xff0000;
      emoji = "🟥";
      sentences = "Tickets are currently being handled slower than usual.\nWe appreciate your understanding and waiting kindly.";
    }

    const separator = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`**Ticket Status ${emoji}**`)
      .setDescription(
        `${separator}\n${sentences}\n${separator}\n**Updated:** <t:${Math.floor(Date.now() / 1000)}:F>\n${separator}\n**Updated by:** ${interaction.user}\n${separator}`
      );

    await targetChannel.send({ embeds: [embed] });
    await interaction.reply({ content: "✅ Ticket status has been updated.", ephemeral: true });
  },
};
