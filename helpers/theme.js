const fs = require('fs');
const Helpers = require('./main.js');

class Theme {
    constructor(bot) {
        this.bot = bot;
        this.helpers = new Helpers(bot);
        this.names = ['adjective', 'genre', 'person', 'theme', 'verb']
        this.isLoading = this.names.length;
        this.getData(this.names);
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
        const channelID = message.channel.id;
        if (this.isLoading) {
            this.helpers.sendEmbeddedMessage(channelID, {description: 'Themes currently loading'});
            return;
        }
        this.helpers.sendEmbeddedMessage(channelID, {description: this.getTheme()});
    }
}

module.exports = Theme;