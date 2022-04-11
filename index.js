// Require the necessary discord.js classes
import { Client, Collection, Intents } from 'discord.js';
import { token } from './config.js';
import { Buffer } from 'buffer';

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
import { pythonScriptQuote, pythonScriptCount } from './pythonpart.js';

const GALLERY_REACTIONS = ['0daily', '0weekly'];
const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	let args = interaction.options.data.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {});
	let reply;
	let messageCollection;
	const _getAllMessages = async () => {
		let messages = new Collection();
		let lastMessage;
		let filtered = new Collection();
		let all = new Collection();
		do {
			messages = await interaction.channel.messages.fetch({ limit: 100, before: lastMessage });
			lastMessage = messages?.last()?.id
			filtered = messages.filter(message => message.reactions.cache.some(reaction => GALLERY_REACTIONS.includes(reaction.emoji.name)) || (message.author.id == '300246286580318209' && message.content.includes('prompts')) || ( message.author.id == '168034871724343296'  && message.content.includes('----------')));
			all = all.concat(filtered);
			console.log(all.size , 'messages collected')
		}
		while (messages.size)
		return all;
	}

	switch (commandName) {
		case 'quote':
			reply = await pythonScriptQuote(args);
			if (reply === 'naw') {
				interaction.Reply("Unsupported character in name, stop trying to crash me...")
			} else {
				reply.replace("\\", "")
				console.log(reply)
				await interaction.reply(reply);
			}
			break;
		case 'count':
			await interaction.deferReply()
			reply = await pythonScriptCount(args);
			if (reply === 'naw') {
				interaction.editReply("Unsupported character unfortunately.")
			}
			else {
				await interaction.editReply('X_X');
				interaction.deleteReply()
				interaction.channel.send({ files: ["table.png"] })
			}
			break;
		case 'gallery':
			messageCollection = await _getAllMessages();
			messageCollection = messageCollection.map(({ author, content, reactions, attachments, embeds }) => ({
				content: author.id == '300246286580318209' || content.includes('----------') ? content.split('\n')[3].slice(2, -2) : content,
				image: {
					src: attachments?.first()?.url || embeds?.[0]?.url,
					thumb: attachments?.first()?.proxyURL || embeds?.[0]?.thumbnail?.proxyURL,
					width: attachments?.first()?.width || embeds?.[0]?.thumbnail?.width,
					height: attachments?.first()?.height || embeds?.[0]?.thumbnail?.height
				},
				user: {
					id: author.id,
					name: author.username,
					picture: author.id + '/' + author.avatar + '.png'
				},
				daily: reactions.cache.some(reaction => reaction.emoji.name == '0daily') || content.includes('daily prompts'),
				weekly: reactions.cache.some(reaction => reaction.emoji.name == '0weekly') || content.includes('weekly prompts'),
				previous: reactions.cache.some(reaction => reaction.emoji.name == '⬅️'),
				order: NUMBER_EMOJIS.indexOf(reactions.cache.find(reaction => NUMBER_EMOJIS.includes(reaction.emoji.name))?.emoji.name)
			})).filter(({ user, content }) => user.id != '300246286580318209' || content).reverse();
			reply = {};
			for (let i = 0, currentDaily, currentWeekly, previousDaily, previousWeekly; i < messageCollection.length; i++) {
				if (messageCollection[i].user.id == '300246286580318209' || messageCollection[i].content.includes('----------')) {
					if (messageCollection[i].daily) {
						previousDaily && (reply[previousDaily].entries.sort((a, b) => a.order - b.order));
						previousDaily = currentDaily;
						currentDaily = messageCollection[i].content;
					}
					if (messageCollection[i].weekly) {
						previousWeekly && (reply[previousWeekly].entries.sort((a, b) => a.order - b.order));
						previousWeekly = currentWeekly;
						currentWeekly = messageCollection[i].content;
					}
					reply[messageCollection[i].content] = {
						...messageCollection[i],
						entries: []
					}
				} else {
					messageCollection[i].daily && reply[messageCollection[i].previous ? previousDaily : currentDaily].entries.push(messageCollection[i])
					messageCollection[i].weekly && reply[messageCollection[i].previous ? previousWeekly : currentWeekly].entries.push(messageCollection[i])
				}
			}
			interaction.channel.send({ files: [{ attachment: Buffer.from(JSON.stringify(reply)), name: 'data.json' }] })
			break;
	}
});

// Login to Discord with your client's token
client.login(token);