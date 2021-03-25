const Discord = require('discord.js');
const auth = require('./auth.json');
const Helpers = require('./helpers/main.js');
const Music = require('./helpers/music.js');
const Theme = require('./helpers/theme.js');

const client = new Discord.Client();
client.login(auth.discord_token);

const helpers = new Helpers(client);
const music = new Music(client, helpers);
const theme = new Theme(client, helpers);
const channelMap = {};
const userIDMap = {}
let bot = {};

client.once('ready', () => {
    console.log(`Connected. Logged in as: ${ client.user.username } - (${ client.user.id })`);

    client.channels.cache.each(channel => {
        channelMap[channel.id] = {
            id: channel.id,
            name: channel.name
        }
    });

    client.guilds.cache.each(guild => {
        guild.members.cache.each(member => {
            userIDMap[member.id] = {
                id: member.id,
                userName: member.user.username,
                nickName: member.nickname
            }
            if (member.user.username === '29E Bot') {
                bot = userIDMap[member.id];
                member.setNickname('29E Bot');
                theme.setBot(bot);
            }
        });
    });
});

// Bot message handler
client.on('message', async message => {
    const channelID = message.channel.id;
    const channelName = message.channel.name;
    const userName = message.author.username;
    const userID = message.author.id;
    const content = message.content.toLowerCase();
    const guildMember = message.channel.guild.members.cache.get(userID);

    // console.log(`{ user: ${ userName }, userID: ${ userID }, channelID: ${ channelID }, channelName: ${ channelName }, content: ${ content } }`);
    // console.log(client.channels.cache.get('720451534894399520'));
    // console.log(message.channel.guild.members.cache.get(userID).voice.serverMute = true);
    // console.log(client.users);

    if (content.split(' ')[0] === '-ask') {
        const options = [
            'As I see it, yes.',
            'Ask again later.',
            'Better not tell you now.',
            'Cannot predict now.',
            'Concentrate and ask again.',
            'Don’t count on it.',
            'It is certain.',
            'It is decidedly so.',
            'Most likely.',
            'My reply is no.',
            'My sources say no.',
            'Outlook not so good.',
            'Outlook good.',
            'Reply hazy, try again.',
            'Signs point to yes.',
            'Very doubtful.',
            'Without a doubt.',
            'Yes.',
            'Yes – definitely.',
            'You may rely on it.'
        ];
        const index = Math.floor(Math.random() * options.length);
        helpers.sendEmbeddedMessage(channelID, {description: options[index]});
        return;
    }

    if (content.split(' ')[0] === '-theme') {
        theme.themeHandler(message);
        return;
    }

    if (content === '-jeff') {
        const voiceChannelID = message.member.voice.channel;
        if (voiceChannelID) {
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play('assets/mp3/jeff.mp3', {volume: 1});
            dispatcher.on('finish', () => {
                dispatcher.destroy();
                message.member.voice.channel.leave();
            });
        }
        return;
    }

    if (content === '-racism') {
        const voiceChannelID = message.member.voice.channel;
        if (voiceChannelID) {
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play('assets/mp3/racism.mp3', {volume: 1});
            dispatcher.on('finish', () => {
                dispatcher.destroy();
                message.member.voice.channel.leave();
            });
        }
        return;
    }

    if (content === '-11') {
        const voiceChannelID = message.member.voice.channel;
        if (voiceChannelID) {
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play('assets/mp3/wololo.mp3', {volume: 1});
            dispatcher.on('finish', () => {
                dispatcher.destroy();
                message.member.voice.channel.leave();
            });
        }
        return;
    }

    if (content === '-microwave') {
        message.channel.guild.members.cache.each(member => {
            if (member.user.username === 'AuntyJacinda') member.voice.setChannel(null);
        });
        return;
    }

    if (content === '-silence') {
        return;
        const voiceChannelID = message.channel.guild.members.cache.get(message.author.id).voice;
        if (!voiceChannelID) return;
        message.channel.guild.members.cache.each(member => {
            member.voice.setMute(true);
        });
        return;
    }

    if (content === '-speak') {
        const voiceChannelID = message.channel.guild.members.cache.get(message.author.id).voice;
        if (!voiceChannelID) return;
        message.channel.guild.members.cache.each(member => {
            member.voice.setMute(false);
        });
        return;
    }
    
    if (content === '-converge') {
        const voiceChannelID = message.channel.guild.members.cache.get(message.author.id).voice;
        if (!voiceChannelID) return;
        message.channel.guild.members.cache.each(member => {
            member.voice.setChannel(voiceChannelID);
        });
        return;
    }

    if (content === '-scatter') {
        const voiceChannelID = message.channel.guild.members.cache.get(message.author.id).voice;
        if (!voiceChannelID) return;
        const channels = [];
        for (const [_, channel] of Object.entries(channelMap)) {
            channels.push(channel);
        }
        let currentChannels = [];
        message.channel.guild.members.cache.each(member => {
            if (currentChannels.length === 0) currentChannels = JSON.parse(JSON.stringify(channels));
            const index = Math.floor(Math.random() * currentChannels.length);
            member.voice.setChannel(currentChannels[index].id);
            currentChannels.splice(index, 1);
        });
        return;
    }

    if (content === '-unmuteme') {
        message.channel.guild.members.cache.get(userID).voice.setMute(false);
        return;
    }

    if (content === '-muteme') {
        message.channel.guild.members.cache.get(userID).voice.setMute(true);
        return;
    }

    if (content === '-kickme') {
        message.channel.guild.members.cache.get(userID).voice.setChannel(null);
        return;
    }

    if (content[0] === '-') {
        const args = content.substring(1).split(' ').slice(1);
        const command = content.substring(1).split(' ')[0];

        const commands = {
            // General commands
            'help': {
                'func': () => helpers.helpHandler(message, commands),
                'description': 'Provides details and usage for all commands',
                'usage': ['-help']
            },
            'hello': {
                'func': () => helpers.sendEmbeddedMessage(channelID, {description: 'hi'}),
                'description': 'Says hi',
                'usage': ['-hello']
            },
            'weather': {
                'func': () => helpers.sendEmbeddedMessage(channelID, {description: 'It is raining in Johnsonville'}),
                'description': 'Provides weather report for current location',
                'usage': ['-weather']
            },
            'yahn': {
                'hidden': true,
                'func': () => helpers.yahnHandler(message, args)
            },
            'commsclear': {
                'func': () => helpers.clearCommsHandler(message),
                'description': `CLEAR THE COMMS`,
                'usage': ['-commsclear']
            },
            'channel': {
                'func': () => helpers.channelHandler(message, channelMap, args),
                'description': `everyone get in here`,
                'usage': [`-channel`]
            },



            // CS:GO commands
            'strat': {
                'func': () => helpers.stratHandler(message, args),
                'description': '',
                'usage': ['-strat (map) [side] [locations]']
            },



            // Fishing commands
            'catch': {
                'func': () => helpers.catchHandler(message, args),
                'type': 'fishing',
                'description': 'Catch a fish',
                'usage': ['-catch (fish name)']
            },
            'fish': {
                'func': () => helpers.getFish(message),
                'type': 'fishing',
                'description': 'Find some fish',
                'usage': ['fish']
            },
            'leaderboard': {
                'func': () => helpers.leaderboardHandler(message),
                'type': 'fishing',
                'description': `See who's the best`,
                'usage': ['-leaderboard']
            },

            

            // Music/sound commands
            'song': {
                'func': () => music.playHandler(message, args),
                'description': 'Provides details for provided song/video (will search YouTube)',
                'usage': ['-song (song name | YouTube url)']
            }
        }

        if (command.toLowerCase() in commands) commands[command.toLowerCase()].func();
        else if (channelID === '733306905908477962') helpers.sendEmbeddedMessage(channelID, {description: 'Invalid input. Type `-help` for a list of commands'});

    }
    
});