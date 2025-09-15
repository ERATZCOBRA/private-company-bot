const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rate-a-personnel')
    .setDescription('Submit a rating and feedback for a personnel.')
    .addUserOption(option =>
      option.setName('personnel')
        .setDescription('Personnel you want to rate')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('rating')
        .setDescription('Rate the personnel')
        .setRequired(true)
        .addChoices(
          { name: '1/10', value: '1/10' },
          { name: '2/10', value: '2/10' },
          { name: '3/10', value: '3/10' },
          { name: '4/10', value: '4/10' },
          { name: '5/10', value: '5/10' },
          { name: '6/10', value: '6/10' },
          { name: '7/10', value: '7/10' },
          { name: '8/10', value: '8/10' },
          { name: '9/10', value: '9/10' },
          { name: '10/10', value: '10/10' },
        ))
    .addStringOption(option =>
      option.setName('feedback')
        .setDescription('Your feedback about the personnel')
        .setRequired(true)),

  async execute(interaction, client) {
    const personnel = interaction.options.getUser('personnel');
    const rating = interaction.options.getString('rating');
    const feedback = interaction.options.getString('feedback');

    const requester = interaction.user;
    const time = new Date().toLocaleString('en-GB', {
      hour12: false,
      dateStyle: 'short',
      timeStyle: 'short',
    });

    await interaction.reply({ content: '✅ Personnel rating submitted.', ephemeral: true });

    const channelId = process.env.RATE_CHANNEL_ID;
    const channel = await client.channels.fetch(channelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle(`**ㅤㅤㅤPrivate Company Ratingㅤㅤㅤ**`)
      .setDescription(
        `**Personnel:** <@${personnel.id}>\n` +
        `**Personnel's Rating:** ${rating}\n` +
        `**Feedback:** ${feedback}\n\n` +
        `**Signed,**\n${requester}`
      )
      .setColor(0x0000ff)
      .setFooter({
        text: `Rated by ${requester.username} | On ${time}`,
        iconURL: requester.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await channel.send({
      content: `<@${personnel.id}>`,
      embeds: [embed],
    });
  },
};
