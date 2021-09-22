const ytdl = require('ytdl-core');
const fs = require('fs');
const auth = require('../auth.json');
const Helpers = require('./main.js');

const { resolve } = require('path');

class Music {
    constructor(bot, helpers) {
        this.bot = bot;
        this.helpers = helpers;
        this.queue = [];
    }

    getQueue = () => {

    }

    getSongInfo = async (song) => {
        return new Promise( async (resolve, reject) => {
            if (song.includes('https://www.youtube.com/watch?v=')) {
                const songInfo = await ytdl.getInfo(song);
                let audioFormats = ytdl.filterFormats(songInfo.formats, 'audioonly');
                console.log('Formats with only audio: ' + audioFormats.length);
                console.log('audioFormats' + audioFormats);
                resolve({
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    length: songInfo.videoDetails.lengthSeconds
                });
            } else {
                resolve({
                    title: song,
                    url: `https://www.youtube.com/watch?v=${ song }`
                });
                return true;
                const baseUrl = `https://www.googleapis.com/youtube/v3/search?key=${ auth.google_api_key }&maxResults=1&type=video,playlist&part=snippet&safeSearch=none&regionCode=AU&q=`;
                this.helpers.AJAX('GET', `${ baseUrl }${ song }`, {}, res => {
                    const searchResults = res.items;
                    if (searchResults.length > 0) {
                        resolve({
                            title: searchResults[0].snippet.title,
                            url: `https://www.youtube.com/watch?v=${ res.items[0].id.videoId }`
                        });
                    }
                });
            }
            reject('Could not find a track for that input!');
        });
    }

    playHandler = async (message, args) => {
        console.log('playHandler() called');
        const channelID = message.channel.id;
        const user = message.author.username;
        const userID = message.author.id;
        return new Promise( async (resolve, reject) => {
            const userVoiceChannel = this.helpers.getUserVoiceChannel(this.bot.channels, user);
            if (!userVoiceChannel) {
                const message = 'You need to be connect to a voice channel to run this command.';
                this.helpers.sendEmbeddedMessage(channelID, {description: message});
                return false;
            }
            this.getSongInfo(args.join(' ')).then( async (songInfo) => {
                const message = `[${ this.helpers.unescape(songInfo.title) }](${ songInfo.url }) [<@${ userID }>]`;
                const connection = await userVoiceChannel.join();
                this.helpers.sendEmbeddedMessage(channelID, {description: message});
                const dispatcher = connection.play(ytdl(songInfo.url, { filter: 'audioonly'}), {volume: 1});
                dispatcher.on('finish', () => {
                    dispatcher.destroy();
                });
            }).catch( async (err) => {
                console.log(err)
                this.helpers.sendEmbeddedMessage(channelID, {description: 'An error has occurred'});
            });
        });
    }


}

module.exports = Music;