const ytdl = require('ytdl-core');
const fs = require('fs');
const auth = require('../auth.json');
const Helpers = require('./main.js');

const { resolve } = require('path');

class Music {
    constructor(bot) {
        this.bot = bot;
        this.helpers = new Helpers(bot);
        this.queue = [];
    }

    getQueue = () => {

    }

    getSongInfo = async (song) => {
        return new Promise( async (resolve, reject) => {
            if (song.includes('https://www.youtube.com/watch?v=')) {
                const songInfo = await ytdl.getInfo(song);
                resolve({
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url
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

    playHandler = async (channelID, userID, args) => {
        return new Promise( async (resolve, reject) => {
            const userVoiceChannel = this.helpers.getUserVoiceChannel(this.bot.channels, userID);
            if (!userVoiceChannel) {
                this.helpers.sendEmbeddedMessage(channelID, 'You need to be connect to a voice channel to run this command.');
                return false;
            }
            console.log('userVoiceChannel.id', userVoiceChannel.id);
            this.getSongInfo(args.join(' ')).then( async (songInfo) => {
                const message = `[${ this.helpers.unescape(songInfo.title) }](${ songInfo.url }) [<@${ userID }>]`;
                console.log(0);
                const botVoiceChannel = this.helpers.getUserVoiceChannel(this.bot.channels, this.bot.id);
                const func1 = (error = undefined) => {
                    //Check to see if any errors happen while joining.
                    console.log(1)
                    if (error) {
                        return console.error(error);
                    }
                    console.log(2)

                    this.bot.getAudioContext(userVoiceChannel.id, (error, stream) => {
                        console.log(3)
                        if (error) {
                            return console.error(error);
                        }
                        console.log(4)

                        fs.createReadStream(ytdl(songInfo.url)).pipe(stream, {end: false});

                    })
                    this.helpers.sendEmbeddedMessage(channelID, message);
                }
                botVoiceChannel && console.log(botVoiceChannel.id, userVoiceChannel.id, botVoiceChannel.id === userVoiceChannel.id);
                if (botVoiceChannel && botVoiceChannel.id === userVoiceChannel.id) {
                    console.log('no');
                    func1();
                } else {
                    console.log('yes');
                    this.bot.joinVoiceChannel(userVoiceChannel.id, (error) => func1(error));
                }
            }).catch( async (err) => {
                this.helpers.sendEmbeddedMessage(channelID, err);
            });
        });
    }


}

module.exports = Music;