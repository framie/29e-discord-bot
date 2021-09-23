const ytdl = require('ytdl-core');
const yt = require('youtube-search-without-api-key');
const fs = require('fs');
const auth = require('../auth.json');
const Helpers = require('./main.js');

const { resolve } = require('path');

class Music {
    constructor(bot, helpers) {
        this.bot = bot;
        this.helpers = helpers;
        this.queue = [];
        this.connection = undefined;
        this.dispatcher = undefined;
    }

    getQueue = () => {

    }

    convertDuration = (duration) => {
        let seconds = +duration.split(':')[1];
        seconds += duration.split(':')[0] * 60;
        return seconds;
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
                const videos = await yt.search(song);
                if (videos.length) {
                    resolve({
                        title: videos[0].title,
                        url:  videos[0].url,
                        length: this.convertDuration(videos[0].duration_raw)
                    });
                }
            }
            reject('Could not find a track for that input!');
        });
    }

    stopHandler = async () => {
        // const userVoiceChannel = this.helpers.getUserVoiceChannel(user);
        // const botVoiceChannel = this.helpers.getUserVoiceChannel(this.bot.id);
        this.dispatcher && this.dispatcher.destroy();
    }

    pauseHandler = async () => {
        this.dispatcher && this.dispatcher.pause();
    }

    resumeHandler = async () => {
        this.dispatcher && this.dispatcher.resume();
    }

    playHandler = async (message, args) => {
        const channelID = message.channel.id;
        const user = message.author.username;
        const userID = message.author.id;
        return new Promise( async (resolve, reject) => {
            const userVoiceChannel = this.helpers.getUserVoiceChannel(user);
            if (!userVoiceChannel) {
                const message = 'You need to be connect to a voice channel to run this command.';
                this.helpers.sendEmbeddedMessage(channelID, {description: message});
                return false;
            }
            this.getSongInfo(args.join(' ')).then( async (songInfo) => {
                const message = `[${ this.helpers.unescape(songInfo.title) }](${ songInfo.url }) [<@${ userID }>]`;
                const connection = await userVoiceChannel.join();
                this.helpers.sendEmbeddedMessage(channelID, {description: message});
                this.dispatcher = connection.play(ytdl(songInfo.url, { filter: 'audioonly'}), {volume: 1});
                this.dispatcher.on('finish', () => {
                    this.dispatcher.destroy();
                });
            }).catch( async (err) => {
                console.log(err)
                this.helpers.sendEmbeddedMessage(channelID, {description: 'An error has occurred'});
            });
        });
    }


}

module.exports = Music;