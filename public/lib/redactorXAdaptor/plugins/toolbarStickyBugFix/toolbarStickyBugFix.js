Redactor.add("plugin", "toolbarStickyBugFix", {
    init() {},
    subscribe: {
        "editor.load": function () {
            // .rx-toolbar-container 및 .rx-toolbox-container 선택
            const toolbarContainer = document.querySelector(
                ".rx-toolbar-container"
            );
            const toolboxContainer = document.querySelector(
                ".rx-toolbox-container"
            );
            const container = document.querySelector(".rx-container");

            // 툴박스의 Y 좌표를 가져오는 함수
            function getToolboxY() {
                return 232;
            }
            function getMainScrollPaneY() {
                return document.querySelector("#mainScrollPane")?.scrollTop;
            }

            // 툴바 상태를 확인하는 함수
            function checkToolbarState() {
                const toolboxY = getToolboxY();
                const scrolledPastToolboxY = getMainScrollPaneY() > toolboxY;
                if (window.visualViewport) {
                    const isKeyboardVisible =
                        window.visualViewport.height < window.innerHeight;

                    if (scrolledPastToolboxY) {
                        toolbarContainer.style.position = "fixed";
                        toolbarContainer.style.width = `${container.offsetWidth}px`;
                        container.style.marginTop = `${toolbarContainer.offsetHeight}px`;
                        if (isKeyboardVisible) {
                            // 가상 키보드가 켜진 경우
                            toolbarContainer.style.top = `${window.visualViewport.offsetTop}px`;
                        } else {
                            // 가상 키보드가 꺼진 경우
                            toolbarContainer.style.top = "0px";
                        }
                    } else {
                        // 스크롤이 toolboxY보다 위에 있을 때 스타일 초기화
                        toolbarContainer.style.position = "";
                        toolbarContainer.style.top = "";
                        container.style.marginTop = "";
                        toolbarContainer.style.width = "";
                    }
                }
            }

            // 이벤트 핸들러 등록
            if (window.visualViewport) {
                window.visualViewport.addEventListener(
                    "resize",
                    checkToolbarState
                );
                window.visualViewport.addEventListener(
                    "scroll",
                    checkToolbarState
                );
            }
            document
                .querySelector("#mainScrollPane")
                .addEventListener("scroll", checkToolbarState);

            // 초기 상태 확인
            checkToolbarState();
        },
    },
});
