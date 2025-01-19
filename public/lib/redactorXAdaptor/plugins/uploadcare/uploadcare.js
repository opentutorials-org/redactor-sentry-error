import {
    IMAGE_SHRINK_POLICY_HEIGHT,
    IMAGE_SHRINK_POLICY_STRING,
    IMAGE_SHRINK_POLICY_WIDTH,
} from "@/functions/constants";
import { fetchUserId } from "@/supabase/utils/client";
import * as UC from "@uploadcare/file-uploader";
UC.defineComponents(UC);

const uploadIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7V12.5858L18.7071 12.2929L18.6934 12.2794C18.091 11.6998 17.3358 11.3301 16.5 11.3301C15.6642 11.3301 14.909 11.6998 14.3066 12.2794L14.2929 12.2929L14 12.5858L11.7071 10.2929L11.6934 10.2794C11.091 9.6998 10.3358 9.33014 9.5 9.33014C8.66419 9.33014 7.909 9.6998 7.30662 10.2794L7.29289 10.2929L5 12.5858V7ZM15.4142 14L15.6997 13.7146C16.0069 13.4213 16.2841 13.3301 16.5 13.3301C16.7159 13.3301 16.9931 13.4213 17.3003 13.7146L19 15.4142V17C19 18.1046 18.1046 19 17 19H7C5.89543 19 5 18.1046 5 17V15.4142L8.69966 11.7146C9.0069 11.4213 9.28406 11.3301 9.5 11.3301C9.71594 11.3301 9.9931 11.4213 10.3003 11.7146L13.2929 14.7071L15.2929 16.7071C15.6834 17.0976 16.3166 17.0976 16.7071 16.7071C17.0976 16.3166 17.0976 15.6834 16.7071 15.2929L15.4142 14ZM21 15.001V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V15.0002V14.9998V7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V14.999C21 14.9997 21 15.0003 21 15.001ZM15 7C14.4477 7 14 7.44772 14 8C14 8.55228 14.4477 9 15 9H15.01C15.5623 9 16.01 8.55228 16.01 8C16.01 7.44772 15.5623 7 15.01 7H15Z"/></svg>`;

