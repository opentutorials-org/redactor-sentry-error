/*jshint esversion: 6 */
Redactor.add('plugin', 'imageresize', {
    translations: {
        en: {
            "imageresize": {
                "image-resize": "Image resize"
            }
        }
    },
    defaults: {
        minHeight: 10,
        minWidth: 80
    },
    subscribe: {
        'editor.blur, editor.select': function() {
            this.stop();
        },
        'image.position, image.outset, image.wrap, fullscreen.open, fullscreen.close': function() {
            this._setResizerPosition();
        },
        'block.set': function(event) {
            this._load();
        },
        'ui.close': function() {
            this._hide();
        }
    },
    stop() {
        this._remove();
        this._stopEvents();
    },
    updatePosition() {
        this._setResizerPosition();
    },

    // private
    _load() {
        let instance = this.app.block.get();

        // remove resizer
        this._remove();

        if (instance && instance.isType('image')) {
            this._build(instance);
        }
    },
    _build(instance) {
        this.$block = instance.getBlock();
        this.$image = instance.getImage();
        this.resizerWidth = 10;
        this.resizerHeight = 20;

        if (this.$block.find('#rx-image-resizer').length !== 0) {
            return;
        }

        // image position
        let position = this.$image.position();

        // create
        this.$resizer = this.dom('<span>');
        this.$resizer.attr('id', 'rx-image-resizer');
        this.$resizer.css({
            'position': 'absolute',
            'top': (this.$image.height()/2 - this.resizerHeight/2) + 'px',
            'left': (position.left + (this.$image.width() - this.resizerWidth/2)) + 'px',
            'min-width': '10px',
            'min-height': '20px',
            'background': '#046BFB',
            'border': '2px solid #fff',
            'padding': '3px 4px',
            'font-size': '12px',
            'line-height': '1',
            'border-radius': '4px',
            'color': '#fff',
            'cursor': 'ew-resize',
        });

        this._buildWidth();
        this._buildEvents();

        this.originalWidth = this.$image.width();
        this.originalHeight = this.$image.height();
        this.originalMouseX = 0;
        this.originalMouseY = 0;
        this.aspectRatio = this.originalWidth / this.originalHeight;

        this.$block.append(this.$resizer);

        // Start events
        this.$resizer.on('mousedown touchstart', this._press.bind(this));
    },
    _buildEvents() {
        this.app.scroll.getTarget().on('resize.rx-image-resize', this.updatePosition.bind(this));
    },
    _buildWidth() {
        let utils = this.app.create('utils');
        let css = utils.cssToObject(this.$image.attr('style'));
        if (css.width || css.height) {
            this._width = true;
        }
    },
    _press(e) {
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        this.originalWidth = this.$image.width();
        this.originalHeight = this.$image.height();
        this.originalMouseX = touch.clientX;
        this.originalMouseY = touch.clientY;

        this.app.event.pause();
        this.app.page.getDoc().on('mousemove.rx-image-resize touchmove.rx-image-resize', this._move.bind(this));
        this.app.page.getDoc().on('mouseup.rx-image-resize touchend.rx-image-resize', this._release.bind(this));
        this.app.broadcast('image.resize.start', { e: e, block: this.$block, image: this.$image });
    },
    _move(e) {
        const touch = e.touches ? e.touches[0] : e;
        const widthDiff = touch.clientX - this.originalMouseX;
        const contWidthMarker = this.$block.attr('data-rx-cont-width');
        const contWidth = contWidthMarker || this.$block.width();
        const isFloat = (this.$block.css('float') !== 'none');

        let newWidth = this.originalWidth + widthDiff;
        let newHeight = newWidth / this.aspectRatio;

        // Check if the new width does not exceed the maximum width of the container
        if (newWidth > contWidth && !isFloat) {
            this.$block.attr('data-rx-cont-width', contWidth);
            newWidth = contWidth; // Limit the width to the width of the container
            newHeight = newWidth / this.aspectRatio;
        }

        // minWidth
        if (newWidth <= this.defaults.minWidth) {
            newWidth = this.defaults.minWidth;
            newHeight = newWidth / this.aspectRatio;
        }

        // minHeight
        if (newHeight <= this.defaults.minHeight) {
            newHeight = this.defaults.minHeight;
            newWidth = newHeight * this.aspectRatio;
        }

        newWidth = Math.floor(newWidth);
        newHeight = Math.floor(newHeight);

        this.$image.attr({ width: newWidth, height: newHeight });
        if (this._width) {
            this.$image.css({
                'width':  `${newWidth}px`,
                'height': `${newHeight}px`
            });
        }

        // float container
        if (isFloat) {
            this.$block.css('max-width', `${newWidth}px`);
        }

        // image position
        let position = this.$image.position();

        this.$resizer.css({
            'top': `${(newHeight/2 - this.resizerHeight/2)}px`,
            'left': `${(position.left + (newWidth - this.resizerWidth/2))}px`
        });

        this.$resizer.text(newWidth + 'px');

        // Update Control position
        this.app.control.updatePosition();
    },
    _release(e) {
        let cleaner = this.app.create('cleaner');

        cleaner.cacheElementStyle(this.$image);
        cleaner.cacheElementStyle(this.$block);

        this.$block.removeAttr('data-rx-cont-width')
        this.app.page.getDoc().off('.rx-image-resize');
        this.app.block.set(this.$block);
        setTimeout(function() {
            this.app.event.run();
        }.bind(this), 10);

        this.$resizer.text('');

        // broadcast
        this.app.broadcast('image.resize.stop', { e: e, block: this.$block, image: this.$image });
    },
    _remove() {
        this._find().remove();
    },
    _hide() {
        this._find().hide();
    },
    _show() {
        this._find().show();
    },
    _find() {
        return this.app.editor.getLayout().find('#rx-image-resizer');
    },
    _stopEvents() {
        this.app.scroll.getTarget().off('.rx-image-resize');
    },
    _setResizerPosition() {
        if (!this.$image) return;

        // image position
        let position = this.$image.position();

        this.$resizer.css({
            'top': (this.$image.height()/2 - this.resizerHeight/2) + 'px',
            'left': (position.left + (this.$image.width() - this.resizerWidth/2)) + 'px'
        });
        this.$resizer.show();
    }
});