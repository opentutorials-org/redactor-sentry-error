/*jshint esversion: 6 */
Redactor.add('plugin', 'limiter', {
    defaults: {
        limit: false
    },
    subscribe: {
        'editor.before.paste': function(event) {
            if (!this.opts.is('limiter.limit')) return;
            this._handlePaste(event);
        },
        'editor.keydown': function(event) {
            if (!this.opts.is('limiter.limit')) return;
            if (this._isLimitReached(event.get('e'))) {
                event.stop();
            }
        },
        'editor.keyup': function(event) {
           this._checkLength();
        },
        'editor.insert, editor.set, editor.empty': function() {
            this._checkLength();
        }
    },
    loaded() {
        this._checkLength();
    },
    stop() {
        this.app.statusbar.remove('limiter');
    },

    // private
    _showStatusBar(num) {
        if (!this.opts.is('limiter.limit')) return;
        this.app.statusbar.add('limiter', num + '/' + this.opts.get('limiter.limit'));
    },
    _handlePaste(event) {
        let html = event.get('html');
        html = this._sanitizeHtml(html);

        let text = this._getText();
        let totalLength = html.length + text.length;
        if (totalLength >= this.opts.get('limiter.limit')) {
            event.stop();
        }
    },
    _isLimitReached(e){
        const key = e.which;
        const isCtrlPressed = e.ctrlKey || e.metaKey;
        const arrowKeys = [37, 38, 39, 40];  // Left, Up, Right, Down
        const ctrlKeys = [65, 88, 82, 116]; // A, X, R, F5
        const k = this.app.keycodes;
        const nonCharKeys = [k.BACKSPACE, k.DELETE, k.ESC, k.SHIFT];

        if (nonCharKeys.includes(key) || (isCtrlPressed && ctrlKeys.includes(key)) || arrowKeys.includes(key)) {
            return false;
        }

        return this._checkLength(e);
    },
    _checkLength(e) {
        const text = this._getText();
        this._showStatusBar(text.length);
        if (text.length >= this.opts.get('limiter.limit')) {
            if (e) e.preventDefault();
            return true;
        }
    },
    _getText() {
        let html = this.app.editor.getLayout().html();
        return this._sanitizeHtml(html);
    },
    _sanitizeHtml(html) {
        let utils = this.app.create('utils');

        html = html.replace(/<!--[\s\S]*?-->\n?/g, '');
        html = html.replace(/<\/(.*?)>/gi, ' ');
        html = html.replace(/<(.*?)>/gi, '');
        html = html.replace(/\t/gi, '');
        html = html.replace(/\n/gi, ' ');
        html = html.replace(/\r/gi, ' ');
        html = html.replace(/&nbsp;/g, '1');
        html = html.replace(/\s+/g, ' ');
        html = html.trim();
        html = utils.removeInvisibleChars(html);

        return html;
    }
});