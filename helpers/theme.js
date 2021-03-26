const fs = require('fs');
const Helpers = require('./main.js');

class Theme {
    constructor(client, helpers) {
        this.client = client;
        this.helpers = helpers;
        this.currentTheme = undefined;
        this.admins = [
            'AuntyJacinda',
            'chiwa'
        ];
        this.initData();
    }

    setBot = (bot) => {
        this.bot = bot;
    }

    initData = () => {
        const names = [];
        fs.readFile(`./assets/theme/names.txt`, 'utf8', (_, data) => {
            data.trim().split('\n').forEach(line => {
                if (line && line.trim()) names.push(line.trim().toLowerCase());
            });
            this.names = names;
            this.isLoading = names.length;
            this.getData(names);
        });
    }

    getData = (names = []) => {
        names.forEach(name => {
            const lines = [];
            fs.readFile(`./assets/theme/${ name }s.txt`, 'utf8', (_, data) => {
                data.trim().split('\n').forEach(line => {
                    if (line && line.trim()) lines.push(line.trim());
                });
                this[`${ name }s`] = lines;
                this.isLoading -= 1;
            });
        })
    }

    replace = (theme, name) => {
        const toReplace = `[${ this.helpers.titleCase(name) }]`;
        let options = [];
        let option;
        while (theme.includes(toReplace)) {
            if (options.length === 0) options = JSON.parse(JSON.stringify(this[`${ name }s`]));
            console.log(options);
            options, option = this.helpers.getRand(options, true);
            console.log(option, theme, name, this[`${ name }s`]);
            theme = theme.replace(toReplace, option);
        }
        return theme;
    }

    getTheme = () => {
        let theme = this.helpers.getRand(this.themes);
        this.names.forEach(name => {
            theme = this.replace(theme, name);
        });
        return theme;
    }

    dmHandler = (message) => {
        const userID = message.author.id;
        console.log(this.names)
        this.helpers.sendEmbeddedDM(userID, {
            title: 'Theme admin panel',
            description: 'Below is some information regarding theme configuration',
            fields: [
                { 
                    name: '\u200B',
                    value: '\u200B'
                },
                {
                    name: 'Variable names',
                    value: this.names.map(name => '`' + this.helpers.titleCase(name) + '`').join(', '),
                },
                { 
                    name: '\u200B',
                    value: '\u200B'
                },
                {
                    name: 'List command',
                    value: `\`-theme list [Variable]\` - will output all saved values for a particular variable
                            \n For example, run \`-theme list Adjective\` to list all saved adjectives`
                }
            ]
        });
    }

    themeHandler = (message) => {
        const args = this.helpers.getArgs(message);
        const channelID = message.channel.id;
        const userName = message.author.username;
        const userID = message.author.id;
        if (this.isLoading) {
            this.helpers.sendEmbeddedMessage(channelID, {description: 'Themes currently loading'});
            return;
        }
        if (args.length === 0) {
            if (this.currentTheme) {
                this.helpers.sendEmbeddedMessage(channelID, {description: `The current theme is \`${ this.currentTheme}\``});
            } else {
                this.helpers.sendEmbeddedMessage(channelID, {description: 'There is no current theme. Type `-theme new` to generate a new theme'});
            }
        } else if (args[0] === 'new') {
            this.currentTheme = this.getTheme();
            this.helpers.sendEmbeddedMessage(channelID, {description: `The current theme is \`${ this.currentTheme}\``});
        } else if (args[0] === 'admin') {
            if (!(this.admins.includes(userName))) return;
            this.helpers.sendEmbeddedDM(userID, {
                title: 'Theme admin panel' 
            });
        }
    }
}

module.exports = Theme;