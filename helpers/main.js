const XMLHttpRequest = require('xhr2')
const Discord = require('discord.js');

class Helpers {
    constructor(client) {
        this.client = client;
    }

    AJAX = (method, url, params = {}, cb = undefined, async = false) => {
        const xmlHttp = new XMLHttpRequest();
        let newUrl = url;
        for (const [key, value] of Object.entries(params)) {
            newUrl += `${ url.includes('?') ? '&' : '?' }${ key }=${ value }`;
        }
        xmlHttp.open(method, newUrl, async);
        xmlHttp.send();
        if (cb && typeof cb === 'function') cb(JSON.parse(xmlHttp.responseText));
        return JSON.parse(xmlHttp.responseText);
    }

    unescape = (string) => {
        return string.replace(/&#39;/g, '\'');
    }

    randomNumber = (min = 1, max = 1) => {
        return true;
    }

    sendEmbeddedMessage = (channelID, args = {}) => {
        args.colour = args.colour || 3171297;
        const channel = this.client.channels.cache.get(channelID);
        const message = new Discord.MessageEmbed();
        args.colour && message.setColor(args.colour);
        args.description && message.setDescription(args.description);
        args.image && message.setImage(args.image);
        channel.send(message);
    }

    sendMessage = (channelID, message) => {
        const channel = this.client.channels.cache.get(channelID);
        channel.send(message);
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

    stratHandler = (channelID, message, args) => {
        let strat = 'Please enter a map name : `dust`, `inferno`, `mirage`';
        if (args.length > 0) strat = this.getStrat(args[0].toLowerCase(), args[1]);
        this.sendEmbeddedMessage(channelID, {description: message === message.toUpperCase() ? strat.toUpperCase() : strat});
    }

    helpHandler = (channelID, user, commands) => {
        console.log('commands', commands);
        this.sendEmbeddedMessage(channelID, {description: `Fuck off go help yourself, ${ user }`});
    }

    ollysAssHandler = (channelID, message, userID) => {
        if (message.toLowerCase() === '-put it in my ass') {
            if (userID === '319733281476313088') {
                this.sendEmbeddedMessage(channelID, {description: 'Anything for you, Olly :wink:'});
            } else {
                this.sendEmbeddedMessage(channelID, {description: 'Sorry but that\'s for Olly only :triumph:'});
            }
        } else if (message.toLowerCase() === '-put it in ollys ass' || message.toLowerCase() === '-put it in olly\'s ass') {
            this.sendEmbeddedMessage(channelID, {description: 'I can definitely do that :wink:'});
        }
    }

    yahnHandler = (channelID, args) => {
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
        this.sendEmbeddedMessage(channelID, {image: imageUrls[index - 1]});
    }

    getUserVoiceChannel = (channels, userID) => {
        let foundChannel = undefined;
        Object.entries(channels).forEach(([id, channel]) => {
            if (foundChannel) return true;
            if (userID in channel.members) foundChannel = channel;
        });
        console.log('foundChannel', foundChannel);
        return foundChannel;
    }

}

module.exports = Helpers;