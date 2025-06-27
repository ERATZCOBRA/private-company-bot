const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

// Env-based role and channel config
const CHANNEL_ID = process.env.MEDAL_REQUEST_CHANNEL_ID;
const ROLE_ID_1 = process.env.MEDAL_REVIEW_ROLE_ID_1;

// Styling constants
const EMBED_COLOR = '#95a5a6';
const EMBED_TITLE = 'MEDAL REQUEST';
const UNICODE_LINE = '━'.repeat(60); // Full-width line
const CENTERED_TITLE = 'ㅤㅤㅤㅤㅤㅤㅤㅤMEDAL REQUESTㅤㅤㅤㅤㅤㅤㅤㅤ';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('request-medal')
    .setDescription('Request a Company Medal')
    .addStringOption(opt =>
      opt.setName('medal')
        .setDescription('Type the medal you are requesting')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Reason for the medal request')
        .setRequired(true)
    )
    .addAttachmentOption(opt =>
      opt.setName('proof1')
        .setDescription('Optional proof attachment')
        .setRequired(false)
    )
    .addAttachmentOption(opt =>
      opt.setName('proof2')
        .setDescription('Additional proof attachment')
        .setRequired(false)
    )
    .addAttachmentOption(opt =>
      opt.setName('proof3')
        .setDescription('Additional proof attachment')
        .setRequired(false)
    ),

  async execute(interaction) {
    const medal = interaction.options.getString('medal');
    const reason = interaction.options.getString('reason');
    const proof1 = interaction.options.getAttachment('proof1');
    const proof2 = interaction.options.getAttachment('proof2');
    const proof3 = interaction.options.getAttachment('proof3');

    const proofAttachments = [proof1, proof2, proof3].filter(Boolean);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(CENTERED_TITLE)
      .setDescription([
        `${UNICODE_LINE}`,
        ``,
        `I would like to formally request consideration for the awarding of a medal in recognition of my contributions and service within the Company. I believe my efforts meet the outlined criteria and respectfully request your review and approval of this application.`,
        ``,
        `> **Username:** ${interaction.user}`,
        `> **Medal:** ${medal}`,
        `> **Reason:** ${reason}`,
        `> **Proof:** ${proofAttachments.length > 0 ? 'Attached' : 'N/A'}`,
      ].join('\n'))
      .setFooter({
        text: `${interaction.member?.nickname || interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();

    const channel = await interaction.client.channels.fetch(CHANNEL_ID);
    if (!channel || !channel.isTextBased()) {
      return interaction.reply({ content: '⚠️ Medal request channel is invalid.', ephemeral: true });
    }

    const messagePayload = {
      content: `<@&${ROLE_ID_1}>`,
      embeds: [embed],
    };

    if (proofAttachments.length > 0) {
      messagePayload.files = proofAttachments.map(att => new AttachmentBuilder(att.url));
    }

    await channel.send(messagePayload);
    await interaction.reply({ content: '✅ Your medal request has been submitted for review.', ephemeral: true });
  }
};
