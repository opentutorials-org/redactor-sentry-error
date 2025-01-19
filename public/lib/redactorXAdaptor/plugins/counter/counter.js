/*jshint esversion: 6 */
Redactor.add('plugin', 'counter', {
    translations: {
        en: {
            counter: {
                words: 'words',
                chars: 'chars',
                paragraphs: 'paragraphs', // 단락 번역 추가
            },
        },
    },
    subscribe: {
        'editor.insert, editor.set, editor.empty': function () {
            this.count();
        },
    },
    loaded() {
        this.$editor = this.app.editor.getLayout();
        this.$editor.on('keyup.rx-plugin-counter paste.rx-plugin-counter', this.count.bind(this));
        this.count();
    },
    stop() {
        this.$editor?.off('.rx-plugin-counter');

        this.app.statusbar.remove('words');
        this.app.statusbar.remove('chars');
        this.app.statusbar.remove('paragraphs'); // 단락 제거 추가
    },
    count() {
        let words = 0,
            characters = 0,
            spaces = 0,
            paragraphs = 0, // 단락 수 변수 추가
            html = this.$editor?.html(),
            arrWords,
            arrSpaces,
            data = {};

        html = this._clean(html);
        if (html !== '') {
            arrWords = html.split(/\s+/);
            arrSpaces = html.match(/\s/g);

            words = arrWords ? arrWords.length : 0;
            spaces = arrSpaces ? arrSpaces.length : 0;

            characters = html.length;

            // 단락 수 계산
            const parser = new DOMParser();
            const doc = parser.parseFromString(this.$editor.html(), 'text/html');
            const pTags = doc.querySelectorAll('p');
            paragraphs = pTags.length;
        }

        // set data
        data = { paragraphs: paragraphs, words: words, characters: characters, spaces: spaces }; // 단락 추가

        // callback
        this.app.broadcast('counter', data);

        // statusbar
        this.app.statusbar.add(
            'paragraphs',
            this.lang.get('counter.paragraphs') + ': ' + data.paragraphs
        ); // 단락 추가
        this.app.statusbar.add('words', this.lang.get('counter.words') + ': ' + data.words);
        this.app.statusbar.add('chars', this.lang.get('counter.chars') + ': ' + data.characters);
    },

    // private
    _clean(html) {
        if (typeof html !== 'string') {
            return '';
        }

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
    },
});
