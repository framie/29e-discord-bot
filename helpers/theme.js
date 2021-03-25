const fs = require('fs');
const Helpers = require('./main.js');

class Theme {
    constructor(client, helpers) {
        this.client = client;
        this.helpers = helpers;
        this.names = ['adjective', 'genre', 'person', 'theme', 'verb']
        this.isLoading = this.names.length + 1;
        this.getData(this.names);
        this.currentTheme;
    }

    setBot = (bot) => {
        this.bot = bot;
        this.isLoading -= 1;
    }

    getData = (names = []) => {
        names.forEach(name => {
            const lines = [];
            fs.readFile(`./assets/theme/${ name }s.txt`, 'utf8', (err, data) => {
                data.trim().split('\n').forEach(line => {
                    lines.push(line.trim());
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
            if (options.length === 0) options = this[`${ name }s`];
            options, option = this.helpers.getRand(options, true);
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

    themeHandler = (message) => {
        const args = this.helpers.getArgs(message);
        const channelID = message.channel.id;
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
        }
    }
}

module.exports = Theme;