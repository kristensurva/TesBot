(async () => {
	const { SlashCommandBuilder } = require('@discordjs/builders');
	const { REST } = require('@discordjs/rest');
	const { Routes } = require('discord-api-types/v9');
	const { clientId, guildId, token } = await import('./config.js');

	const commands = [
		new SlashCommandBuilder().setName('quote').setDescription('Replies with a random quote from given user, or if a user isn\'t given, a random user.')
			.addStringOption(option =>
				option.setName('user')
					.setDescription('User to get quote from')
					.setRequired(false)),
		new SlashCommandBuilder().setName('count').setDescription('Count the amount of times a string has been said by everyone.')
			.addStringOption(option =>
				option.setName('text')
					.setDescription('Text to count')
					.setRequired(true))
			.addIntegerOption(option =>
				option.setName('top')
					.setDescription('The number of people to display')
					.setRequired(false)),
		new SlashCommandBuilder().setName('gallery').setDescription('Sends JSON with data for gallery')
		// .addBooleanOption(option =>
		// 	option.setName('exact')
		// 		.setDescription('Ignores text matches within other words')
		// 		.setRequired(false))
	]
		.map(command => command.toJSON());



	const rest = new REST({ version: '9' }).setToken(token);



	rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);

})()