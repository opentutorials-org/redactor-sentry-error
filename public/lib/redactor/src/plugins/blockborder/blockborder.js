/*jshint esversion: 6 */
Redactor.add('plugin', 'blockborder', {
    translations: {
        en: {
            "blockborder": {
                "border": "Border",
                "color": "Color",
                "width": "Width",
                "radius": "Radius"
            }
        }
    },
    defaults: {
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 4C7 3.44772 7.44772 3 8 3H16C16.5523 3 17 3.44772 17 4C17 4.55228 16.5523 5 16 5H8C7.44772 5 7 4.55228 7 4ZM4 7C4.55228 7 5 7.44772 5 8V16C5 16.5523 4.55228 17 4 17C3.44772 17 3 16.5523 3 16V8C3 7.44772 3.44772 7 4 7ZM20 7C20.5523 7 21 7.44772 21 8V16C21 16.5523 20.5523 17 20 17C19.4477 17 19 16.5523 19 16V8C19 7.44772 19.4477 7 20 7ZM7 20C7 19.4477 7.44772 19 8 19H16C16.5523 19 17 19.4477 17 20C17 20.5523 16.5523 21 16 21H8C7.44772 21 7 20.5523 7 20Z"/></svg>'
    },
    init() {
        this.colors = (this.opts.is('blockborder.colors')) ? this.opts.get('blockborder.colors') : this.opts.get('colors');
    },
    start() {
        let button = {
            icon: this.opts.get('blockborder.icon'),
            command: 'blockborder.popup',
            title: '## blockborder.border ##',
            position: {
                before: ['duplicate', 'trash']
            },
            blocks: {
                all: true,
                except: ['line', 'noneditable']
            }
        };

        this.app.control.add('blockborder', button);
    },
    popup(e, button) {
        let instance = this._getInstance();
        if (!instance) return;

        let $block = instance.getBlock();
        let css = instance.getStyle();
        let borderWidth = false;
        let borderColor = '';

        if (css && css.border) {
            let arr = css.border.split(' ');
            borderWidth = parseInt(arr[0]);
            borderColor = arr[2];
        }

        let data = {
            width: borderWidth,
            radius: parseInt($block.css('border-radius')),
            color: borderColor
        };

        let event = this.app.broadcast('blockborder.get');
        if (event.has('data')) {
            data = event.get('data');
        }

        let form = this.app.create('form');
        form.create({
            title: this.lang.get('blockborder.border'),
            width: '240px',
            data: data,
            setter: 'blockborder.save',
            items: {
                flex: {
                    width: { type: 'number', label: this.lang.get('blockborder.width') },
                    radius: { type: 'number', label: this.lang.get('blockborder.radius')  }
                },
                color: { type: 'color', label: this.lang.get('blockborder.color') }
            }
        });
        form.setData(data);


        this.app.dropdown.create('blockborder', { html: form.getElement() });
        this.app.dropdown.open(e, button);
    },
    save(form) {
        let instance = this._getInstance();
        if (!instance) return;

        let cleaner = this.app.create('cleaner');
        let $block = instance.getBlock();
        let data = form.getData();
        if (data.radius) {
            data.radius = (data.radius === '0') ? 0 : data.radius + 'px';
        }
        data.border = (data.width === '0') ? '' : data.width + 'px solid ' + data.color;

        let event = this.app.broadcast('blockborder.set', { data: data });
        if (event.isStopped()) return;

        instance.setStyle({ 'border-radius': data.radius, 'border': data.border });
        $block.find('img').each(function($node) {
            $node.css({ 'border-radius': data.radius });
            cleaner.cacheElementStyle($node);
        });
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