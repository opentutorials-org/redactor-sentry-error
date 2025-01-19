Redactor.add("plugin", "addBlockTopBottom", {
    init() {
        this.mouseY = 0;

        this.trackMousePosition = this.trackMousePosition.bind(this);
        this.addBlockTopBottom = this.addBlockTopBottom.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        window.addEventListener("mousemove", this.trackMousePosition);
        window.addEventListener("touchmove", this.trackMousePosition);
    },
    subscribe: {
        "editor.load": function () {
            const mainContainer = this.app.container.get("main").get(0);
            mainContainer.addEventListener("click", this.addBlockTopBottom);

            const editorElement = this.app.container.get("editor").get(0);
            editorElement.addEventListener("keydown", this.handleKeyDown);
            editorElement.addEventListener("keydown", this.handleKeyDown);
        },
    },
    trackMousePosition(e) {
        this.mouseY =
            e.touches && e.touches.length ? e.touches[0].clientY : e.clientY;
    },
    addBlockTopBottom() {
        try {
            const editorElement = this.app.container.get("editor").get(0);
            const { top, bottom } = editorElement.getBoundingClientRect();
            const { paddingTop, paddingBottom } =
                this.getEditorPadding(editorElement);

            this.handleTopClick(top, paddingTop);
            this.handleBottomClick(bottom, paddingBottom);
        } catch (error) {
            console.error("블록 추가 중 오류 발생:", error);
        }
    },
    getEditorPadding(editorElement) {
        const editorContent = editorElement.firstElementChild;
        const editorStyle = editorContent
            ? window.getComputedStyle(editorContent)
            : null;

        return {
            paddingTop:
                parseFloat(editorStyle?.getPropertyValue("padding-top")) || 0,
            paddingBottom:
                parseFloat(editorStyle?.getPropertyValue("padding-bottom")) ||
                0,
        };
    },
    handleTopClick(top, paddingTop) {
        if (this.mouseY >= top && this.mouseY <= top + paddingTop) {
            this.app.editor.setFocus("start");
            const instance = this.app.create("block.text");
            this.app.block.insert({ instance, position: "before" });
        }
    },
    handleBottomClick(bottom, paddingBottom) {
        if (this.mouseY < bottom && this.mouseY >= bottom - paddingBottom) {
            this.app.editor.setFocus("end");
            const instance = this.app.create("block.text");
            this.app.block.insert({ instance });
        }
    },
    handleKeyDown(e) {
        if (e.keyCode === 38) {
            const selection = this.app.create("selection");
            const range = selection.getRange();
            const selectedBlock = selection.getBlock();
            const firstBlock = this.app.blocks.get({ first: true }).get(0);
            if (selectedBlock === firstBlock) {
                if (range.startOffset === 0) {
                    const instance = this.app.create("block.text");
                    this.app.block.insert({ instance, position: "before" });
                    document
                        .querySelector("#mainScrollPane")
                        .scrollBy({ top: -40, behavior: "smooth" });
                }
            }
        }
    },
});
