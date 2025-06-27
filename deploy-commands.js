// deploy-commands.js
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const useGuild = true; // ⬅️ Set to false for global commands

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    console.log(`✅ Loaded: /${command.data.name}`);
  } else {
    console.warn(`⚠️ Skipped invalid command file: ${file}`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`\n🔄 Started refreshing ${commands.length} application (/) commands...\n`);

    const route = useGuild
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    await rest.put(route, { body: commands });

    console.log(`✅ Successfully registered ${commands.length} command(s) ${useGuild ? 'for guild' : 'globally'}.\n`);
    console.log('📦 Registered Commands:');
    for (const cmd of commands) {
      console.log(`• /${cmd.name}`);
    }

  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
