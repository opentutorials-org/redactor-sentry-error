/*jshint esversion: 6 */
Redactor.add('plugin', 'ai', {
    translations: {
        en: {
            'ai': {
                "placeholder-image": "Describe the image you want to generate.",
                "placeholder-text": "Tell me what you want to write.",
                "send": "Send",
                "stop": "Stop",
                "discard": "Discard",
                "insert": "Insert",
                "prompt": "Prompt",
                "image-style": "Image style",
                "change-tone": "Change tone"
            }
        }
    },
    dropdowns: {
        items: {
            improve: { title: 'Improve it', command: 'ai.set', params: { prompt: 'Improve it' } },
            simplify: { title: 'Simplify it', command: 'ai.set', params: { prompt: 'Simplify it' } },
            fix: { title: 'Fix any mistakes', command: 'ai.set', params: { prompt: 'Fix any mistakes' } },
            shorten: { title: 'Make it shorter', command: 'ai.set', params: { prompt: 'Make it shorter' } },
            detailed: { title: 'Make it more detailed', command: 'ai.set', params: { prompt: 'Make it more detailed' } },
            complete: { title: 'Complete sentence', command: 'ai.set', params: { prompt: 'Complete sentence' } },
            tone: { title: 'Change tone', command: 'ai.popupTone' },
            translate: { title: 'Translate', command: 'ai.popupTranslate' }
        }
    },
    defaults: {
        tone: [
            'Academic',
            'Assertive',
            'Casual',
            'Confident',
            'Constructive',
            'Empathetic',
            'Exciting',
            'Fluent',
            'Formal',
            'Friendly',
            'Inspirational',
            'Professional'
        ],
        style: [
            '3d model',
            'Digital art',
            'Isometric',
            'Line art',
            'Photorealistic',
            'Pixel art'
        ],
        translate: [
            'Arabic',
            'Chinese',
            'English',
            'French',
            'German',
            'Greek',
            'Italian',
            'Japanese',
            'Korean',
            'Portuguese',
            'Russian',
            'Spanish',
            'Swedish',
            'Ukrainian'
        ],
        size: {
            '1792x1024': 'Landscape',
            '1024x1792': 'Portrait',
            '1024x1024': 'Square'
        },
        text: {
            stream: true
        },
        image: {
            save: false
        },
        makeit: 'Make it',
        translateto: 'Translate to',
        spinner: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_nOfF{animation:spinner_qtyZ 2s cubic-bezier(0.36,.6,.31,1) infinite}.spinner_fVhf{animation-delay:-.5s}.spinner_piVe{animation-delay:-1s}.spinner_MSNs{animation-delay:-1.5s}@keyframes spinner_qtyZ{0%{r:0}25%{r:3px;cx:4px}50%{r:3px;cx:12px}75%{r:3px;cx:20px}100%{r:0;cx:20px}}</style><circle class="spinner_nOfF" cx="4" cy="12" r="3"/><circle class="spinner_nOfF spinner_fVhf" cx="4" cy="12" r="3"/><circle class="spinner_nOfF spinner_piVe" cx="4" cy="12" r="3"/><circle class="spinner_nOfF spinner_MSNs" cx="4" cy="12" r="3"/></svg>'
    },
    observe(obj, name, toolbar) {
        if (name === 'ai-tools' && !this.opts.is('ai.text.url')) {
            return;
        }
        else if (name === 'ai-image' && !this.opts.is('ai.image.url')) {
            return;
        }

        return obj;
    },
    popup(e, button) {
        let uiState = this.app.ui.getState();
        if (uiState.type !== 'addbar') {
            this.app.dropdown.create('ai-tools', { items: this.opts.get('ai.items') || this.dropdowns.items });
            this.app.dropdown.open(e, button);
        }
        else {
            this._buildPrompt();
        }
    },
    promptImage(e, button) {
        this._buildPrompt({ image: true });
    },
    popupTone(e, button) {
        let buttons = {};
        let items = this.opts.get('ai.tone') || this.defaults.tone;
        const makeit = this.opts.get('ai.makeit') || this.defaults.makeit;

        for (let i = 0; i < items.length; i++) {
            buttons[i] = { title: items[i], command: 'ai.set', params: { prompt: makeit + ' ' + items[i] } };
        }

        this.app.dropdown.create('ai-tone', { items: buttons });
        this.app.dropdown.open(e, button);
    },
    popupTranslate(e, button) {
        let buttons = {};
        let items = this.opts.get('ai.translate') || this.defaults.translate;
        const translateto = this.opts.get('ai.translateto') || this.defaults.translateto;

        for (let i = 0; i < items.length; i++) {
            buttons[i] = { title: items[i], command: 'ai.set', params: { prompt: translateto + ' ' + items[i] } };
        }

        this.app.dropdown.create('ai-translate', { items: buttons });
        this.app.dropdown.open(e, button);
    },
    set(params, button) {
        this.promptButton = button;
        let text = this._getText();
        let html = this._getHtml();

        // spinner
        if (text !== '' && params.empty !== true) {
            this.promptButton.setIcon(this.defaults.spinner);
        }

        // empty
        if (params.empty) {
            text = '';
            html = '';
            this.promptButton.setIcon(this.defaults.spinner);
        }

        // broadcast
        let message = params.prompt;
        let event = this.app.broadcast('ai.create', { prompt: message });
        message = event.get('prompt');
        this.modifiedValue = message;

        this._setPrompt(text, html, message, params.empty);
    },
    sendPrompt(e) {
        e.preventDefault();
        e.stopPropagation();

        let apimodel = this.opts.get('ai.' + this.promptType + '.model');
        let message = this._getMessage();

        // broadcast
        let event = this.app.broadcast('ai.create', { prompt: message });
        message = event.get('prompt');
        this.modifiedValue = message;

        if (message === '') return;
        let tone = this._getTone(message);

        if (this.promptType === 'text') {
            this.conversation.push({ "role": "user", "content": message });
            if (tone) {
                this.conversation.push({ "role": "user", "content": tone });
            }
        }

        let request = {
            model: apimodel,
            stream: this.opts.get('ai.text.stream'),
            messages: this.conversation
        };

        let size = "1024x1024";
        if (this.promptType === 'image') {
            size = this.$size.val();
        }

        request = (this.promptType === 'image') ? { model: apimodel, n: 1, size: size, prompt: message } : request;

        // loading
        this.$progress.html(this.defaults.spinner);

        // send
        if (this.promptType !== 'image' && this.opts.is('ai.text.stream')) {
            this._sendStream(this.$preview, message, true);
        }
        else {
            this._sendPrompt(request, '_complete');
        }
    },
    insertPrompt(e) {
        e.preventDefault();
        e.stopPropagation();

        let insertion = this.app.create('insertion');
        let html = this.$preview.html();

        if (this.promptType === 'image') {
            const tag = this.opts.get('image.tag');
            html = `<${tag}>${html}</${tag}>`;
        }

        // broadcast
        let event = this.app.broadcast('ai.before.insert', { html: html });
        html = event.get('html');

        let $target = this.savedInstance ? this.savedInstance.getBlock() : this.$prompt;
        let position = this.savedInstance ? 'after' : 'before';
        let remove = this.savedInstance ? false : true;

        setTimeout(function() {
            this.app.block.setTool(false);
            let inserted = insertion.insert({ html: html, target: $target, position: position, remove: remove });
            this.$prompt.remove();
            this.conversation = [];

            // broadcast
            this.app.broadcast('ai.insert', { nodes: inserted });
        }.bind(this), 3);

    },
    stopPrompt(e, reply) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();

            reply = this.$preview.text();
            if (this.isEvent) {
                this.isEvent.close();
            }
        }

        this.$preview.css({ 'white-space': '' });
        this.$preview.html(this._parseReply(reply));
        this.$insert.show();
        this.$stop.hide();
        this.$generate.show();

        // broadcast
        let eventName = (e) ? 'ai.stop' : 'ai.complete';
        let prompt = this.$previewLabel.text();
        let result = (e) ? { prompt: prompt } : {  prompt: prompt, response: this._parseReply(reply) };
        this.app.broadcast(eventName, result);
    },
    closePrompt(e) {
        e.preventDefault();
        e.stopPropagation();

        this.app.block.setTool(false);
        this.$prompt.remove();
        this.conversation = [];

        if (this.isEvent) {
            this.isEvent.close();
        }

        // broadcast
        this.app.broadcast('ai.discard');
    },

    // =private

    // get
    _getTone(message) {
        let tone = this.$select.val();
        if (tone === '0' || tone === '1') {
            return false;
        }

        return `${this.opts.get('ai.makeit') || this.defaults.makeit} ${tone}`;
    },
    _getHtml() {
        let html = '';
        let instances = this.app.blocks.get({ selected: true, instances: true });
        let instance = this.app.block.get();

        if (instances.length === 0 && instance) {
            instances = [instance];
        }

        for (let i = 0; i < instances.length; i++) {
            html = html + instances[i].getOuterHtml();
        }

        return html;
    },
    _getText() {
        let text = '';
        let instances = this.app.blocks.get({ selected: true, instances: true });
        let instance = this.app.block.get();

        if (instances.length === 0 && instance) {
            instances = [instance];
        }

        // normalize
        for (let i = 0; i < instances.length; i++) {
            if (instances[i].isEditable()) {
                let type = instances[i].getType(),
                    prefix = (type === 'listitem') ? '- ' : '';

                text = text + prefix + instances[i].getPlainText() + '\n';
            }
        }

        text = text.trim();
        text = text.replace(/\n$/, '');

        return text;
    },
    _getMessage() {
        return this.$textarea.val().trim();
    },
    _getNode() {
        let node = this.app.block.create();
        let $node = node.getBlock();

        $node = this._buildNode($node, { traverse: true });

        return $node;
    },
    _getInsertedNode() {
        let $node = this.dom('<div class="rx-inserted-node" style="white-space: pre-wrap;">');

        $node.html(this.opts.get('ai.spinner'));
        $node = this._buildNode($node, { traverse: false });

        return $node;
    },

    // set
    _setPrompt(text, html, prompt, empty) {
        if (text === '' && empty !== true) return;

        this.promptType = 'text';
        this.promptText = text;
        this.promptHtml = html;

        let messages = [{ "role": "user", "content": text }, { "role": "user", "content": prompt }];
        let request = {
            model: this.opts.get('ai.' + this.promptType + '.model'),
            messages: messages
        };

        // send
        if (this.opts.is('ai.text.stream')) {
            let $node = this._getInsertedNode();
            $node.html(this.defaults.spinner);

            this.app.dropdown.close();
            this.app.context.close();

            this._sendStream($node, messages);
        }
        else {
            this._sendPrompt(request, '_insert');
        }
    },

    // send
    _sendPrompt(request, complete) {
        let data = {
            url: this.opts.get('ai.' + this.promptType + '.endpoint'),
            data: JSON.stringify(request)
        };

        const utils = this.app.create('utils');
        data = utils.extendData(data, this.opts.get('ai.' + this.promptType + '.data'));

        this.ajax.request('post', {
            url: this.opts.get('ai.' + this.promptType + '.url'),
            data: data,
            before: function(xhr) {
                let event = this.app.broadcast('ai.before.send', { xhr: xhr, data: data });
                if (event.isStopped()) {
                    return false;
                }
            }.bind(this),
            success: this[complete].bind(this),
            error: this._error.bind(this)
        });
    },
    _sendStream($node, message, preview) {
        const apimodel = this.opts.get('ai.' + this.promptType + '.model');
        const apiurl = this.opts.get('ai.' + this.promptType + '.endpoint');
        const serverurl = this.opts.get('ai.' + this.promptType + '.url');

        let request = {
            model: apimodel,
            stream: this.opts.get('ai.text.stream'),
            messages: (preview) ? this.conversation : message
        };

        let data = {
             url: apiurl,
             data: JSON.stringify(request)
        };

        const utils = this.app.create('utils');
        data = utils.extendData(data, this.opts.get('ai.' + this.promptType + '.data'));

        let responseContent = '';
        let source = this._createSource(serverurl, data);
        this.isEvent = source;
        this.currentIndex = 0;

        // win target
        let $target = this.app.scroll.getTarget();

        // node class
        $node.removeClass('rx-inserted-node-started');

        // on message
        source.addEventListener('message', function (event) {
            // hide ui
            this.app.dropdown.close();
            this.app.context.close();

            let message = event.data,
                start = message.indexOf(': ', 'data') + 2,
                data = message.slice(start, message.length);


            if (data === '[DONE]') {
                this._sendStreamDone(source, $node, responseContent, preview);
            }
            else {
                data = JSON.parse(data);
                if (data.notification) {
                    this._sendStreamDone(source, $node, data.notification, preview);
                    return;
                }

                const choices = data.choices;
                if (choices && choices.length > 0) {
                    let content = choices[0].delta.content;

                    if (content) {
                        if (!$node.hasClass('rx-inserted-node-started')) {
                            $node.html('');
                            this._sendStreamPreviewSet(preview);
                        }

                        responseContent += content;
                        this._typeCharacter($node, responseContent);

                        // Auto-scroll to the bottom as new content is added
                        if (this._isElementBottomBeyond($node.get())) {
                            $node.get().scrollIntoView(false);
                            $target.scrollTop($target.scrollTop() + 20);

                        }
                        $node.addClass('rx-inserted-node-started');
                    }
                }
            }
        }.bind(this));

        // on error
        source.addEventListener('error', function(error) {
            this._error(error);
            source.close();
            this.isEvent = false;
        }.bind(this));
    },
    _sendStreamDone(source, $node, responseContent, preview) {
        if (!preview) {
            this._insertAfterNode($node, responseContent);
        }
        else {
            let checkInterval = setInterval(function() {
                if (this.currentIndex === responseContent.length) {
                    clearInterval(checkInterval);
                    this.stopPrompt(false, responseContent);
                    this.conversation.push({ "role": "assistant", "content": responseContent });
                }

            }.bind(this), 100);
        }

        source.close();
        this.isEvent = false;
    },
    _sendStreamPreviewSet(preview) {
        if (!preview) return;

        let value = this.modifiedValue || this.$textarea.val();
        this.$progress.html('');
        this.$previewLabel.html(this._sanitize(value));
        this.$textarea.val('');
        this.$preview.html('');
        this.$preview.css({ 'white-space': 'pre-wrap' });
        this.$generate.hide();
        this.$stop.show();
    },

    // build
    _buildNode($node, traverse) {
        let $last;

        this.instance = false;
        if (this.app.blocks.is()) {
            if (!this.app.editor.isSelectAll()) {
                $last = this.app.blocks.get({ first: true, selected: true });
                $last = $last.closest('[data-rx-first-level]');
                $last.before($node);
            }

            let isAll = this.app.editor.isSelectAll();
            $last = this.app.blocks.removeAll();
            if (isAll) {
                $node = $last;
            }
        }
        else {
            this.instance = this.app.block.get();
            if (!this.instance) {
                this.instance = this.app.block.create();
                let $first = this.app.blocks.get({ first: true });
                $first.before(this.instance.getBlock());
            }

            if (this.instance.isType('listitem')) {
                this.instance.getBlock().html('').append($node);
            }
            else if (this.instance.isType('todoitem')) {
                this.instance.getContentItem().html('').append($node);
            }
            else {
                this.instance.getBlock().before($node);
                this.instance.remove(traverse);
            }
        }

        return $node;
    },
    _buildPrompt(params) {
        this.savedInstance = false;
        this.conversation = [];
        this.$prompt = this._createPrompt(params);
        this.$textarea.on('input focus', function() {
            this.app.block.setTool('ai');
        }.bind(this));

        let instance = this.app.block.get();
        let isMultiple = this.app.blocks.is();

        // hide ui
        this.app.dropdown.close();
        this.app.context.close();

        if (instance || isMultiple) {
            if (isMultiple) {
                instance = this.app.blocks.get({ last: true, selected: true, instances: true });
            }

            // find parent
            const types = ['layout', 'table', 'quote', 'list', 'todo', 'image', 'embed']
            let $parent = instance.getBlock().closest('[data-rx-type=' + types.join('],[data-rx-type=') + ']');
            let $column = instance.getBlock().closest('[data-rx-type=column]');
            if ($parent.length !== 0) {
                if ($column.length !== 0) {
                    this.savedInstance = instance;
                }
                instance = $parent.dataget('instance');
            }

            // insert ai form
            this._insertPrompt(this.$prompt, instance);

            if (isMultiple) {
                this.app.blocks.unset();
            }
        }
        else {
            this._insertPrompt(this.$prompt);
        }

        // adjust height
        this.app.editor.adjustHeight();
    },

    // error
    _error(error, response) {
        let $node = this.app.editor.getEditor().find('.rx-inserted-node');
        if ($node.length !== 0) {
            // hide ui
            this.app.dropdown.close();
            this.app.context.close();

            let insertion = this.app.create('insertion');
            insertion.insert({ target: $node, remove: true, caret: 'end', html: this.promptHtml });
        }

        // hide loading
        if (this.$progress) {
            this.$progress.fadeOut(500, function() {
                this.$progress.html('').removeAttr('style');
            }.bind(this));

        }

        // broadcast
        this.app.broadcast('ai.error', error ? error : response);
    },

    // complete
    _insert(response) {
        this.promptButton.setIcon('');

        // error
        if (response.error) return this._error(response.error.message, response);
        if (!response.choices) return this._error(response);

        let reply = response.choices[0].message.content;
        let html = this._parseReply(reply);
        let insertion = this.app.create('insertion');

        // broadcast
        let event = this.app.broadcast('ai.before.insert', { html: html });
        html = event.get('html');

        // hide ui
        this.app.dropdown.close();
        this.app.context.close();

        let inserted;
        let instanceType = (this.instance && this.instance.isType(['listitem', 'todoitem']));
        if (instanceType) {
            this.instance.setContent(reply);
            inserted = this.instance.getBlock();
        }
        else {
            let $node = this._getNode();
            this.app.block.set($node);
            inserted = insertion.insert({  html: html, caret: 'end' });

        }

        this.app.broadcast('ai.insert', { nodes: inserted });
    },
    _complete(response) {
        let reply;
        let html;
        let imageUrl;
        let value = this.modifiedValue || this.$textarea.val();
        let result;

        this.$progress.html('');
        this.$previewLabel.html('');

        // error
        if (response.error) return this._error(response.error.message, response);
        if (response.notification) {
            this.$preview.html(response.notification + '<br>');
            return;
        }

        // current prompt
        this.$previewLabel.html(this._sanitize(value));
        this.$textarea.val('');
        this.$textarea.focus();

        // complete
        if (this.promptType === 'text') {
            if (!response.choices) return this._error(response);

            reply = response.choices[0].message.content;
            this.conversation.push({ role: "assistant", content: reply });
            html = this._parseReply(reply);

            result = html;
            this.$preview.html(html);
            this.$insert.show();

            // broadcast
            let prompt = this.$previewLabel.text();
            this.app.broadcast('ai.complete', { prompt: prompt, response: result });

            // adjust height
            this.app.editor.adjustHeight();
        }
        else if (this.promptType === 'image') {
            if (!response.data) return this._error(response);

            imageUrl = response.data[0].url;
            //html = response.data[0].revised_prompt;

            const saveUrl = this.opts.get('ai.image.save');
            if (saveUrl) {
                const utils = this.app.create('utils');
                let data = {
                    url: imageUrl
                };
                data = utils.extendData(data, this.opts.get('ai.' + this.promptType + '.data'));

                // save request
                this.ajax.request('post', {
                    url: saveUrl,
                    data: data,
                    before: function(xhr) {
                        let event = this.app.broadcast('ai.before.save', { xhr: xhr, data: data });
                        if (event.isStopped()) {
                            return false;
                        }
                    }.bind(this),
                    success: function(response) {
                        this.app.broadcast('ai.save', response);
                        this._completeImage(response.filename);
                    }.bind(this),
                    error: this._error.bind(this)
                });
            }
            else {
                this._completeImage(imageUrl);
            }

        }
    },
    _completeImage(imageUrl) {
        let $image = this.dom('<img>').attr('src', imageUrl);
        let result = $image.get().outerHTML;
        this.$preview.html($image);
        this.$insert.show();

        // broadcast
        let prompt = this.$previewLabel.text();
        this.app.broadcast('ai.complete', { prompt: prompt, response: result });

        // adjust height
        this.app.editor.adjustHeight();
    },

    // parse
    _parseReply(reply) {
        let utils = this.app.create('utils');
        let cleaner = this.app.create('cleaner');

        let text = utils.parseMarkdown(reply);
        text = cleaner.store(text, 'lists');
        text = cleaner.store(text, 'headings');
        text = cleaner.store(text, 'images');
        text = cleaner.store(text, 'links');

        text = this._parseMarkdown(text);
        text = cleaner.restore(text, 'lists');
        text = cleaner.restore(text, 'headings');
        text = cleaner.restore(text, 'images');
        text = cleaner.restore(text, 'links');

        // clean up
        text = text.replace(/<p><(ul|ol)>/g, '<$1>');
        text = text.replace(/<\/(ul|ol)><\/p>/g, '</$1>');
        text = text.replace(/<p><\/p>/g, '');

        return text;
    },

    // create
    _createPrompt(params) {
        params = Redactor.extend(true, {}, { image: false }, params);

        // type
        this.promptType = (params.image) ? 'image' : 'text';

        let placeholder = this.lang.get('ai.placeholder-' + this.promptType);
        let $editor = this.app.editor.getEditor();
        $editor.find('.rx-ai-main').remove();

        let $main = this.dom('<div class="rx-in-tool rx-ai-main">').attr({ 'contenteditable': false });
        let $body = this.dom('<div class="rx-ai-body">');
        let $footer = this.dom('<div class="rx-ai-footer">');
        let $buttons = this.dom('<div class="rx-ai-buttons">');

        this.$progress = this.dom('<div class="rx-ai-progress">');
        this.$previewLabel = this.dom('<div class="rx-ai-preview-label">');
        this.$preview = this.dom('<div class="rx-ai-preview">');
        this.$prompt = this.dom('<div class="rx-ai-prompt">');
        this.$label = this.dom('<label class="rx-ai-label">').html(this.lang.get('ai.prompt'));
        this.$textarea = this.dom('<textarea class="rx-ai-textarea rx-form-textarea">').attr({ 'placeholder': placeholder });
        this.$select = this.dom('<select class="rx-ai-select rx-form-select">');
        this.$size = this.dom('<select class="rx-ai-size rx-form-select">');

        // footer
        this._createPromptFooter($footer, $buttons);

        this.$prompt.append(this.$label);
        this.$prompt.append(this.$textarea);

        $body.append(this.$progress);
        $body.append(this.$previewLabel);
        $body.append(this.$preview);
        $body.append(this.$prompt);

        $main.append($body);
        $main.append($footer);

        return $main;
    },
    _createPromptFooter($footer, $buttons) {

        this._createTone(this.$select);
        this._createSize(this.$size);
        this._createPromptButtons($buttons);

        $footer.append(this.$select);
        if (this.promptType === 'image') {
            $footer.append(this.$size);
        }
        $footer.append($buttons);
    },
    _createPromptButton(label) {
        return this.dom('<button class="rx-ai-button rx-form-button">').html(label);
    },
    _createSize($size) {
        let items = this.opts.get('ai.size');
        for (let [key, name] of Object.entries(items)) {
            let $option = this.dom('<option>').val(key).html(name);
            $size.append($option);
        }
    },
    _createTone($select) {
        let items = (this.promptType === 'image') ? this.opts.get('ai.style') || this.defaults.style : this.opts.get('ai.tone') || this.defaults.tone;
        let name = (this.promptType === 'image') ? this.lang.get('ai.image-style') : this.lang.get('ai.change-tone');
        let $option = this.dom('<option>').val(0).html(name);
        $select.append($option);

        $option = this.dom('<option>').val(1).html('---');
        $select.append($option);

        for (let i = 0; i < items.length; i++) {
            name = this.lang.parse(items[i]);
            $option = this.dom('<option>').val(name).html(name);
            $select.append($option);
        }
    },
    _createPromptButtons($buttons) {
        this.$generate = this._createPromptButton(this.lang.get('ai.send')).addClass('rx-form-button-primary').on('click.rx-ai', this.sendPrompt.bind(this));
        this.$stop = this._createPromptButton(this.lang.get('ai.stop')).addClass('rx-form-button-primary').on('click.rx-ai', this.stopPrompt.bind(this)).hide();
        this.$discard = this._createPromptButton(this.lang.get('ai.discard')).addClass('rx-form-button-danger').on('click.rx-ai', this.closePrompt.bind(this));
        this.$insert = this._createPromptButton(this.lang.get('ai.insert')).on('click.rx-ai', this.insertPrompt.bind(this)).hide();


        $buttons.append(this.$discard);
        $buttons.append(this.$insert);
        $buttons.append(this.$stop);
        $buttons.append(this.$generate);
    },
    _createSource(url, data) {
        const eventTarget = new EventTarget();

        let ajax = this.ajax.post({
            url: url,
            data: data,
            before: function(xhr) {
                let event = this.app.broadcast('ai.before.send', { xhr: xhr, data: data });
                if (event.isStopped()) {
                    return false;
                }
            }.bind(this)
        });
        let xhr = ajax.xhr;
        let that = this;

        var ongoing = false, start = 0;
        xhr.onprogress = function() {
            if (!ongoing) {
                ongoing = true;
                eventTarget.dispatchEvent(new Event('open', {
                    status: xhr.status,
                    headers: xhr.getAllResponseHeaders(),
                    url: xhr.responseUrl,
                }));
            }

            let i, chunk;

            // error
            if (that._isJsonString(xhr.responseText)) {
                let response = JSON.parse(xhr.responseText);
                if (response.error) {
                    that._error(response.error.message, response);
                    eventTarget.close();
                    return;
                }
            }

            // chunk
            while ((i = xhr.responseText.indexOf('\n\n', start)) >= 0) {
                chunk = xhr.responseText.slice(start, i);

                start = i + 2;
                if (chunk.length) {
                    eventTarget.dispatchEvent(new MessageEvent('message', {data: chunk}));
                }
            }
        };

        // close func
        eventTarget.close = function() {
            xhr.abort();
        };

        return eventTarget;
    },

    // is
    _isElementBottomBeyond(element) {
        let $target = this.app.scroll.getTarget(),
            rect = element.getBoundingClientRect(),
            elementBottom = rect.top + rect.height;

        return elementBottom > $target.get().innerHeight;
    },
    _isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },

    // insert
    _insertAfterNode($tmp, content) {
        let inserted;
        let instanceType = (this.instance && this.instance.isType(['listitem', 'todoitem']));
        // broadcast
        let event = this.app.broadcast('ai.before.insert', { html: content });
        content = event.get('html');

        if (instanceType) {
            this.instance.setContent(content);
            inserted = this.instance.getBlock();
        }
        else {
            let insertion = this.app.create('insertion');
            let node = this.app.block.create();
            let $node = node.getBlock();

            // parse
            content = this._parseReply(content);

            $tmp.after($node);
            $tmp.remove();
            this.app.block.set($node);
            inserted = insertion.insert({ html: content, caret: 'end' });
        }

        // broadcast
        this.app.broadcast('ai.insert', { nodes: inserted });
    },
    _insertPrompt($prompt, current, params) {
        let elm = this.app.create('element');
        let position = 'after';

        // position
        if (!current) {
            if (this.opts.get('addPosition') === 'top') {
                current = this.app.blocks.get({ first: true, instances: true });
                position = 'before';
            }
            else {
                current = this.app.blocks.get({ last: true, instances: true });
                position = 'after';
            }
        }

        // insert
        let $current = current.getBlock();
        $current[position]($prompt);

        // scroll
        elm.scrollTo($prompt);

        // build
        this.app.observer.observeUnset();
        this.$textarea.focus();
        this.$textarea.on('input.rx-ai-autoresize keyup.rx-ai-autoreize', this._resize.bind(this));
        this.$textarea.on('keydown.rx-ai-event', this._promptKeydown.bind(this));
    },

    // other
    _promptKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendPrompt(e);
        }
    },
    _typeCharacter($node, responseContent) {
        if (this.currentIndex < responseContent.length) {
            $node.get().textContent += responseContent.charAt(this.currentIndex);
            this.currentIndex++;
            // adjust height
            this.app.editor.adjustHeight();
            setTimeout(function() {
                this._typeCharacter($node, responseContent);
            }.bind(this), 100);
        }
    },
    _resize() {
        this.$textarea.css('height', 'auto');
        this.$textarea.css('height', this.$textarea.get().scrollHeight + 'px');

        // adjust height
        this.app.editor.adjustHeight();
    },
    _sanitize(str) {
        return str.replace(/[&<>"']/g, char => {
            switch (char) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case "'": return '&#39;';
            }
        });
    },
    _parseMarkdown(markdown) {
        let inCodeBlock = false;
        let result = '';
        const lines = markdown.split('\n');
        const tags = this.opts.get('replaceTags');

        // code parsing
        for (const line of lines) {
            if (line.startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                result += inCodeBlock ? this._replaceCodeLine(line) : '</code></pre>';
            }
            else if (line.startsWith('####_')) {
                result += line;
            }
            else {
                result += inCodeBlock ? this._escapeHtml(line) + '\n' : `<p>${this._escapeHtml(line)}</p>`;
            }
        }

        // bold/italic parsing
        let bTag = (tags.b) ? tags.b : 'b';
        let iTag = (tags.i) ? tags.i : 'i';

        result = result.replace(/\*\*\_(.*?)\_\*\*/g, '<' + bTag + '><' + iTag + '>$1</' + iTag + '></' + bTag + '>');
        result = result.replace(/\*\*(.*?)\*\*/g, '<' + bTag + '>$1</' + bTag + '>');
        result = result.replace(/\*(.*?)\*/g, '<' + iTag + '>$1</' + iTag + '>');

        return result;
    },
    _replaceCodeLine(line) {
        return line.replace(/\`\`\`(([^\s]+))?/gm, function(match, p1, p2) {
            let classAttribute = p2 ? ' class="' + p2 + '"' : '';
            return '<pre' + classAttribute + '><code>';
        });
    },
    _escapeHtml(text) {
        const htmlEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };

        return text.replace(/[&<>"']/g, (match) => htmlEntities[match]);
    }
});