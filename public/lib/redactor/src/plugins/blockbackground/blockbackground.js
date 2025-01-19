/*jshint esversion: 6 */
Redactor.add('plugin', 'blockbackground', {
    translations: {
        en: {
            "blockbackground": {
                "background-color": "Background color"
            }
        }
    },
    defaults: {
        input: true,
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.7929 3.79289C13.5109 3.07492 14.4846 2.67157 15.5 2.67157C16.5154 2.67157 17.4891 3.07492 18.2071 3.79289C18.9251 4.51086 19.3284 5.48464 19.3284 6.5C19.3284 7.51536 18.9251 8.48913 18.2071 9.2071L17.2085 10.2057C17.2081 10.2061 17.2076 10.2066 17.2071 10.2071C17.2066 10.2076 17.2061 10.2081 17.2057 10.2085L9.20854 18.2057C9.20807 18.2061 9.20759 18.2066 9.20711 18.2071C9.20663 18.2076 9.20615 18.2081 9.20567 18.2085L7.70711 19.7071C7.51957 19.8946 7.26522 20 7 20H3C2.44772 20 2 19.5523 2 19V15C2 14.7348 2.10536 14.4804 2.29289 14.2929L12.7929 3.79289ZM12.5 6.91421L5.91421 13.5L8.5 16.0858L15.0858 9.5L12.5 6.91421ZM16.5 8.08579L13.9142 5.5L14.2071 5.2071C14.55 4.86421 15.0151 4.67157 15.5 4.67157C15.9849 4.67157 16.45 4.86421 16.7929 5.2071C17.1358 5.55 17.3284 6.01507 17.3284 6.5C17.3284 6.98493 17.1358 7.44999 16.7929 7.79289L16.5 8.08579ZM7.08579 17.5L4.5 14.9142L4 15.4142V18H6.58579L7.08579 17.5ZM16.2929 14.2929C16.4804 14.1054 16.7348 14 17 14H21C21.5523 14 22 14.4477 22 15V19C22 19.5523 21.5523 20 21 20H13C12.5955 20 12.2309 19.7564 12.0761 19.3827C11.9213 19.009 12.0069 18.5789 12.2929 18.2929L16.2929 14.2929ZM20 16H17.4142L15.4142 18H20V16Z"/></svg>'
    },
    init() {
        this.colors = (this.opts.is('blockbackground.colors')) ? this.opts.get('blockbackground.colors') : this.opts.get('colors');
    },
    start() {
        let button = {
            icon: this.opts.get('blockbackground.icon'),
            command: 'blockbackground.popup',
            title: '## blockbackground.background-color ##',
            position: {
                before: ['duplicate', 'trash']
            },
            blocks: {
                all: true,
                except: ['line', 'noneditable']
            }
        };

        this.app.control.add('blockbackground', button);
    },
    popup(e, button) {
        let instance = this._getInstance();
        if (!instance) return;

        let picker = this.app.create('colorpicker');
        let utils = this.app.create('utils');
        let $block = instance.getBlock();
        let style = utils.cssToObject($block.attr('style'));

        let event = this.app.broadcast('blockbackground.get');
        if (event.has('style')) {
            style = event.get('style');
        }

        let $picker = picker.create({
            colors: this.colors,
            input: this.opts.get('blockbackground.input'),
            style: style,
            instant: true,
            name: 'background',
            set: 'blockbackground.set',
            remove: 'blockbackground.remove'
        });

        this.app.dropdown.create('blockbackground', { html: $picker });
        this.app.dropdown.open(e, button);
    },
    set(params, instant) {
        if (!instant) {
            this.app.dropdown.close();
            this.app.editor.restore();
        }

        let event = this.app.broadcast('blockbackground.set', { style: params.style });
        if (event.isStopped()) return;

        let instance = this._getInstance();
        if (!instance) return;
        instance.setStyle(params.style);
    },
    remove() {
        this.app.dropdown.close();
        this.app.editor.restore();

        let instance = this._getInstance();
        if (!instance) return;
        instance.setStyle({ 'background': '', 'background-color': '' });
    },

    // =private
    _getInstance() {
        let instance = this.app.block.get();
        if (!instance) {
            instance = this.app.blocks.get({ first: true, instances: true, except: ['line', 'noneditable'] });
        }

        return instance;
    }
});