const Discord = require('discord.js');
const auth = require('./auth.json');
const Helpers = require('./helpers/main.js');
const Music = require('./helpers/music.js');

const client = new Discord.Client();
client.login(auth.discord_token);

const helpers = new Helpers(client);
const music = new Music(client);
const channelIDMap = {
    '733306905908477962': '29e-bot'
}

client.once('ready', () => {
    console.log('Connected');
    console.log('Logged in as: ');
    console.log(client.user.username + ' - (' + client.user.id + ')');
});

// Bot message handler
client.on('message', message => {
    const channelID = message.channel.id;
    const channelName = message.channel.name;
    const userName = message.author.username;
    const userID = message.author.id;
    const content = message.content;
    
    console.log(message)

    console.log(`{ user: ${ userName }, userID: ${ userID }, channelID: ${ channelID }, channelName: ${ channelName }, content: ${ content } }`);

    if (content[0] === '-') {
        const args = content.substring(1).split(' ').slice(1);
        const command = content.substring(1).split(' ')[0];

        const commands = {
            'help': {
                'func': (commands) => helpers.helpHandler(channelID, userName, commands),
                'description': 'Provides details and usage for all commands',
                'usage': ['-help']
            },
            'hello': {
                'func': () => helpers.sendEmbeddedMessage(channelID, {description: 'hi'}),
                'description': 'Says hi',
                'usage': ['-hello']
            },
            'strat': {
                'func': () => helpers.stratHandler(channelID, content, args),
                'description': '',
                'usage': ['-strat (map) [side] [locations]']
            },
            'weather': {
                'func': () => helpers.sendEmbeddedMessage(channelID, {description: 'It is raining in Johnsonville'}),
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
                'func': () => helpers.ollysAssHandler(channelID, content, userID),
                'description': 'Put it in Olly\'s ass',
                'usage': ['-put it in my ass', '-put it in ollys ass']
            },
            'yahn': {
                'hidden': true,
                'func': () => helpers.yahnHandler(channelID, args)
            }
        }

        if (command.toLowerCase() in commands) commands[command.toLowerCase()].func(commands);
        else if (channelID === '733306905908477962') helpers.sendEmbeddedMessage(channelID, {description: 'Invalid input. Type `-help` for a list of commands'});

    }
    
});