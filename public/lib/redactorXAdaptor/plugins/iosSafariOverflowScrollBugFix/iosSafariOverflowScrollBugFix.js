Redactor.add("plugin", "iosSafariOverflowScrollBugFix", {
    init() {},
    subscribe: {
        "editor.load": function () {
            return;
            // iPhone Safari 감지 (WebView 제외)
            const isIPhoneSafari =
                /iPhone/.test(navigator.userAgent) && // iPhone 감지
                /Safari/.test(navigator.userAgent) && // Safari 감지
                !/CriOS/.test(navigator.userAgent) && // iOS Chrome 제외
                !/FxiOS/.test(navigator.userAgent) && // iOS Firefox 제외
                !navigator.standalone;
            if (isIPhoneSafari) {
                window.addEventListener("scroll", () => {
                    if (window.scrollY > 218) {
                        window.scrollTo(window.scrollX, 218);
                    }
                });
            }
        },
    },
});
