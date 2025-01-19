/*jshint esversion: 6 */
Redactor.add('plugin', 'emoji', {
    translations: {
        en: {
            "emoji": {
                "emoji": "Emoji",
                "favorites": "Favorites",
                "smileys": "Smileys",
                "gestures": "Gestures",
                "animals": "Animals",
                "food": "Food",
                "activities": "Activities",
                "travel": "Travel"
            }
        }
    },
    defaults: {
        context: true,
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.17317 2.7612C9.38642 2.25866 10.6868 2 12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12C22 13.3132 21.7413 14.6136 21.2388 15.8268C20.7362 17.0401 19.9997 18.1425 19.0711 19.0711C18.1425 19.9997 17.0401 20.7362 15.8268 21.2388C14.6136 21.7413 13.3132 22 12 22C10.6868 22 9.38642 21.7413 8.17317 21.2388C6.95991 20.7362 5.85752 19.9997 4.92893 19.0711C4.00035 18.1425 3.26375 17.0401 2.7612 15.8268C2.25866 14.6136 2 13.3132 2 12C2 10.6868 2.25866 9.38642 2.7612 8.17317C3.26375 6.95991 4.00035 5.85752 4.92893 4.92893C5.85752 4.00035 6.95991 3.26375 8.17317 2.7612ZM12 4C10.9494 4 9.90914 4.20693 8.93853 4.60896C7.96793 5.011 7.08601 5.60028 6.34315 6.34315C5.60028 7.08601 5.011 7.96793 4.60896 8.93853C4.20693 9.90914 4 10.9494 4 12C4 13.0506 4.20693 14.0909 4.60896 15.0615C5.011 16.0321 5.60028 16.914 6.34315 17.6569C7.08601 18.3997 7.96793 18.989 8.93853 19.391C9.90914 19.7931 10.9494 20 12 20C13.0506 20 14.0909 19.7931 15.0615 19.391C16.0321 18.989 16.914 18.3997 17.6569 17.6569C18.3997 16.914 18.989 16.0321 19.391 15.0615C19.7931 14.0909 20 13.0506 20 12C20 10.9494 19.7931 9.90914 19.391 8.93853C18.989 7.96793 18.3997 7.08602 17.6569 6.34315C16.914 5.60028 16.0321 5.011 15.0615 4.60896C14.0909 4.20693 13.0506 4 12 4ZM8 10C8 9.44772 8.44772 9 9 9H9.01C9.56228 9 10.01 9.44772 10.01 10C10.01 10.5523 9.56228 11 9.01 11H9C8.44772 11 8 10.5523 8 10ZM14 10C14 9.44772 14.4477 9 15 9H15.01C15.5623 9 16.01 9.44772 16.01 10C16.01 10.5523 15.5623 11 15.01 11H15C14.4477 11 14 10.5523 14 10ZM8.80015 14.2857C9.19463 13.8992 9.82777 13.9057 10.2143 14.3001C10.4471 14.5377 10.7249 14.7265 11.0315 14.8553C11.3381 14.9841 11.6674 15.0505 12 15.0505C12.3326 15.0505 12.6619 14.9841 12.9685 14.8553C13.2751 14.7265 13.5529 14.5377 13.7857 14.3001C14.1722 13.9057 14.8054 13.8992 15.1999 14.2857C15.5943 14.6722 15.6008 15.3054 15.2143 15.6999C14.7953 16.1275 14.2952 16.4672 13.7433 16.6991C13.1913 16.931 12.5987 17.0505 12 17.0505C11.4013 17.0505 10.8087 16.931 10.2567 16.6991C9.70481 16.4672 9.2047 16.1275 8.78571 15.6999C8.3992 15.3054 8.40566 14.6722 8.80015 14.2857Z"/></svg>',
        trigger: ':',
        items: {
            favorites: {
                faceTearsJoy: '😂',
                heart: '❤️',
                rollingFloorLaughing: '🤣',
                thumbsUpSign: '👍',
                loudlyCryingFace: '😭',
                foldedHands: '🙏',
                throwingKiss: '😘',
                smilingFaceSmilingEyesThreeHearts: '🥰',
                smilingFaceHeartShapedEyes: '😍',
                partyPopper: '🎉',
                grinningFaceSmilingEyes: '😁',
                fire: '🔥',
                birthdayCake: '🎂',
                flushedFace: '😳',
                smilingFaceSunglasses: '😎',
                sparkles: '✨',
                eyes: '👀',
                rightPointingBackhand: '👉',
                hundredPointsSymbol: '💯',
                poutingFace: '😡'
            },
            smileys: {
                slightlySmilingFace: '🙂',
                smile: '😄',
                laughing: '😆',
                wink: '😉',
                heartEyes: '😍',
                tongueOut: '😛',
                blush: '😊',
                smirk: '😏',
                thinking: '🤔',
                sleepy: '😪'
            },
            gestures: {
                thumbsUp: '👍',
                thumbsDown: '👎',
                peaceSign: '✌️',
                clappingHands: '👏',
                raisingHands: '🙌',
                facepalm: '🤦',
                shrug: '🤷',
                fistBump: '👊',
                wavingHand: '👋',
                okHand: '👌'
            },
            animals: {
                dogFace: '🐶',
                catFace: '🐱',
                mouseFace: '🐭',
                hamsterFace: '🐹',
                rabbitFace: '🐰',
                bearFace: '🐻',
                pandaFace: '🐼',
                lionFace: '🦁',
                pigFace: '🐷',
                frogFace: '🐸'
            },
            food: {
                greenApple: '🍏',
                pizza: '🍕',
                hamburger: '🍔',
                fries: '🍟',
                spaghetti: '🍝',
                sushi: '🍣',
                iceCream: '🍨',
                donut: '🍩',
                cookie: '🍪',
                cake: '🍰'
            },
            activities: {
                soccerBall: '⚽',
                basketball: '🏀',
                football: '🏈',
                baseball: '⚾',
                tennis: '🎾',
                bowling: '🎳',
                golf: '🏌️‍♂️',
                fishingPole: '🎣',
                bicycle: '🚴',
                videoGame: '🎮'
            },
            travel: {
                airplane: '✈️',
                car: '🚗',
                bicycle: '🚲',
                train: '🚆',
                boat: '⛵',
                map: '🗺️',
                beachUmbrella: '🏖️',
                mountain: '⛰️',
                camping: '🏕️',
                suitcase: '🧳'
            }
        }
    },
    subscribe: {
        'editor.keyup': function(event) {
            if (!this.opts.is('emoji.trigger')) return;
            this._handle(event);
        }
    },
    start() {
        let button = {
            title: '## emoji.emoji ##',
            icon: this.opts.get('emoji.icon'),
            command: 'emoji.popup'
        };

        this.handleStr = '';
        this.handleLen = 1;

        this.app.toolbar.add('emoji', button);

        if (this.opts.is('emoji.context')) {
            this.app.context.add('emoji', button);
        }
    },
    popup(e, button) {
        let stack = this.app.create('stack');
        stack.create('emoji', { width: '372px' });
        let $modal = stack.getBody();

        this._buildEmoji($modal);

        // open
        this.app.modal.open({ name: 'emoji', stack: stack, button: button });
    },

    // =private
    _handle(event) {
        let e = event.get('e');
        let key = e.which;
        let ctrl = e.ctrlKey || e.metaKey;
        let arrows = [37, 38, 39, 40];
        let ks = this.app.keycodes;

        if (key === ks.ESC) {
            this.app.editor.restore();
            return;
        }
        if (key === ks.DELETE || key === ks.SHIFT || ctrl || (arrows.indexOf(key) !== -1)) {
            return;
        }

        if (key === ks.SPACE) {
            this.handleLen = 1;
            this._hide();
            return;
        }

        if (key === ks.BACKSPACE) {
            this.handleLen = this.handleLen - 2;
            if (this.handleLen <= 0) {
                this.handleLen = 1;
                this._hide();
            }
            else if (this.handleLen <= 1) {
                this._hide();
            }
        }

        this._emit();
    },
    _emit() {
        let selection = this.app.create('selection');
        let trigger = this.opts.get('emoji.trigger');
        let re = new RegExp('^' + trigger);
        this.handleStr = selection.getText('before', this.handleLen);
        this.handleStr2 = selection.getText('before', this.handleLen+1);

        // detect
        if (re.test(this.handleStr)) {
            if (this.handleStr2 && (this.handleStr2[0] === ' ' || this.handleStr2[0] === '' || this.handleStr2[0] === trigger)) {
                this.handleStr = this.handleStr.replace(trigger, '');
                this.handleLen++;

                if ((this.handleLen-1) > 0) {
                    this._load();
                }
            }
        }
    },
    _load() {
        this._createPanel();
        let sections = this._buildEmoji(this.$panel, this.handleStr, true);
        if (sections === 0) {
            this._hide();
        }
    },
    _createPanel() {
        this.$panel = this.app.panel.build(this, '_insertFromPanel');
        this.$panel.addClass('rx-panel-emoji').css('max-width', '372px');

        let scrollTop = this.app.page.getDoc().scrollTop();
        let selection = this.app.create('selection');
        let pos = selection.getPosition();

        this.app.panel.open({ top: (pos.bottom + scrollTop), left: pos.left });
        this.app.editor.save();
    },
    _buildEmoji($modal, filter, panel) {
        let utils = this.app.create('utils');
        let items = this.opts.get('emoji.items');
        let sections = 0;
        let type = (panel) ? 'panel' : 'emoji';

        for (let [name, section] of Object.entries(items)) {
            let $section = this.dom('<div class="rx-' + type + '-section">');
            let $title = this.dom('<div class="rx-' + type + '-title">');
            let $box = this.dom('<div class="rx-' + type + '-box">');
            let size = 0;
            let title = (this.lang.has('emoji.' + name)) ? this.lang.get('emoji.' + name) : name.charAt(0).toUpperCase() + name.slice(1);

            $title.html(title);
            $section.append($title);
            $section.append($box);

            for (let [key, value] of Object.entries(section)) {
                if (filter && filter !== '' && key.search(utils.escapeRegExp(filter)) === -1) continue;

                let $item = this.dom('<span class="rx-' + type +'-item">');
                $item.html(value);

                if (panel) {
                    $item.on('click', this._insertFromPanel.bind(this));
                }
                else {
                    $item.on('click', this._insert.bind(this));
                }

                $box.append($item);
                size++;
            }

            if (size > 0) {
                sections++;
                $modal.append($section);
            }
        }

        return sections;
    },
    _insert(e) {
        this.app.modal.close();

        e.preventDefault();
        e.stopPropagation();

        let $target = this.dom(e.target);
        let value = $target.html();

        let insertion = this.app.create('insertion');
        insertion.insertText(value, 'after');
    },
    _insertFromPanel(e, $el) {
        this.app.editor.restore();

        let $item = ($el) ? $el : this.dom(e.target);
        let replacement = $item.html();

        let trigger = this.opts.get('emoji.trigger');
        let offset = this.app.create('offset');
        let selection = this.app.create('selection');
        let current = selection.getCurrent();
        let currentText = current.textContent;
        let offsetObj = offset.get();
        let leftFix = (trigger + this.handleStr).length;
        let what = trigger + this.handleStr;
        let n = currentText.lastIndexOf(what);
        if (n >= 0) {
            currentText = currentText.substring(0, n) + replacement + currentText.substring(n + what.length);
        }

        current.textContent = currentText;

        offsetObj.start = offsetObj.start-leftFix+replacement.length;
        offsetObj.end = offsetObj.end-leftFix+replacement.length;
        offset.set(offsetObj);

        // hide
        this._hideForce();
    },
    _hide() {
        this.app.panel.close();
    },
    _hideForce() {
        this._hide();
        this.handleStr = '';
        this.handleLen = 1;
    }
});