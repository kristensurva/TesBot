// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const pythonModule = require('./pythonpart.js');

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'quote') {
		let arg = interaction.options.getString('user')
		
		if (arg === null) {
			arg = ""
		}
		let reply = await pythonModule.pythonScriptQuote(arg);
		if (reply==='naw') {
			interaction.Reply("Unsupported character in name, stop trying to crash me...")
		}
		else {
			reply.replace("\\", "")
			console.log(reply)
			await interaction.reply(reply);
		}

	} else if (commandName === 'count') {
		let arg1 = interaction.options.getString('text')
		let arg2 = interaction.options.getInteger('top')
		if (arg2===null) {
			arg2=15
		}
		await interaction.deferReply()
		let reply = await pythonModule.pythonScriptCount(arg1, arg2);
		if (reply==='naw') {
			interaction.editReply("Unsupported character unfortunately.")
		}
		else {
			await interaction.editReply('X_X');
			interaction.deleteReply()
			interaction.channel.send({files: ["table.png"]})
		}
	}
});

// Login to Discord with your client's token
client.login(token);