/*jshint esversion: 6 */
Redactor.add('plugin', 'clips', {
    translations: {
        en: {
            "clips": {
                "clips": "Clips"
            }
        }
    },
    defaults: {
        context: false,
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 4C2 3.44772 2.44772 3 3 3H7C7.55228 3 8 3.44772 8 4C8 4.55228 7.55228 5 7 5H4V19H7C7.55228 19 8 19.4477 8 20C8 20.5523 7.55228 21 7 21H3C2.44772 21 2 20.5523 2 20V4ZM16 4C16 3.44772 16.4477 3 17 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H17C16.4477 21 16 20.5523 16 20C16 19.4477 16.4477 19 17 19H20V5H17C16.4477 5 16 4.55228 16 4ZM7 16C7 15.4477 7.44772 15 8 15H8.01C8.56228 15 9.01 15.4477 9.01 16C9.01 16.5523 8.56228 17 8.01 17H8C7.44772 17 7 16.5523 7 16ZM11 16C11 15.4477 11.4477 15 12 15H12.01C12.5623 15 13.01 15.4477 13.01 16C13.01 16.5523 12.5623 17 12.01 17H12C11.4477 17 11 16.5523 11 16ZM15 16C15 15.4477 15.4477 15 16 15H16.01C16.5623 15 17.01 15.4477 17.01 16C17.01 16.5523 16.5623 17 16.01 17H16C15.4477 17 15 16.5523 15 16Z"/></svg>',
        items: false
    },
    start() {
        if (!this.opts.is('clips.items')) return;

        let button = {
            title: '## clips.clips ##',
            icon: this.opts.get('clips.icon'),
            command: 'clips.popup'
        };

        this.app.toolbar.add('clips', button);

        if (this.opts.is('clips.context')) {
            this.app.context.add('clips', button);
        }
    },
    popup(e, button) {
        let items = {},
            obj = this.opts.get('clips.items');

        for (let [key, item] of Object.entries(obj)) {
            items[key] = {
                title: item.title,
                command: 'clips.insert'
            };
        }

        this.app.dropdown.create('clips', { items: items });
        this.app.dropdown.open(e, button);
    },
    insert(params, item, name) {
        this.app.dropdown.close();

        let obj = this.opts.get('clips.items'),
            insertion = this.app.create('insertion'),
            html = '';

        if (obj[name]) {
            html = obj[name].html;
            insertion.insert({ html: html });
        }
    }
});