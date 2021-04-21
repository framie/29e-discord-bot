const Discord = require('discord.js');
const auth = require('./auth.json');
const fs = require('fs');
const Helpers = require('./helpers/main.js');
const Music = require('./helpers/music.js');
const Theme = require('./helpers/theme.js');

const client = new Discord.Client();
client.login(auth.discord_token);
const data = fs.readFileSync('data.json', 'utf8')
client.data = data ? JSON.parse(data) : {};

const helpers = new Helpers(client);
const music = new Music(client, helpers);
const theme = new Theme(client, helpers);
const channelMap = {};
const userIDMap = {};
const admins = [
    'chiwa'
];
let bot = {};

// 1 minute = 60000

console.log('client.data', client.data);

const fishDelay = client.data && client.data.fish.fishDelay
? client.data.fish.fishDelay
: {
    messages: 0,
    time: new Date().getTime(),
    messageThreshold: 20,
    timeThreshold: 60000 * 5
}
// fishDelay.time -= fishDelay.timeThreshold;
// fishDelay.messages += fishDelay.messageThreshold;

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

    if (message.channel.type === 'dm') {
        const userName = message.author.username;
        const userID = message.author.id;
        const content = message.content.toLowerCase();
        console.log(`DM: { user: ${ userName }, userID: ${ userID }, content: ${ content } }`);

        if (content.split(' ')[0] === '-say') {
            client.channels.cache.each(channel => {
                if (channel.name === 'shitchat') {
                    const message = content.slice(5);
                    helpers.sendMessage(channel.id, message);
                }
            });
            return;
        }

        if (content.split(' ')[0] === '-embed') {
            client.channels.cache.each(channel => {
                if (channel.name === 'shitchat') {
                    const message = content.slice(7);
                    helpers.sendEmbeddedMessage(channel.id, {description: message});
                }
            });
            return;
        }

        if (content.split(' ')[0] === '-theme') {
            theme.dmHandler(message);
            return;
        }

        if (content[0] === '-') {
            helpers.sendEmbeddedDM(userID, {description: 'Unrecognised command'});
        }
        return;
    }

    const channelID = message.channel.id;
    const channelName = message.channel.name;
    const userName = message.author.username;
    const userID = message.author.id;
    const content = message.content.toLowerCase();
    const guildMember = message.channel.guild.members.cache.get(userID);
    const now = new Date();
    let commandFound = true;

    console.log(`Message: { user: ${ userName }, userID: ${ userID }, channelID: ${ channelID }, channelName: ${ channelName }, content: ${ content } }`);
    // console.log(client.channels.cache.get('720451534894399520'));
    // console.log(message.channel.guild.members.cache.get(userID).voice.serverMute = true);
    // console.log(client.users);

    fishDelay.messages += 1;
    const fishMessages = fishDelay.messageThreshold - fishDelay.messages;
    const fishTime = (fishDelay.time - now.getTime() + fishDelay.timeThreshold) / 60000;
    console.log(`${ fishMessages > 0 ? fishMessages : 0 } messages and ${ fishTime > 0 ? fishTime.toFixed(2) : 0 } minutes until a new fish`);
    if (fishMessages <= 0 && fishTime <= 0) {
        fishDelay.messages = 0;
        fishDelay.time = now.getTime();
        helpers.getFish(message, true);
    }
    if ('fish' in client.data) {
        client.data.fish.fishDelay = fishDelay;
    } else {
        client.data.fish = {
            fishDelay
        }
    }

    soundChecker = (content) => {
        const command = content.slice(1);
        const soundMap = {
            '11': 'Monk',
            'andmyaxe': 'Gimli',
            'doit': 'Shia LaBeouf',
            'gandalfwhistlingforshadowfax': 'Gandalf the White',
            'greatsoup': 'Shrek',
            'jeff': 'Jeff',
            'onemorestep': 'Samwise Gamgee',
            'racism': 'David Guetta',
            'stillonlycountsasone': 'Gimli',
            'stillsharp': 'Boromir Eldest Son of Denethor',
            'stinky': 'monke',
            'thisisagoodsword': 'Haleth, Son of Hama'
        }
        if (command in soundMap) return { command, nickname: soundMap[command]};
        else return false
    }    
    soundHelper = async (soundData) => {
        console.lo
        const voiceChannelID = message.member.voice.channel;
        if (voiceChannelID) {
            helpers.changeNickname('29E Bot', soundData.nickname);
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play(`assets/mp3/${ soundData.command }.mp3`, {volume: 1});
            dispatcher.on('finish', () => {
                dispatcher.destroy();
                message.member.voice.channel.leave();
                helpers.changeNickname('29E Bot');
            });
        }
    }

    const soundData = soundChecker(content);
    console.log('test test soundData', soundData, !!soundData);
    if (soundData) {
        soundHelper(soundData);
        return;
    }

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
    } else if (content.split(' ')[0] === '-theme') {
        theme.themeHandler(message);
    } else if (content.slice(0, 9) === '-nickname') {
        const args = message.content.substring(1).split(' ').slice(1);
        if (args.length === 0) return;
        const name = args[0].toLowerCase() === 'bot' ? '29E Bot' : args[0];
        helpers.changeNickname(name, args.slice(1).join(' '));
    } else if (content === '-silence') {
        const voiceChannelID = message.channel.guild.members.cache.get(message.author.id).voice;
        if (!voiceChannelID) return;
        message.channel.guild.members.cache.each(member => {
            member.voice.setMute(true);
        });
    } else if (content === '-speak') {
        const voiceChannelID = message.channel.guild.members.cache.get(message.author.id).voice;
        if (!voiceChannelID) return;
        message.channel.guild.members.cache.each(member => {
            member.voice.setMute(false);
        });
    } else if (content === '-converge') {
        const voiceChannelID = message.channel.guild.members.cache.get(message.author.id).voice;
        if (!voiceChannelID) return;
        message.channel.guild.members.cache.each(member => {
            member.voice.setChannel(voiceChannelID);
        });
    } else if (content === '-scatter') {
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
    } else if (content === '-unmuteme') {
        message.channel.guild.members.cache.get(userID).voice.setMute(false);
    } else if (content === '-muteme') {
        message.channel.guild.members.cache.get(userID).voice.setMute(true);
    } else if (content === '-silenceolly') {
        client.guilds.cache.each(guild => {
            guild.members.cache.each(member => {
                if (member.user.username === 'NaggerFlip') {
                    member.voice.setMute(true);
                }
            });
        });
    } else if (content === '-kickolly') {
        client.guilds.cache.each(guild => {
            guild.members.cache.each(member => {
                if (member.user.username === 'NaggerFlip') {
                    member.voice.setChannel(null);
                }
            });
        });
    } else if (content === '-kickme') {
        message.channel.guild.members.cache.get(userID).voice.setChannel(null);
    } else {
        commandFound = false;
    }

    if (!commandFound && content[0] === '-') {
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
                'func': () => helpers.yahnHandler(message)
            },
            'commsclear': {
                'func': () => helpers.clearCommsHandler(message),
                'description': `CLEAR THE COMMS`,
                'usage': ['-commsclear']
            },
            'channel': {
                'func': () => helpers.channelHandler(message, channelMap),
                'description': `everyone get in here`,
                'usage': [`-channel`]
            },



            // CS:GO commands
            'strat': {
                'func': () => helpers.stratHandler(message),
                'description': '',
                'usage': ['-strat (map) [side] [locations]']
            },



            // Fishing commands
            'catch': {
                'func': () => helpers.catchHandler(message),
                'type': 'fishing',
                'description': 'Catch a fish',
                'usage': ['-catch (fish name)']
            },
            'fish': {
                'hidden': true,
                'func': () => {
                    const update = admins.includes(userName) && args[0] === 'new';
                    if (update) {
                        fishDelay.messages = 0;
                        fishDelay.time = now.getTime();
                    }
                    helpers.getFish(message, update)
                },
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

    helpers.setData(client.data);
    
});