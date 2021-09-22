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
    'chiwa',
    'NaggerFlip'
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
                username: member.user.username,
                nickname: member.nickname
            }
            if (member.user.username === '29E Bot') {
                bot = userIDMap[member.id];
                member.setNickname('29E Bot');
                theme.setBot(bot);
            }
        });
    });

    console.log('ChannelMap', channelMap);
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

        if (content[0] === '-' && !(admins.includes(userName))) {
            helpers.sendEmbeddedDM(userID, {description: 'Unrecognised command'});
        }
        if (!(admins.includes(userName))) return;
    }

    const channelID = message.channel.id;
    const channelName = message.channel.name;
    const userName = message.author.username;
    const userID = message.author.id;
    const content = message.content.toLowerCase();
    const guildMember = message.channel.guild && message.channel.guild.members.cache.get(userID);
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

    const soundMap = {
        '11': 'Monk',
        'afineaddition': 'General Grevious',
        'andmyaxe': 'Gimli',
        'boourns': '',
        'care': 'Tiny Violin',
        'cs': 'Gandalf the White',
        'doit': 'Shia LaBeouf',
        'french': 'Renekton',
        'gay': 'Chang',
        'getthatcornoutofmyface': 'Nacho Libre',
        'gooooodanakin': 'Emperor Palpatine',
        'greatsoup': 'Shrek',
        'hefell': 'Gimli',
        'holyshit': 'Holy Shit',
        'jeff': 'Jeff',
        'niceboulder': 'Donkey',
        'no': 'Daddy Obi-Wan',
        'noturkey': 'Mark Corrigan',
        'onemorestep': 'Samwise Gamgee',
        'pizzatime': 'Peter Parker',
        'racism': 'David Guetta',
        'sad': 'Depression',
        'stillonlycountsasone': 'Gimli',
        'stillsharp': 'Boromir, Eldest Son of Denethor',
        'stinky': 'monke',
        'thatsreallyinteresting': '',
        'thisisagoodsword': 'Haleth, Son of Hama',
        'unlimitedpower': 'Emperor Palpatine',
        'youunderestimatemypower': 'Anakin Skywalker',
        'why': 'Michael Scott'
    }
    soundChecker = (content) => {
        const args = content.slice(1).split(' ');
        const command = args[0];
        if (!(command in soundMap)) return false;
        let voiceChannel;
        if (args.length > 1 && userName !== 'yahnschiefpresssecretary') {
            const user = args.slice(1).join(' ');
            let userFound = false;
            client.guilds.cache.each(guild => {
                guild.members.cache.each(member => {
                    const displayName = member.displayName
                        ? member.displayName.toLowerCase()
                        : '';
                    if (!userFound && (member.user.username.toLowerCase().includes(user) || (displayName && displayName.includes(user)))) {
                        userFound = true;
                        voiceChannel = member.voice.channel;
                    }
                });
            });
        }
        if (command in soundMap) return { command, nickname: soundMap[command], voiceChannel};
        else return false
    }    
    soundHelper = async (soundData) => {
        const voiceChannel = soundData.voiceChannel 
            ? soundData.voiceChannel
            : message.member.voice.channel;
        if (voiceChannel) {
            if (soundData.nickname) helpers.changeNickname('29E Bot', soundData.nickname);
            const connection = await voiceChannel.join();
            const dispatcher = connection.play(`assets/mp3/${ soundData.command }.mp3`, {volume: 1});
            dispatcher.on('finish', () => {
                dispatcher.destroy();
                voiceChannel.leave();
                helpers.changeNickname('29E Bot');
            });
        }
    }

    const soundData = soundChecker(content);
    if (soundData) {
        soundHelper(soundData);
        return;
    }

    if (content.split(' ')[0] === '-quotes') {
        helpers.sendEmbeddedMessage(channelID, {description: Object.keys(soundMap).sort().map(key => `-${ key }`).join('\n')});
        return;
    } else if (content.split(' ')[0] === '-ask') {
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
        return;
        const voiceChannelID = message.channel.guild.members.cache.get(message.author.id).voice;
        if (!voiceChannelID) return;
        message.channel.guild.members.cache.each(member => {
            member.voice.setMute(true);
        });
    } else if (content === '-speak') {
        return;
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
        return;
        client.guilds.cache.each(guild => {
            guild.members.cache.each(member => {
                if (member.user.username === 'NaggerFlip') {
                    member.voice.setMute(true);
                }
            });
        });
    } else if (content === '-unsilenceolly') {
        return;
        client.guilds.cache.each(guild => {
            guild.members.cache.each(member => {
                if (member.user.username === 'NaggerFlip') {
                    member.voice.setMute(false);
                }
            });
        });
    } else if (content.split(' ')[0] === '-kick' && content.split(' ').length > 1) {
        const name = content.split(' ').slice(1).join(' ');
        let userFound = false;
        client.guilds.cache.each(guild => {
            guild.members.cache.each(member => {
                const nickname = member.nickname ? member.nickname : member.user.username;
                if (!userFound && nickname.toLowerCase().includes(name)) {
                    userFound = true;
                    member.voice.setChannel(null);
                }
            });
        });
    } else if (content.split(' ')[0] === '-silence' && content.split(' ').length > 1) {
        const name = content.split(' ').slice(1).join(' ');
        let userFound = false;
        client.guilds.cache.each(guild => {
            guild.members.cache.each(member => {
                const nickname = member.nickname ? member.nickname : member.user.username;
                if (!userFound && nickname.toLowerCase().includes(name)) {
                    userFound = true;
                    member.voice.setMute(true);
                }
            });
        });
    } else if (content.split(' ')[0] === '-unsilence' && content.split(' ').length > 1) {
        const name = content.split(' ').slice(1).join(' ');
        let userFound = false;
        client.guilds.cache.each(guild => {
            guild.members.cache.each(member => {
                const nickname = member.nickname ? member.nickname : member.user.username;
                if (!userFound && nickname.toLowerCase().includes(name)) {
                    userFound = true;
                    member.voice.setMute(false);
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
    } else if (content === '-logs') {
        client.guilds.cache.each(guild => {
            if (guild.name !== '29E Gaming Channel') return;
            guild.fetchAuditLogs().then(res => {
                const actions = {
                    'MEMBER_MOVE': 'moved',
                    'MEMBER_DISCONNECT': 'disconnected',
                    'MEMBER_UPDATE': ''
                }
                const logs = res.entries;
                let counter = 0;
                const formatted = [];
                logs.each(log => {
                    if (log.action === 'MEMBER_UPDATE') console.log(log.executor.username, log.target.username, log.changes);
                    if (!(log.action in actions) || formatted.length >= 10) return;
                    let executor = !log.executor ? 'Someone' : log.executor.nickname ? log.executor.nickname : log.executor.username;
                    let target = !log.target ? 'someone' : log.target.nickname ? log.target.nickname : log.target.username;
                    if (executor === '29E Bot') return;
                    let action = actions[log.action];
                    if (log.action === 'MEMBER_UPDATE') {
                        if (log.changes[0].key === 'mute') {
                            action = log.changes[0].new ? 'muted' : 'unmuted';
                        }
                    }
                    if (!action) return;
                    formatted.push(`${ ++counter }) ${ executor } ${ action } ${ target }`);
                });
                const description = !formatted.length ? 'No logs found' : formatted.join('\n');
                if (message.channel.type === 'dm') helpers.sendEmbeddedDM(userID, {description});
                else helpers.sendEmbeddedMessage(channelID, {description});
            });
        });
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
            'olly': {
                'hidden': true,
                'func': () => helpers.ollyHandler(message)
            },
            'schneebs': {
                'hidden': true,
                'func': () => helpers.schneebsHandler(message)
            },
            'snrub': {
                'hidden': true,
                'func': () => helpers.snrubHandler(message)
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