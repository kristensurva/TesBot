// Require the necessary discord.js classes
import { Client, Collection, Intents } from 'discord.js';
import { apiURL, token } from './config.js';
import fetch from 'node-fetch';
// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
import { pythonScriptQuote, pythonScriptCount } from './pythonpart.js';

const GALLERY_REACTIONS = ['0daily', '0weekly'];
const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
const RAT_ID = "300246286580318209";
const PROMPTER_ID = "1191382581422342244";
const PROMPTS_POSTER_IDS = [RAT_ID, PROMPTER_ID];

let lastGalleryCall;

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
			filtered = messages.filter(message => message.reactions.cache.some(reaction => GALLERY_REACTIONS.includes(reaction.emoji.name)) || (PROMPTS_POSTER_IDS.includes(message.author.id) && message.content.includes('prompts') && !message.content.includes('reminder for')) || (message.author.id == '168034871724343296' && message.content.includes('----------')));
			all = all.concat(filtered);
			console.log(all.size, 'messages collected')
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
			if (lastGalleryCall + (5 * 60 * 1000) > Date.now()) {
				interaction.reply({ content: `Too soon, retry in: ${Math.round((lastGalleryCall + (5 * 60 * 1000) - Date.now()) / (1000 * 60))} minutes`, ephemeral: true })
				return;
			}
			lastGalleryCall = Date.now();
			interaction.reply({ content: "Working on it", ephemeral: true })
			messageCollection = await _getAllMessages();
			let exceptions = [];
			messageCollection = messageCollection.map(({ author, content, reactions, attachments, embeds }) => ({
				content: PROMPTS_POSTER_IDS.includes(author.id) ? content.split('\n')[3].slice(2, -2) : content.includes('----------') ? (exceptions.push(content.split('\n')[3].slice(2, -2)), content.split('\n')[3].slice(2, -2)) : content,
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
			})).filter(({ user, content }) => !PROMPTS_POSTER_IDS.includes(user.id) || content).reverse();
			reply = {};
			for (let i = 0, currentDaily, currentWeekly, previousDaily, previousWeekly; i < messageCollection.length; i++) {
				if (PROMPTS_POSTER_IDS.includes(messageCollection[i].user.id) || exceptions.includes(messageCollection[i].content)) {
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
			try {
				await fetch(apiURL.replace("{year}", args.year ?? new Date().getFullYear()), {
					method: 'put',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(reply)
				})
				interaction.channel.send("Gallery has been updated!")
			}
			catch (err) {
				interaction.channel.send("Gallery update error.")
			}
			break;
	}
});

// Login to Discord with your client's token
client.login(token);
