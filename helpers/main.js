const fetch = require('node-fetch');
const jsdom = require('jsdom');
const fs = require('fs');

class Helpers {
    constructor(client) {
        this.client = client;
        this.currentFish = {
            caught: true
        }
        this.userFile = './users.json';
        this.userData = {};
        this.getData();
    }

    getArgs = (message) => {
        return message.content.toLowerCase().substring(1).split(' ').slice(1);
    }

    titleCase = (str) => {
        return str[0].toUpperCase() + str.slice(1);
    }

    getFormattedDate = () => {
        const now = new Date();
        return `${ now.getDate() }-${ now.getMonth() + 1 }-${ now.getFullYear() }`;
    }

    getRand = (arr, remove = false) => {
        const index = Math.floor(Math.random() * arr.length);
        const rand = arr[index];
        if (remove) {
            arr.splice(index, 1);
            return arr, rand;
        }
        return rand;
    }

    getData = (() => {
        const obj = this;
        fs.readFile(this.userFile, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }
            obj.userData = JSON.parse(data);
        });
    });

    setData = (() => {
        fs.writeFile(this.userFile, JSON.stringify(this.userData, null, 4), (err) => {
            if (err) {
                throw err;
            }
        });
    });

    unescape = (string) => {
        return string.replace(/&#39;/g, '\'');
    }

    randomNumber = (min = 1, max = 1) => {
        return true;
    }

    sendEmbeddedMessage = (channelID, args = {}) => {
        args.color = args.color || 3171297;
        const channel = this.client.channels.cache.get(channelID);
        channel.send({embed: args});
    }

    sendMessage = (channelID, message) => {
        const channel = this.client.channels.cache.get(channelID);
        channel.send(message);
    }

    leaderboardHandler = (message) => {
        const channelID = message.channel.id;
        const users = Object.keys(this.userData).map((key) => {
            return {
                name: this.userData[key].name,
                fishCaught: this.userData[key].fishCaught ? this.userData[key].fishCaught : 0
            };
        });
        users.sort((first, second) => {
            return second.fishCaught - first.fishCaught;
        });
        this.sendEmbeddedMessage(channelID, {
            title: 'Best fisherman of 29E Gaming',
            fields: [
                {
                    name: '#1',
                    value: `${ users[0].name }: ${ users[0].fishCaught }`,
                },
                {
                    name: '#2',
                    value: `${ users[1].name }: ${ users[1].fishCaught }`,
                },
                {
                    name: '#3',
                    value: `${ users[2].name }: ${ users[2].fishCaught }`,
                },
            ]
        });
    }

    incrementUserAttr = (userID, userName, attrName, amount) => {
        const today = this.getFormattedDate();
        if (userID in this.userData) {
            if (attrName in this.userData[userID]) {
                this.userData[userID][attrName] = this.userData[userID][attrName] + amount;
                if (today in this.userData[userID].days) {
                    if (attrName in this.userData[userID].days[today]) {
                        this.userData[userID].days[today][attrName] = this.userData[userID].days[today][attrName] + amount;
                    } else {
                        this.userData[userID].days[today][attrName] = amount;
                    }
                } else {
                    this.userData[userID].days[today] = {
                        [attrName]: amount
                    }
                }
            } else {
                this.userData[userID][attrName] = amount;
                if (today in this.userData[userID].days) {
                    this.userData[userID].days[today][attrName] = amount;
                } else {
                    this.userData[userID].days[today] = {
                        [attrName]: amount
                    }
                }
            }
        } else {
            this.userData[userID] = {
                id: userID,
                name: userName,
                [attrName]: amount,
                days: {
                    [today]: {
                        [attrName]: amount
                    }
                }
            }
        }
        this.setData();
    }

    getFish = (message, update = false) => {
        const channelID = message.channel.id;
        if (!update) {
            if (!('name' in this.currentFish) || this.currentFish.caught) {
                this.sendEmbeddedMessage(channelID, {description: 'There aren\'t any fish around'});
            } else {
                this.sendEmbeddedMessage(channelID, {description: 'There is still a fish to catch', image: {url: this.currentFish.image}});
            }
            return;
        }
        const URL = 'https://www.generatormix.com/random-fish';
        fetch(URL).then(res => res.text())
        .then(text => {
            const dom = new jsdom.JSDOM(text);
            const output = dom.window.document.getElementById('output');
            const fish = output.getElementsByClassName('tile-block-inner')[0];
            const fishName = fish.getElementsByClassName('text-center')[0].textContent;
            const fishImage = fish.getElementsByClassName('thumbnail')[0].getAttribute('data-src');
            this.currentFish = {
                name: fishName.split(' (')[0],
                image: fishImage,
                caught: false
            }
            console.log(`Now there's a "${ fishName.split(' (')[0] }" to catch`);
            this.sendEmbeddedMessage(channelID, {image: {url: fishImage}});
        });
    }

    async catchHandler(message, args) {
        const channelID = message.channel.id;
        const guildMember = message.channel.guild.members.cache.get(message.author.id);
        const userName = guildMember.user.username;
        const userID = guildMember.user.id;
        if (this.currentFish.caught) {
            this.sendEmbeddedMessage(channelID, {description: `There aren't any fish to catch right now`});
            return;
        } 

        let quotaReached = false;
        const dailyLimit = 5;
        const today = this.getFormattedDate();
        if (userID in this.userData &&
            'days' in this.userData[userID] &&
            today in this.userData[userID].days &&
            'fishCaught' in this.userData[userID].days[today] && 
            this.userData[userID].days[today].fishCaught >= dailyLimit) {
            quotaReached = true;
        } 
        if (quotaReached) {
            this.sendEmbeddedMessage(channelID, {
                color: 0x0099ff,
                title: 'Daily Fishing Quota Exceeded',
                description: `You already reached the daily limit for fishing in New Zealand waters.
                            \nPlease refer to the attached documentation in order to ascertain the limitations surrounding specific areas in the country.
                            \nDue to these unprecedented circumstances I must henceforth remove you from the premises.
                            \nKia kaha Aotearoa`,
                url: `https://www.mpi.govt.nz/fishing-aquaculture/recreational-fishing/fishing-rules/`,
                author: {
                    name: `Jacinda Ardern (She/Her)`,
                    icon_url: `https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/New_Zealand_Prime_Minister_Jacinda_Ardern_in_2018.jpg/220px-New_Zealand_Prime_Minister_Jacinda_Ardern_in_2018.jpg`,
                    url: `https://en.wikipedia.org/wiki/Jacinda_Ardern`
                },
                timestamp: new Date(),
                footer: {
                    text: `Regards`
                }
            });
            guildMember.voice.setChannel(null);
        } else if (args.join(' ').toLowerCase() !== this.currentFish.name.toLowerCase()) {
            this.sendEmbeddedMessage(channelID, {description: `you suck`}, true);
        } else {
            this.sendEmbeddedMessage(channelID, {description: `Congratulations, ${ userName }, you just caught a ${ this.currentFish.name }!`});
            this.currentFish.caught = true;
            const voiceChannelID = message.member.voice.channel;
            if (voiceChannelID) {
                const connection = await message.member.voice.channel.join();
                const dispatcher = connection.play('./assets/mp3/jeff.mp3', {volume: 1});
                dispatcher.on('finish', () => {
                    dispatcher.destroy();
                    message.member.voice.channel.leave();
                    this.incrementUserAttr(userID, userName, 'fishCaught', 1);
                });
            } else {
                this.incrementUserAttr(userID, userName, 'fishCaught', 1);
            }
        }
    }

    getStrat = (map, side = 't', locationCount = undefined) => {
        side = 't'; // need to implement ct side strats
        const strats = [
            'Push',
            'Rush',
            'Eco',
            'Eco rush',
            'Slow push'
        ];
        const d2Locations = [
            'suicide',
            'uppers',
            'lowers',
            'mid',
            'mid doors',
            'A short',
            'A long',
            'CT spawn',
            'T spawn',
            'B doors'
        ];
        const mapTLocations = {
            'inferno': [
                'A short',
                'arches',
                'mid',
                'second mid',
                'banana'
            ],
            'mirage': [
                'palace',
                'A main',
                'CT spawn',
                'T spawn',
                'snipers',
                'ladder room',
                'unders',
                'apartments',
                'B short',
                'connector',
                'mid',
                'market'
            ],
            'dust': d2Locations,
            'dust2': d2Locations
        };
        const mapCTLocations = {};
        const mapLocations = side === 't' ? mapTLocations : mapCTLocations;
        if (!(map in mapLocations)) return 'Map name not configured';
        const locations = mapLocations[map];
        const locationMax = side === 't' ? locations.length : 5
        if (locationCount === undefined) locationCount = Math.floor(Math.random() * locationMax);
        else if (isNaN(locationCount)) locationCount = Math.floor(Math.random() * locationMax);
        else locationCount = parseInt(locationCount);
        if (locationCount > locationMax) locationCount = locationMax;
        else if (locationCount < 0) locationCount = Math.floor(Math.random() * locationMax);
        if (side === 't') {
            let message = strats[Math.floor(Math.random() * strats.length)];
            for (let i = 0; i < locationCount; i++) {
                const locationIndex = Math.floor(Math.random() * locations.length);
                const location = locations[locationIndex];
                if (i === 0) message += ` ${ location }`;
                else message += ` to ${ location }`;
                locations.splice(locationIndex, 1);
            }
            return `${ message }${ locationCount > 0 ? ' to ' : ' '}${ Math.floor(Math.random() * 2) === 1 ? 'A site' : 'B site' }`;
        }
        return '';
    }

    stratHandler = (message, args) => {
        const channelID = message.channel.id;
        const content = message.content;
        let strat = 'Please enter a map name : `dust`, `inferno`, `mirage`';
        if (args.length > 0) strat = this.getStrat(args[0].toLowerCase(), args[1]);
        this.sendEmbeddedMessage(channelID, {description: content === content.toUpperCase() ? strat.toUpperCase() : strat});
    }

    helpHandler = (message, commands) => {
        const channelID = message.channel.id;
        const userName = message.author.username;
        console.log('commands', commands);
        this.sendEmbeddedMessage(channelID, {description: `Help yourself, ${ userName }`});
    }

    yahnHandler = (message, args) => {
        const channelID = message.channel.id;
        const imageUrls = [
            'https://i.imgur.com/mpO8i9d.jpg',
            'https://i.imgur.com/DKBORzC.jpg',
            'https://i.imgur.com/JVsssHz.jpg',
            'https://i.imgur.com/kc8PceX.jpg',
            'https://i.imgur.com/L03BLaY.jpg'
        ];
        let index = 1;
        if (args.length && !isNaN(args[0])) index = parseInt(args[0]);
        if (index < 1) index = 1;
        else if (index > 5) index = 5;
        this.sendEmbeddedMessage(channelID, {image: {url: imageUrls[index - 1]}});
    }

    getUserVoiceChannel = (channels, userID) => {
        let foundChannel = undefined;
        Object.entries(channels).forEach(([id, channel]) => {
            if (foundChannel) return true;
            if (userID in channel.members) foundChannel = channel;
        });
        return foundChannel;
    }

    clearCommsHandler = (message, timeout = 0) => {
        const timeoutAmount = timeout || 1500;
        timeout = timeout || timeoutAmount;
        const voiceChannelID = message.channel.guild.members.cache.get(message.author.id).voice;
        if (!voiceChannelID) return;
        message.channel.guild.members.cache.each(member => {
            setTimeout(() => {
                member.voice.setChannel(null);
            }, timeout);
            timeout += timeoutAmount;
        });
    }

    channelHandler = (message, channelMap, args) => {
        let channelID;
        for (const [id, channel] of Object.entries(channelMap)) {
            if (channel.name.toLowerCase().includes(args.join(' ').toLowerCase())) channelID = channel.id;
        }
        if (!channelID) return;
        message.channel.guild.members.cache.each(member => {
            member.voice.setChannel(channelID);
        });
        return;
    }

}

module.exports = Helpers;