const fs = require('fs');

class Theme {
    constructor(client, helpers) {
        this.client = client;
        this.helpers = helpers;
        this.admins = [
            'AuntyJacinda',
            'chiwa'
        ];
        if ('theme' in client.data) {
            if (!('currentTheme' in client.data.theme)) {
                client.data.theme.currentTheme = null;
            }
        } else {
            client.data.theme = {
                currentTheme: null
            }
        }
        this.currentTheme = client.data.theme.currentTheme;

        this.initThemeData();
    }

    setBot = (bot) => {
        this.bot = bot;
    }

    initThemeData = () => {
        const names = [];
        fs.readFile(`./assets/theme/names.txt`, 'utf8', (_, data) => {
            data.trim().split('\n').forEach(line => {
                if (line && line.trim()) names.push(line.trim().toLowerCase());
            });
            this.names = names;
            this.isLoading = names.length;
            this.getThemeData(names);
        });
    }

    getThemeData = (names = []) => {
        names.forEach(name => {
            const lines = [];
            fs.readFile(`./assets/theme/${ name }s.txt`, 'utf8', (_, data) => {
                data.trim().split('\n').forEach(line => {
                    if (line && line.trim()) lines.push(line.trim());
                });
                this[`${ name }s`] = lines.sort();
                this.isLoading -= 1;
            });
        })
    }

    processThemes = () => {
        console.log('hi');
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

    sendCommands = (userID) => {
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
                            \n For example, run \`-theme list adjective\` to list all saved adjectives`
                },
                { 
                    name: '\u200B',
                    value: '\u200B'
                },
                {
                    name: 'Add command',
                    value: `\`-theme add [Variable] [Value]\` - will add the input value to the variable
                            \n For example, run \`-theme add person chiwa\` to add chiwa to the list of people`
                },
                { 
                    name: '\u200B',
                    value: '\u200B'
                },
                {
                    name: 'Remove command',
                    value: `\`-theme remove [Variable] [Value]\` - will remove the input value from the variable
                            \n For example, run \`-theme remove verb gaming\` to remove gaming from the list of verbs`
                }
            ]
        });
    }

    dmHandler = (message) => {
        const args = message.content.toLowerCase().substring(1).split(' ').slice(1);
        const userID = message.author.id;

        if (args.length < 1) {
            this.sendCommands(userID);
            return;
        }

        const variable = this.helpers.titleCase(args[1]);
        const items = this[`${ args[1] }s`];
        const embed = {
            description: 'Invalid input, please try again.'
        }
        switch (args[0]) {
            case 'admin':
                this.sendCommands(userID);
                break;
            case 'list': 
                embed.description += ' List command format is `-theme list [Variable]`';
                if (args.length === 2 && items && items.length && args[1] !== 'name') {
                    embed.description = items.sort().join('\n');
                    embed.title = `List of all values for Variable ${ variable }`
                }
                this.helpers.sendEmbeddedDM(userID, embed);
                break;
            case 'add':
                embed.description += ' Add command format is `-theme add [Variable] [Value]`';
                if (items && items.length && args.length > 2 && args[1] !== 'name') {
                    const value = this.helpers.titleCase(args.slice(2).join(' '));
                    if (items.includes(value)) {
                        embed.description = `Variable \`${ variable }\` already contains value \`${ value }\``;
                    } else {
                        items.push(value);
                        fs.writeFileSync(`./assets/theme/${ args[1] }s.txt`, items.sort().join('\n'), 'utf8');
                        embed.description = `Successfully added value \`${ value }\` to variable \`${ variable }\``;
                        if (args[1] === 'theme') this.processThemes();
                    }
                }
                this.helpers.sendEmbeddedDM(userID, embed);
                break;
            case 'remove':
                embed.description += ' Remove command format is `-theme remove [Variable] [Value]`';
                if (items && items.length && args.length > 2 && args[1] !== 'name') {
                    const value = this.helpers.titleCase(args.slice(2).join(' '));
                    const index = items.indexOf(value);
                    if (index < 0) {
                        embed.description = `Variable \`${ variable }\` does not contain value \`${ value }\``;
                    } else {
                        items.splice(index, 1);
                        fs.writeFileSync(`./assets/theme/${ args[1] }s.txt`, items.sort().join('\n'), 'utf8');
                        embed.description = `Successfully removed value \`${ value }\` from variable \`${ variable }\``;
                        if (args[1] === 'theme') this.processThemes();
                    }
                }
                this.helpers.sendEmbeddedDM(userID, embed);
                break;
            default:
                this.helpers.sendEmbeddedDM(userID, embed);
                break;
        }
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
            this.client.data.theme.currentTheme = this.currentTheme;
            this.helpers.sendEmbeddedMessage(channelID, {description: `The current theme is \`${ this.currentTheme}\``});
        } else if (args[0] === 'admin') {
            // if (!(this.admins.includes(userName))) return;
            this.sendCommands(userID);
        }
    }
}

module.exports = Theme;