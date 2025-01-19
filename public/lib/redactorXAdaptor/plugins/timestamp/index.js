Redactor.add('plugin', 'timestamp', {
    start() {
        this.app.addbar.add('timestamp_btn', {
            title: '시간기록',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 stroke-color">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" fill="none"/>
                   </svg>`,
            command: 'timestamp.add',
        });
    },
    add(params, button) {
        const currentTime = new Date();
        const pad = (num) => num.toString().padStart(2, '0');

        const formattedTime =
            `${String(currentTime.getFullYear()).slice(-2)}-${pad(currentTime.getMonth() + 1)}-${pad(currentTime.getDate())} ` +
            `${pad(currentTime.getHours())}:${pad(currentTime.getMinutes())}:${pad(currentTime.getSeconds())}`;

        this.app.editor.insertContent({ html: `${formattedTime} &nbsp;` });

        this.app.dropdown.close();
    },
});
