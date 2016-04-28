const Botkit = require('botkit');
const Purdy = require('purdy')

const controller = Botkit.slackbot({
	debug: false
	//include "log: false" to disable logging
	//or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
	token: process.env.SLACK_TOKEN || "",
}).startRTM()

// give the bot something to listen for.
controller.hears('hello', ['direct_message', 'direct_mention', 'mention'], (bot,message) => {

	Purdy(message)
	bot.reply(message,'Hello yourself.');

});
controller.middleware.receive.use(function(bot, message, next) {

   if (message.bot_id) {

		const text = message.attachments[0].text
		const fallback = message.attachments[0].fallback

		const messages = text.split('\n').map(str => str.substr(str.indexOf('>`')+4))

		const repo = fallback.split(' ')[0].split('/')[0].substr(1)
		const branch = fallback.split(' ')[0].split('/')[1].substr(0, fallback.split(' ')[0].split('/')[1].length-1)

		// Purdy(message)
		// Purdy(messages)
		bot.reply(message, "I hear a commit on branch: "+branch+" of repo:"+repo)

		if (branch=='develop' && repo == 'story-pricer' && text.indexOf('#bot-easy-update') != -1 ) {
			bot.reply(message, "kevin easy update sp")
		}
	}
   next();
});
