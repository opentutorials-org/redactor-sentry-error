/*jshint esversion: 6 */
Redactor.add('plugin', 'print', {
    translations: {
        en: {
            "print": {
                "print": "Print"
            }
        }
    },
    defaults: {
        css: false, // string or array to print css class
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.87868 2.87868C7.44129 2.31607 8.20435 2 9 2H15C15.7956 2 16.5587 2.31607 17.1213 2.87868C17.6839 3.44129 18 4.20435 18 5V8H19C19.7957 8 20.5587 8.31607 21.1213 8.87868C21.6839 9.44129 22 10.2043 22 11V15C22 15.7957 21.6839 16.5587 21.1213 17.1213C20.5587 17.6839 19.7957 18 19 18H18V19C18 19.7957 17.6839 20.5587 17.1213 21.1213C16.5587 21.6839 15.7957 22 15 22H9C8.20435 22 7.44129 21.6839 6.87868 21.1213C6.31607 20.5587 6 19.7957 6 19V18H5C4.20435 18 3.44129 17.6839 2.87868 17.1213C2.31607 16.5587 2 15.7956 2 15V11C2 10.2044 2.31607 9.44129 2.87868 8.87868C3.44129 8.31607 4.20435 8 5 8H6V5C6 4.20435 6.31607 3.44129 6.87868 2.87868ZM5 10C4.73478 10 4.48043 10.1054 4.29289 10.2929C4.10536 10.4804 4 10.7348 4 11V15C4 15.2652 4.10536 15.5196 4.29289 15.7071C4.48043 15.8946 4.73478 16 5 16H6V15C6 14.2044 6.31607 13.4413 6.87868 12.8787C7.44129 12.3161 8.20435 12 9 12H15C15.7957 12 16.5587 12.3161 17.1213 12.8787C17.6839 13.4413 18 14.2043 18 15V16H19C19.2652 16 19.5196 15.8946 19.7071 15.7071C19.8946 15.5196 20 15.2652 20 15V11C20 10.7348 19.8946 10.4804 19.7071 10.2929C19.5196 10.1054 19.2652 10 19 10H5ZM16 8H8V5C8 4.73478 8.10536 4.48043 8.29289 4.29289C8.48043 4.10536 8.73478 4 9 4H15C15.2652 4 15.5196 4.10536 15.7071 4.29289C15.8946 4.48043 16 4.73478 16 5V8ZM16 15C16 14.7348 15.8946 14.4804 15.7071 14.2929C15.5196 14.1054 15.2652 14 15 14H9C8.73478 14 8.48043 14.1054 8.29289 14.2929C8.10536 14.4804 8 14.7348 8 15V19C8 19.2652 8.10536 19.5196 8.29289 19.7071C8.48043 19.8946 8.73478 20 9 20H15C15.2652 20 15.5196 19.8946 15.7071 19.7071C15.8946 19.5196 16 19.2652 16 19V15Z"/></svg>'
    },
    start() {
        let button = {
            title: '## print.print ##',
            icon: this.opts.get('print.icon'),
            command: 'print.print',
            position: {
                'before': 'html'
            }
        };

        this.app.toolbar.add('print', button);
    },
    print() {
        let $preview = this.app.container.get('preview');
        let $iframe = this.dom('<iframe>').hide();

        this.app.ui.close();

        $preview.html('');
        $preview.append($iframe);

        let html = this.app.editor.getContent();
        let doc = $iframe.get().contentWindow.document;
        let win = $iframe.get().contentWindow;

        // write html
        doc.open();
        doc.write(html);
        doc.close();

        if (doc.document) doc = doc.document;
        let _timer = setInterval(function() {
            if (doc.readyState == 'complete') {
                clearInterval(_timer);
                win.print();
            }
        }, 100);
    },

    // = private
    _setFrameHeight($iframe) {
        let doc = $iframe.get().contentWindow.document;
        let $body = this.dom(doc).find('body');
        let height = $body.height();
        $iframe.height(height);
    },
    _addPrintCss($iframe) {
        let $links = this.app.page.getDoc().find('head link');
        let css = this.opts.get('print.css');

        let doc = $iframe.get().contentWindow.document;
        let $head = this.dom(doc).find('head');

        if (css) {
            css = (Array.isArray(css)) ? css : [css];
            for (let i = 0; i < css.length; i++) {
                let $link = this.dom('<link rel="stylesheet">');
                $link.attr('href', css[i]);
                $head.append($link);
            }
        }
    }
});