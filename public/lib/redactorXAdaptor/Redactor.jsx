"use client";
import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import "./Redactor.css";
import { editorRedactorLogger } from "@/debug/editor";
function t(key) {
    return key;
}
function isMobile() {
    return false;
}
function getUserType() {
    return "named";
}
const NAMED = "named";
export default function RedactorComponent(
    { open, onChange, initContent, onAppReady, pageId },
    ref
) {
    const uploaderRef = useRef(null);
    const appRef = useRef(null);
    // const openSnackbar = useSetAtom(openSnackbarState);
    // const openConfirm = useSetAtom(openConfirmState);
    // const [snackbar, setSnackbar] = useAtom(snackbarState);
    const textareaRef = useRef(null);
    // const darkMode = useAtomValue(darkModeState);
    const [isLoaded, setIsLoaded] = useState(false);
    // const t = useTranslations("editor");
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;

    editorRedactorLogger("Redactor rendering", {
        open,
        onChange,
        initContent,
        onAppReady,
        ref,
    });

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        editorRedactorLogger("컴포넌트 언마운트 시 초기화 수행");
        return () => {
            if (appRef.current) {
                editorRedactorLogger("에디터 내용 초기화");
                appRef.current.editor.setContent({ html: "" });
            }
        };
    }, [open]);

    const keyDownHandler = function (event) {
        editorRedactorLogger("keydown 이벤트 발생", event);
        if (event.params.enter) {
            const isKor = checkEndCharWithoutFinalConsonant(
                app.selection.getRange().endContainer.textContent
            );
            const noticeHistory = JSON.parse(
                localStorage.noticeHistory || "{}"
            );
            let isIOSEnterProblem =
                noticeHistory.isIOSEnterProblem === undefined
                    ? true
                    : noticeHistory.isIOSEnterProblem;
            if (isKor && isIOS() && isIOSEnterProblem) {
                // const message = <>줄바꿈에 문제가 있다면 엔터를 누르기 전에 마침표나 공백을 입력해주세요.<Button onClick={()=>{
                //   localStorage.noticeHistory= JSON.stringify({...noticeHistory, isIOSEnterProblem: false});
                //   setSnackbar({...snackbar, message, vertical:'top', horizontal:'center', open: false});
                // }}>그만보기</Button></>;
                const message = `<h1>${t("ios-enter-problem-title")}</h1>
        <p>1. <strong>${t("ios-enter-problem-step1")}</strong></p>
        <p>2. <strong>${t("ios-enter-problem-step2")}</strong></p>
        <p>${t("ios-enter-problem-description")}</p>
        <p><a href="https://youtu.be/BQ20-leF328" target="_blank">${t("ios-enter-problem-video")}</a></p>
        `;
                setTimeout(() => {
                    // openConfirm({
                    //     message,
                    //     onNo: () => {
                    //         localStorage.noticeHistory = JSON.stringify({
                    //             ...noticeHistory,
                    //             isIOSEnterProblem: false,
                    //         });
                    //     },
                    //     yesLabel: t("confirm"),
                    //     noLabel: t("dont-show-again"),
                    // });
                }, 10000);
            }
        }
    };

    useEffect(
        function initContentSet() {
            editorRedactorLogger(
                "initContent 값이 변경되었을 때 에디터 내용 설정 시도",
                initContent
            );
            if (initContent !== undefined && appRef.current) {
                editorRedactorLogger("에디터에 초기 내용 설정", initContent);
                appRef.current.editor.setContent({ html: initContent });
            }
        },
        [initContent, appRef.current]
    );

    useEffect(() => {
        editorRedactorLogger(
            "Redactor 초기화 시작",
            "initContent",
            initContent,
            "appRef.current",
            appRef.current,
            "textareaRef.current",
            textareaRef.current
        );
        if (appRef.current && textareaRef.current) return;
        let app;
        async function loadRedactorX() {
            let locale = "en";
            // if (isOnline) {
            //     locale = (await getUserLocale()) || "en";
            // } else {
            //     locale = getClientLocale() || "en";
            // }
            let userId;
            // if (getUserType() === "named") {
            // userId = await fetchUserId();
            // }
            editorRedactorLogger(
                "RedactorX 로드 함수 호출",
                "textareaRef.current",
                textareaRef.current
            );
            const Redactor = (
                await import("../../../public/lib/redactor/src/redactor.js")
            ).default;
            const dependancy = [
                import(
                    "../../../public/lib/redactor/src/plugins/imageresize/imageresize.min.js"
                ),
                import(
                    "../../../public/lib/redactor/src/plugins/fullscreen/fullscreen.min.js"
                ),
                import(
                    "../../../public/lib/redactorXAdaptor/plugins/timestamp/index.js"
                ),
                import(
                    "../../../public/lib/redactorXAdaptor/plugins/counter/counter.js"
                ),
                import(
                    "../../../public/lib/redactorXAdaptor/plugins/toolbarStickyBugFix/toolbarStickyBugFix.js"
                ),
                import(
                    "../../../public/lib/redactorXAdaptor/plugins/addBlockTopBottom/addBlockTopBottom.js"
                ),
                import(
                    "../../../public/lib/redactorXAdaptor/plugins/iosSafariOverflowScrollBugFix/iosSafariOverflowScrollBugFix.js"
                ),
            ];
            if (locale !== "en") {
                dependancy.push(
                    import(`../../../public/lib/redactor/${locale}.js`)
                );
            }
            const plugins = [
                "imageposition",
                "imageresize",
                "fullscreen",
                "ai",
                "timestamp",
                "counter",
                "addBlockTopBottom",
                // "uploadcare",
                "toolbarStickyBugFix",
                "iosSafariOverflowScrollBugFix",
            ];
            const toolbar = [
                "add",
                "ai-tools",
                "format",
                "moreinline",
                "link",
                "list",
                "bold",

                "table",
            ];
            if (process.env.NODE_ENV === "development") {
                toolbar.push("html");
            }
            const options = {
                lang: locale,
                // theme: localStorage.getItem("darkMode") ? "dark" : "light",
                plugins,
                buttons: {
                    toolbar,
                },
                popups: {
                    addbar: [
                        "ai-tools",
                        "text",
                        "heading",
                        "list",
                        "embed",
                        "table",
                        "quote",
                        "pre",
                        "line",
                        "layout",
                    ],
                    format: [
                        "text",
                        "h1",
                        "h2",
                        "h3",
                        "quote",
                        "bulletlist",
                        "numberedlist",
                    ],
                    inline: [
                        "italic",
                        "code",
                        "underline",
                        "sup",
                        "sub",
                        "highlight",
                        "removeinline",
                    ],
                },
                scrollTarget: "#mainScrollPane",

                ai: {
                    text: {
                        url: "/api/ai/editor/text",
                        endpoint: "https://api.openai.com/v1/chat/completions",
                        model: "gpt-4o",
                        stream: true,
                    },
                    items: {
                        set: true,
                        oneline: {
                            title: t("ai-oneline"),
                            command: "ai.set",
                            params: { prompt: t("ai-prompt-oneline") },
                        },
                        improve: {
                            title: t("ai-improve"),
                            command: "ai.set",
                            params: { prompt: t("ai-prompt-improve") },
                        },
                        simplify: {
                            title: t("ai-simplify"),
                            command: "ai.set",
                            params: { prompt: t("ai-prompt-simplify") },
                        },
                        fix: {
                            title: t("ai-fix"),
                            command: "ai.set",
                            params: { prompt: t("ai-prompt-fix") },
                        },
                        detailed: {
                            title: t("ai-detailed"),
                            command: "ai.set",
                            params: { prompt: t("ai-prompt-detailed") },
                        },
                        easy: {
                            title: t("ai-easy"),
                            command: "ai.set",
                            params: {
                                prompt: "원본과 같은 언어로 더 쉽게 설명",
                            },
                        },
                        spelling: {
                            title: t("ai-spelling"),
                            command: "ai.set",
                            params: {
                                prompt: "원본과 같은 언어로 내용은 유지하면서 맞춤법에 맞게 교정해줘. 설명은 필요 없어.",
                            },
                        },
                        complete: {
                            title: t("ai-complete"),
                            command: "ai.set",
                            params: { prompt: t("ai-prompt-complete") },
                        },
                        tone: { title: t("ai-tone"), command: "ai.popupTone" },
                        translate: {
                            title: t("ai-translate"),
                            command: "ai.popupTranslate",
                        },
                    },
                    tone: [
                        t("ai-tone-oneline"),
                        t("ai-tone-academic"),
                        t("ai-tone-firm"),
                        t("ai-tone-casual"),
                        t("ai-tone-confident"),
                        t("ai-tone-constructive"),
                        t("ai-tone-empathetic"),
                        t("ai-tone-exciting"),
                        t("ai-tone-fluent"),
                        t("ai-tone-formal"),
                        t("ai-tone-friendly"),
                        t("ai-tone-inspiring"),
                        t("ai-tone-professional"),
                    ],
                    translateto: t("translate-to"),
                },
                content: "",
                toolbar: {
                    sticky: false,
                },
                subscribe: {
                    "editor.keydown": keyDownHandler,
                    "editor.change": function (event) {
                        editorRedactorLogger("에디터 내용 변경 발생", event);
                        onChange(event.params.html);
                    },
                    "editor.blur": function () {
                        editorRedactorLogger(
                            "에디터 블러 발생, body 클릭 트리거"
                        );
                        document.querySelector("body").click();
                    },
                },
                topbar: true,
                extrabar: !isMobile(),
            };
            if (getUserType() === NAMED) {
                editorRedactorLogger(
                    "유저 타입이 'named'일 경우 AI 플러그인 로드"
                );
                dependancy.push(
                    import("../../../public/lib/redactor/src/plugins/ai/ai.js")
                );
                // dependancy.push(
                //     import(
                //         "../../../public/lib/redactorXAdaptor/plugins/uploadcare/uploadcare.js"
                //     )
                // );
                // plugins.push("uploadcare");
                // options["uploadcare"] = {
                //     pageId,
                // };
                options["buttons"]["toolbar"].push("uploadcareBtn");
                options["image"] = {
                    upload: function (upload, data) {
                        const MAX_FILE_SIZE_MB = 0.2; // 파일 하나의 최대 크기 (MB)
                        const MAX_TOTAL_FILES = 5; // 업로드 가능한 파일 최대 수

                        editorRedactorLogger("이미지 업로드 발생", data);

                        const files = Array.from(data.files);

                        // 파일 수 제한 확인
                        if (files.length > MAX_TOTAL_FILES) {
                            // setSnackbar({
                            //     open: true,
                            //     message: `파일 개수는 최대 ${MAX_TOTAL_FILES}개까지 업로드할 수 있습니다.`,
                            //     vertical: "bottom",
                            //     horizontal: "left",
                            //     autoHideDuration: 3000,
                            // });
                            return;
                        }

                        // 파일 용량 제한 확인
                        const oversizedFiles = files.filter(
                            (file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024
                        );
                        if (oversizedFiles.length > 0) {
                            // setSnackbar({
                            //     open: true,
                            //     message: `파일 크기는 ${MAX_FILE_SIZE_MB}MB를 초과할 수 없습니다.`,
                            //     vertical: "bottom",
                            //     horizontal: "left",
                            //     autoHideDuration: 3000,
                            // });
                            return;
                        }

                        // setSnackbar({
                        //     open: true,
                        //     message: "업로드 중...",
                        //     vertical: "bottom",
                        //     horizontal: "left",
                        // });

                        const maxConcurrency = 10;
                        const results = new Array(files.length); // 업로드 결과를 저장할 배열
                        let currentIndex = 0;

                        // 업로드 함수 정의
                        const uploadNext = () => {
                            if (currentIndex >= files.length)
                                return Promise.resolve();
                            const index = currentIndex;
                            const file = files[currentIndex++];

                            const fileFormData = new FormData();
                            fileFormData.append(
                                "UPLOADCARE_PUB_KEY",
                                process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY
                            );
                            fileFormData.append("UPLOADCARE_STORE", "auto");
                            fileFormData.append("file", file);
                            fileFormData.append("metadata[pageId]", pageId);
                            fileFormData.append("metadata[userId]", userId);

                            return fetch(
                                "https://upload.uploadcare.com/base/",
                                {
                                    method: "POST",
                                    body: fileFormData,
                                }
                            )
                                .then((response) => {
                                    if (!response.ok) {
                                        throw new Error(
                                            `Server error: ${response.status}`
                                        );
                                    }
                                    return response.json();
                                })
                                .then((result) => {
                                    results[index] = {
                                        success: true,
                                        data: {
                                            file: {
                                                url: `https://ucarecdn.com/${result.file}/-/preview/720x720/`,
                                                id: result.file,
                                            },
                                        },
                                    };
                                })
                                .catch((error) => {
                                    console.error("Error:", error);
                                    results[index] = {
                                        success: false,
                                        error,
                                    };
                                })
                                .then(() => {
                                    // 다음 업로드 시작
                                    return uploadNext();
                                });
                        };

                        // 초기 동시 업로드 시작
                        const initialUploads = [];
                        for (
                            let i = 0;
                            i < Math.min(maxConcurrency, files.length);
                            i++
                        ) {
                            initialUploads.push(uploadNext());
                        }

                        Promise.all(initialUploads).then(() => {
                            const successfulUploads = results
                                .filter((result) => result && result.success)
                                .map((result) => result.data);

                            const failedUploads = results.filter(
                                (result) => result && !result.success
                            );

                            if (failedUploads.length > 0) {
                                // openConfirm({
                                //     message: `${failedUploads.length}개의 이미지 업로드에 실패하였습니다.`,
                                //     onNo: () => {},
                                //     onYes: () => {},
                                //     noLabel: "취소",
                                //     yesLabel: "확인",
                                // });
                            } else {
                                // setSnackbar({
                                //     open: true,
                                //     message: "모든 이미지 업로드 완료",
                                //     vertical: "bottom",
                                //     horizontal: "left",
                                //     autoHideDuration: 1000,
                                // });
                            }

                            editorRedactorLogger(
                                "모든 파일 업로드 완료",
                                successfulUploads
                            );

                            // 업로드 결과를 순서대로 처리
                            successfulUploads.forEach((response) => {
                                upload.complete(response, data.e);
                            });
                        });
                    },
                };
            }
            await Promise.all(dependancy);

            app = Redactor(textareaRef.current, options);
            window.app = app;
            appRef.current = app;
            editorRedactorLogger("RedactorX 초기화 완료", app);
            onAppReady(app);
        }
        loadRedactorX();
        return () => {
            editorRedactorLogger("RedactorX 언마운트 시작");
            if (appRef.current) {
                editorRedactorLogger("RedactorX 인스턴스 파괴");
                appRef.current.destroy();
                window.dispatchEvent(new Event("resize"));
            }
        };
    }, []);

    useEffect(() => {
        // editorRedactorLogger("Supabase 클라이언트 생성", supabase);
    }, []);

    // useEffect(() => {
    //     editorRedactorLogger("다크 모드 설정 변경", darkMode);
    //     if (appRef.current) {
    //         appRef.current.theme.set(darkMode ? "dark" : "light");
    //     }
    // }, [open, appRef.current, darkMode]);

    useEffect(() => {
        const images = document.querySelectorAll("img");
        if (images) {
            const handleError = (e) => {
                e.currentTarget.alt = "이미지는 온라인에서만 보여집니다.";
            };
            images.forEach((img) => img.addEventListener("error", handleError));

            // Cleanup event listener on component unmount
            return () => {
                images.forEach((img) =>
                    img.removeEventListener("error", handleError)
                );
            };
        }
    }, [appRef.current]);

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach((node) => {
                        // 추가된 노드가 ELEMENT_NODE인지 확인
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const parentNode = node.closest(
                                ".rx-inserted-node-started"
                            );
                            if (parentNode) {
                                editorRedactorLogger(
                                    "AI 생성 결과 신고 버튼 추가 시작"
                                );
                                const buttonContainer =
                                    document.querySelector(".rx-ai-buttons");
                                const reportButton = document.querySelector(
                                    ".rx-ai-report-button"
                                );
                                if (buttonContainer && !reportButton) {
                                    const button =
                                        document.createElement("button");
                                    button.className =
                                        "rx-ai-button rx-form-button rx-ai-report-button";
                                    button.innerText = "report";
                                    button.addEventListener(
                                        "click",
                                        async () => {
                                            const feedback =
                                                Sentry.getFeedback();
                                            const form =
                                                await feedback?.createForm();
                                            form?.appendToDom();
                                            form?.open();
                                        }
                                    );
                                    buttonContainer.prepend(button);
                                }
                            }
                        }
                    });
                }
            });
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="max-sm:pl-[10px]">
            <textarea ref={textareaRef} style={{ display: "none" }}></textarea>
        </div>
    );
}

function checkEndCharWithoutFinalConsonant(endChar) {
    try {
        const lastChar = endChar[endChar.length - 1];
        const lastCharCode = lastChar.charCodeAt(0);
        if (lastCharCode >= 0xac00 && lastCharCode <= 0xd7a3) {
            const offset = lastCharCode - 0xac00;
            const jongseongIndex = offset % 28;
            return jongseongIndex === 0;
        }
        return false;
    } catch (e) {
        editorRedactorLogger("checkEndCharWithoutFinalConsonant 함수 오류", e);
        return false;
    }
}

function isIOS() {
    const result =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    editorRedactorLogger("IOS 디바이스 여부 확인", result);
    return result;
}
