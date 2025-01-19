/*jshint esversion: 6 */
Redactor.add('plugin', 'specialchars', {
    translations: {
        en: {
            "specialchars": {
                "special-chars": "Special Characters"
            }
        }
    },
    defaults: {
        context: true,
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 4.94012C10.546 4.94012 9.13606 5.4391 8.00574 6.35369C6.87542 7.26827 6.09321 8.54306 5.7898 9.96503C5.48638 11.387 5.68016 12.87 6.33873 14.1663C6.99731 15.4626 8.0808 16.4936 9.40816 17.0871C9.7682 17.2481 10 17.6056 10 18V19C10 19.5523 9.55228 20 9 20H4C3.44772 20 3 19.5523 3 19C3 18.4477 3.44772 18 4 18H7.03007C5.99592 17.234 5.14598 16.2342 4.55566 15.0722C3.68965 13.3677 3.43485 11.4175 3.83383 9.54768C4.2328 7.67784 5.26138 6.00154 6.74771 4.7989C8.23403 3.59626 10.0881 2.94012 12 2.94012C13.9119 2.94012 15.766 3.59626 17.2523 4.7989C18.7386 6.00155 19.7672 7.67784 20.1662 9.54768C20.5651 11.4175 20.3103 13.3677 19.4443 15.0722C18.854 16.2342 18.0041 17.234 16.9699 18H20C20.5523 18 21 18.4477 21 19C21 19.5523 20.5523 20 20 20H15C14.4477 20 14 19.5523 14 19V18C14 17.6056 14.2318 17.2481 14.5918 17.0871C15.9192 16.4936 17.0027 15.4626 17.6613 14.1663C18.3198 12.87 18.5136 11.387 18.2102 9.96503C17.9068 8.54306 17.1246 7.26827 15.9943 6.35369C14.8639 5.4391 13.454 4.94012 12 4.94012Z"/></svg>',
        items: [
            '&lsquo;', '&rsquo;', '&ldquo;', '&rdquo;', '&ndash;', '&mdash;', '&divide;', '&hellip;', '&trade;', '&bull;',
            '&rarr;', '&asymp;', '$', '&euro;', '&cent;', '&pound;', '&yen;', '&iexcl;',
            '&curren;', '&brvbar;', '&sect;', '&uml;', '&copy;', '&ordf;', '&laquo;', '&raquo;', '&not;', '&reg;', '&macr;',
            '&deg;', '&sup1;', '&sup2;', '&sup3;', '&acute;', '&micro;', '&para;', '&middot;', '&cedil;',  '&ordm;',
            '&frac14;', '&frac12;', '&frac34;', '&iquest;', '&Agrave;', '&Aacute;', '&Acirc;', '&Atilde;', '&Auml;', '&Aring;',
            '&AElig;', '&Ccedil;', '&Egrave;', '&Eacute;', '&Ecirc;', '&Euml;', '&Igrave;', '&Iacute;', '&Icirc;', '&Iuml;',
            '&ETH;', '&Ntilde;', '&Ograve;', '&Oacute;', '&Ocirc;', '&Otilde;', '&Ouml;', '&times;', '&Oslash;', '&Ugrave;',
            '&Uacute;', '&Ucirc;', '&Uuml;', '&Yacute;', '&THORN;', '&szlig;', '&agrave;', '&aacute;', '&acirc;', '&atilde;',
            '&auml;', '&aring;', '&aelig;', '&ccedil;', '&egrave;', '&eacute;', '&ecirc;', '&euml;', '&igrave;', '&iacute;',
            '&icirc;', '&iuml;', '&eth;', '&ntilde;', '&ograve;', '&oacute;', '&ocirc;', '&otilde;', '&ouml;',
            '&oslash;', '&ugrave;', '&uacute;', '&ucirc;', '&uuml;', '&yacute;', '&thorn;', '&yuml;', '&OElig;', '&oelig;',
            '&#372;', '&#374', '&#373', '&#375;'
        ]
    },
    start() {
        let button = {
            title: '## specialchars.special-chars ##',
            icon: this.opts.get('specialchars.icon'),
            command: 'specialchars.popup',
            blocks: {
                all: 'editable'
            }
        };

        this.app.toolbar.add('specialchars', button);

        if (this.opts.is('context.context')) {
            this.app.context.add('specialchars', button);
        }
    },
    popup(e, button) {
        let items = {},
            chars = this.opts.get('specialchars.items');

        for (let i = 0; i < chars.length; i++) {
            items[i] = {
                title: chars[i],
                command: 'specialchars.insert',
                params: {
                    character: chars[i]
                }
            };
        }

        this.app.dropdown.create('specialchars', { type: 'grid', maxWidth: '328px', items: items });
        this.app.dropdown.open(e, button);
    },
    insert(params) {
        this.app.dropdown.close();

        let insertion = this.app.create('insertion');
        insertion.insertHtml(params.character, 'after');
    }
});