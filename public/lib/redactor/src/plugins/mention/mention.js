/*jshint esversion: 6 */
Redactor.add('plugin', 'mention', {
    translations: {
        en: {
            "mention": {
                "mention": "Mention"
            }
        }
    },
    defaults: {
        url: false,
        start: 1,
        trigger: '@'
    },
    subscribe: {
        'editor.keyup': function(event) {
            if (!this.opts.is('mention.url')) return;
            this._handle(event);
        }
    },
    start() {
        this.handleLen = this.opts.get('mention.start');
    },
    stop() {
        this._hide();
    },

    // private
    _handle(event) {
        var e = event.get('e');
        var key = e.which;
        var ctrl = e.ctrlKey || e.metaKey;
        var arrows = [37, 38, 39, 40];
        var ks = this.app.keycodes;

        if (key === ks.ESC) {
            this.app.editor.restore();
            return;
        }
        if (key === ks.DELETE || key === ks.ENTER || key === ks.SHIFT || ctrl || (arrows.indexOf(key) !== -1)) {
            return;
        }

        if (key === ks.SPACE) {
            this.handleLen = this.opts.get('mention.start');
            this._hide();
            return;
        }

        if (key === ks.BACKSPACE) {
            this.handleLen = this.handleLen - 2;
            if (this.handleLen <= this.opts.get('mention.start')) {
                this._hide();
            }
        }

        this._emit();
    },
    _emit() {
        let block = this.app.block.get();
        if (!block || !block.isEditable()) return;

        let selection = this.app.create('selection');
        let caret = this.app.create('caret');
        let trigger = this.opts.get('mention.trigger');
        let str = selection.getText('before', true, block.getBlock());
        if (!str) return;

        if (str === trigger) {
            let inline = selection.getInline();
            let $inline = this.dom(inline);
            if (inline && $inline.hasClass('rx-mention-link')) {
                this.app.editor.save();
                $inline.unwrap();
                this.app.editor.restore();
            }
        }

        let lastIndex = str.lastIndexOf(trigger);
        let partAfter = str.substring(lastIndex + 1);

        let cutStart = str;
        let replacement = '';
        let what = trigger + partAfter;
        let n = str.lastIndexOf(what);
        if (n >= 0) {
            cutStart = str.substring(0, n) + replacement + str.substring(n + what.length);
        }

        // it is the start of str, trigger has space before, past after length more than option start
        if ((cutStart === '' || cutStart.search(/\s$/) !== -1) && lastIndex !== -1 && partAfter.length >= this.opts.get('mention.start')) {
            this.handleLen = partAfter.length;
            this.handleStr = partAfter;
            this._load();
        }
    },
    _load() {
        this.ajax.post({
            url: this.opts.get('mention.url'),
            data: 'mention=' + this.handleStr,
            success: this._parse.bind(this)
        });
    },
    _parse(json) {
        if (json === '' || (Array.isArray(json) && json.length === 0)) {
            this.app.panel.close();
            return;
        }
        var data = (typeof json === 'object') ? json : JSON.parse(json);

        this._build(data);
    },
    _build(data) {

        this.data = data;
        this.$panel = this.app.panel.build(this, 'replace');

        // events
        this._stopEvents();
        this._startEvents();

        // data
        for (let [key, val] of Object.entries(data)) {
            let $item = this.dom('<div>').addClass('rx-panel-item');
            $item.html(val.item);
            $item.attr('data-key', key);
            $item.on('click', this.replace.bind(this));

            this.app.panel.getElement().append($item);
        }

        // position
        let scrollTop = this.app.page.getDoc().scrollTop();
        let selection = this.app.create('selection');
        let pos = selection.getPosition();

        this.app.panel.open({ top: (pos.bottom + scrollTop), left: pos.left });
        this.app.editor.save();
    },
    replace(e, $el) {
        e.preventDefault();
        e.stopPropagation();

        this.app.editor.restore();

        let $item = ($el) ? $el : this.dom(e.target);
        let key = $item.attr('data-key');
        let replacement = this.data[key].replacement;

        const element = this.app.create('element');
        const marker = this.app.create('marker');
        const selection = this.app.create('selection');
        const caret = this.app.create('caret');

        marker.insert('start');

        let markerNode = marker.find('start');
        if (markerNode === false) return;

        let $marker = this.dom(markerNode);
        let current = markerNode.previousSibling;

        let currentText = current.textContent;
        let re = new RegExp(this.opts.get('mention.trigger') + this.handleStr + '$');

        let $replacement = this.dom(replacement);
        const isInline = element.is($replacement, 'inline');
        if (isInline && $replacement.tag('a')) {
            $replacement.addClass('rx-mention-link');
            replacement = $replacement.outer();
        }

        let inline = selection.getInline();
        let $inline = this.dom(inline);
        if (isInline && inline && $replacement.tag() === $inline.tag()) {
            $inline.after($replacement);
            $inline.remove();
            caret.set($replacement, 'after');
        }
        else {
            currentText = currentText.replace(re, '');
            current.textContent = currentText;

            if (isInline) {
                replacement = replacement + this.opts.get('markerChar');
            }
            $marker.before(replacement);
            marker.restore();
        }

        this._hide();
        this._reset();
    },
    _reset() {
        this.handleStr = false;
        this.handleLen = this.opts.get('mention.start');
    },
    _hide(e) {
        let hidable = false;
        let key = (e && e.which);
        let ks = this.app.keycodes;

        if (!e) {
            hidable = true;
        }
        else if (e.type === 'click' || key === ks.ESC || key === ks.SPACE) {
            hidable = true;
        }

        if (hidable) {
            this._hideForce();
        }
    },
    _hideForce() {
        this.app.panel.close();
        this._reset();
        this._stopEvents();
    },
    _startEvents() {
        let name = 'click.rx-plugin-mention keydown.rx-plugin-mention';

        this.app.page.getDoc().on(name, this._hide.bind(this));
        this.app.editor.getEditor().on(name, this._hide.bind(this));
    },
    _stopEvents() {
        let name = '.rx-plugin-mention';

        this.app.page.getDoc().off(name);
        this.app.editor.getEditor().off(name);
    }
});