const Botkit = require('botkit');
const Purdy = require('purdy')
const Exec = require('child_process').exec
const Waterfall = require('async-waterfall')
const ENV = process.env.BOT_ENV || 'local'

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

controller.hears('update yourself', ['direct_message'], (bot, message) => {
	bot.reply(message, 'on it boss!')
	if (ENV=='prod') {
		Waterfall([
			(next) => {
				bot.reply(message, 'reset repo')
				Exec('git reset --hard', { cwd: '/root/botkit-minion/' }, next)
			},
			(out, more, next) => {
				bot.reply(message, 'pulling changes')
				Exec('git pull origin develop --tags', { cwd: '/root/botkit-minion/' }, next)
			},
			(out, more, next) => {
				bot.reply(message, "\`\`\`"+out+"\`\`\`")
				bot.reply(message, 'done!')
				Exec('supervisorctl restart botkit', { cwd: '/root/botkit-minion/' }, next)
			},
		], (err, out) => {
			if (err) {
				bot.reply(message, 'bad update!')
				bot.reply(message, err.message)
			}
			else {
				bot.reply(message, 'done!')
			}
		})
	}

})

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
