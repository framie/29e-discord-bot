const Discord = require('discord.io');
const logger = require('winston');

const auth = require('./auth.json');
const Helpers = require('./helpers/main.js');
const Music = require('./helpers/music.js');

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

const bot = new Discord.Client({
    token: auth.discord_token,
    autorun: true
});
const helpers = new Helpers(bot);
const music = new Music(bot);
const channelIDMap = {
    '733306905908477962': '29e-bot'
}

bot.on('ready', (evt) => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

// Bot message handler
bot.on('message', (user, userID, channelID, message, evt) => {
    
    console.log(`{ user: ${ user }, userID: ${ userID }, channelID: ${ channelID }, channelName: ${ channelIDMap[channelID] }, message: ${ message } }`);

    if (message[0] === '-') {
        const args = message.substring(1).split(' ').slice(1);
        const command = message.substring(1).split(' ')[0];

        const commands = {
            'help': {
                'func': (commands) => helpers.helpHandler(channelID, user, commands),
                'description': 'Provides details and usage for all commands',
                'usage': ['-help']
            },
            'hello': {
                'func': () => helpers.sendEmbeddedMessage(channelID, 'hi'),
                'description': 'Says hi',
                'usage': ['-hello']
            },
            'strat': {
                'func': () => helpers.stratHandler(channelID, message, args),
                'description': '',
                'usage': ['-strat (map) [side] [locations]']
            },
            'weather': {
                'func': () => helpers.sendEmbeddedMessage(channelID, 'It is raining in Johnsonville'),
                'description': 'Provides weather report for current location',
                'usage': ['-weather']
            },
            'song': {
                'func': () => music.playHandler(channelID, userID, args),
                'description': 'Provides details for provided song/video (will search YouTube)',
                'usage': ['-song (song name | YouTube url)']
            },
            'put': {
                'hidden': true,
                'func': () => helpers.ollysAssHandler(channelID, message, userID),
                'description': 'Put it in Olly\'s ass',
                'usage': ['-put it in my ass', '-put it in ollys ass']
            },
            'yahn': {
                'hidden': true,
                'func': () => helpers.yahnHandler(channelID, args)
            }
        }

        if (command.toLowerCase() in commands) commands[command.toLowerCase()].func(commands);
        else if (channelID === '733306905908477962') helpers.sendEmbeddedMessage(channelID, 'Invalid input. Type `-help` for a list of commands');

    }
    
});