Redactor.add("plugin", "uploadcare", {
    start() {
        // 툴바에 Uploadcare 버튼 추가
        this.app.toolbar.add("uploadcareBtn", {
            title: "Upload File",
            icon: uploadIcon,
            command: "uploadcare.launch",
        });
        (async () => {
            const userId = await fetchUserId();
            const pageId = this.opts.get("uploadcare").pageId;
            this.opts.set("uploadcare", { userId, pageId });
        })();
    },
    launch(params, button) {
        if (!this.app.editor.hasFocus()) {
            this.app.editor.setFocus("end");
        } else {
            this.app.editor.save();
        }
        requestAnimationFrame(() => {
            this.openUploader(this.app);
        });
    },
    openUploader(editor) {
        const ctxName = "my-uploader";

        // Create the uc-config element
        const ucConfig = document.createElement("uc-config");
        ucConfig.setAttribute("ctx-name", ctxName);
        ucConfig.setAttribute(
            "pubkey",
            process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY
        ); // Replace with your actual public key
        ucConfig.setAttribute("image-shrink", IMAGE_SHRINK_POLICY_STRING);
        const pageId = this.opts.get("uploadcare").pageId;
        const userId = this.opts.get("uploadcare").userId;
        ucConfig.metadata = { pageId, userId };

        // Optionally, add any additional configuration
        // ucConfig.setAttribute('multiple', 'true'); // For multiple file uploads

        // Create the uc-upload-ctx-provider element
        const ucProvider = document.createElement("uc-upload-ctx-provider");
        ucProvider.setAttribute("ctx-name", ctxName);

        // Create the uc-file-uploader-regular element
        const ucUploader = document.createElement("uc-file-uploader-regular");
        ucUploader.setAttribute("ctx-name", ctxName);

        // Append the elements to the body
        document.body.appendChild(ucConfig);
        document.body.appendChild(ucProvider);
        document.body.appendChild(ucUploader);

        // Get the uploader API
        const api = ucProvider.getAPI();

        // Open the uploader
        api.initFlow();

        // 업로드된 파일들을 저장할 배열
        let uploadedFiles = [];

        // 파일 업로드 성공 이벤트 처리
        ucProvider.addEventListener("file-upload-success", function (e) {
            const fileEntry = e.detail;
            uploadedFiles.push(fileEntry);
        });

        // Handle file URL changes (e.g., after editing)
        ucProvider.addEventListener("file-url-changed", function (e) {
            const updatedFileEntry = e.detail;
            // Find the file in uploadedFiles with the same UUID
            const index = uploadedFiles.findIndex(
                (file) => file.uuid === updatedFileEntry.uuid
            );
            if (index !== -1) {
                // Update the file entry
                uploadedFiles[index] = updatedFileEntry;
            } else {
                // If not found, add it to the array
                uploadedFiles.push(updatedFileEntry);
            }
        });

        // Done 버튼 클릭 이벤트 처리
        // Inside the 'done-click' event handler
        ucProvider.addEventListener("done-click", async () => {
            if (uploadedFiles.length === 0) {
                console.warn("No uploaded files found");
                return;
            }

            // Variable to store all HTML code
            let htmlcode = "";

            for (const file of uploadedFiles) {
                const isImage = file.isImage;

                if (isImage) {
                    const SCREEN_SIZE = 734;
                    const imageWidth =
                        Number(file?.contentInfo?.image?.width) || SCREEN_SIZE;
                    const imageHeight =
                        Number(file?.contentInfo?.image?.height) || SCREEN_SIZE;

                    // Calculate the display dimensions
                    const displayWidth = Math.min(SCREEN_SIZE, imageWidth);
                    const displayHeight = Math.min(SCREEN_SIZE, imageHeight);

                    // Use 'limit' operation to prevent upscaling
                    const imageUrl = `${removePreviewFromCdnUrl(
                        file.cdnUrl || ""
                    )}-/preview/${IMAGE_SHRINK_POLICY_WIDTH}x${IMAGE_SHRINK_POLICY_HEIGHT}/`;

                    const imageHtml = `<figure style="max-width:${displayWidth}px;">
                <img src="${imageUrl}" />
            </figure>`;

                    htmlcode += imageHtml;
                } else {
                    const fileUrl = file.cdnUrl || "";
                    const fileName = file.name || "Unknown File";
                    const downloadLink = generateDownloadLink(
                        fileUrl,
                        fileName
                    );

                    htmlcode += downloadLink;
                }
            }

            editor.app.editor.restore();
            // Insert the HTML code into the editor at once
            editor.app.editor.insertContent({ html: htmlcode });

            // Close the dropdown menu
            self.app.dropdown.close();

            // Reset the uploaded files array
            uploadedFiles = [];

            // Close the uploader modal
            api.doneFlow();

            // Remove uploader elements
            ucConfig.remove();
            ucProvider.remove();
            ucUploader.remove();
        });

        // 모달 닫힘 이벤트 처리
        ucProvider.addEventListener("modal-close", function () {
            console.log("Uploader modal closed");
            // 업로더 요소들 제거
            ucConfig.remove();
            ucProvider.remove();
            ucUploader.remove();
        });
    },
});

// 유틸리티 함수들 정의
function removePreviewFromCdnUrl(cdnUrl) {
    const regex = /-\/preview\/?(\d+x\d+)?\/?$/;
    const match = cdnUrl.match(regex);
    if (match) {
        return cdnUrl.replace(match[0], "").replace(/\/?$/, "/");
    }
    return cdnUrl;
}

function generateDownloadLink(fileUrl, fileName) {
    return `<div class="download"><a href="${fileUrl}" download="${fileName}" target="_blank">${fileName}</a></div>`;
}
