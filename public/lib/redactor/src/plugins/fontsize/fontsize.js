/*jshint esversion: 6 */
Redactor.add('plugin', 'fontsize', {
    translations: {
        'en': {
            "fontsize": {
                "title": "Text size",
                "remove":  "Remove text size"
            }
        }
    },
    defaults: {
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 5C2 4.44772 2.44772 4 3 4H16C16.5523 4 17 4.44772 17 5V7C17 7.55228 16.5523 8 16 8C15.4477 8 15 7.55228 15 7V6H11V18H12C12.5523 18 13 18.4477 13 19C13 19.5523 12.5523 20 12 20H8C7.44772 20 7 19.5523 7 19C7 18.4477 7.44772 18 8 18H9V6H4V7C4 7.55228 3.55228 8 3 8C2.44772 8 2 7.55228 2 7V5ZM14 12C14 11.4477 14.4477 11 15 11H21C21.5523 11 22 11.4477 22 12V13C22 13.5523 21.5523 14 21 14C20.4477 14 20 13.5523 20 13H19V18C19.5523 18 20 18.4477 20 19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19C16 18.4477 16.4477 18 17 18V13H16C16 13.5523 15.5523 14 15 14C14.4477 14 14 13.5523 14 13V12Z"/></svg>'
    },
    init() {
        this.sizes = (this.opts.is('fontsize.items')) ? this.opts.get('fontsize.items') : ['10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '30px'];
        this.group = 'size';
        this.classes = false;
        if (this.opts.is('fontsize.classes')) {
            this.classes = true;
            this.sizes = this.opts.get('fontsize.classes');
            this.opts.set('inlineGroups.' + this.group, this.sizes);
        }
    },
    start() {
        let button = {
            title: this.lang.get('fontsize.title'),
            icon: this.opts.get('fontsize.icon'),
            position: { before: 'moreinline' },
            command: 'fontsize.popup'
        };

        this.app.toolbar.add('fontsize', button);
        this.app.context.add('fontsize', button);
    },
    popup(e, button) {
        let buttons = {};
        let selection = this.app.create('selection');
        let inlines = selection.getNodes({ type: 'inline' });
        let $node = false;

        if (inlines.length !== 0) {
            $node = this.dom(inlines[0]);
        }

        for (let i = 0; i < this.sizes.length; i++) {
            let size = this.sizes[i];
            let params = { tag: 'span', style: { 'font-size': size }};

            if (this.classes) {
                params = { tag: 'span', classname: size, group: 'size' };
            }
            let obj = {
                title: size,
                command: 'fontsize.set',
                active: this._isActive(size, $node),
                params: params
            };

            buttons[i] = obj;
        }

        // remove font family
        buttons.remove = {
            position: 'last',
            title: this.lang.get('fontsize.remove'),
            command: 'fontsize.remove'
        };


        this.app.dropdown.create('fontsize', { items: buttons });
        this.app.dropdown.open(e, button);
    },
    remove() {
        this.app.dropdown.close();

        let obj = { style: 'font-size' };
        if (this.classes) {
            obj = { classname: this.sizes.join(' ') };
        }

        this.app.inline.remove(obj);
    },
    set(params) {
        this.app.dropdown.close();
        this.app.inline.set(params);
    },

    // =private
    _isActive(value, $node) {
        if (this.classes && $node) {
            return $node.hasClass(value);
        }
        else {
            let utils = this.app.create('utils');
            let style = ($node) ? utils.cssToObject($node.attr('style')) : false;

            return (style && style['font-size'] === value);
        }
    }
});