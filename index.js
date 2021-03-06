require("dotenv").config()

const fs = require('fs');
const Discord = require('discord.js');
const {prefix} = require('./config.json');
console.log(prefix)
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

async function init(){
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		client.commands.set(command.name, command);
	}
	client.on('message', async message => {
		if (!message.content.startsWith(prefix) || message.author.bot) return;

		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();

		if (!client.commands.has(command)) return;

		try {
			client.commands.get(command).execute(message, args);
		} catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}
	});

	client.login(process.env.BOT_TOKEN);
}
init();

client.once('ready', () => {
	console.log('Ready!');

});
