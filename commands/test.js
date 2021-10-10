module.exports = {
	name: 'test',
	description: 'This command is for testing the bots response',
	execute(message, args) {
		message.channel.send('This test was successful.');
	},
};
