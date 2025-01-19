"use client";
import "../public/lib/redactor/src/redactor.css";
import Redactor from "../public/lib/redactorXAdaptor/Redactor";
export default function Page() {
    return (
        <div>
            <h1>Page</h1>
            <div id="mainScrollPane">
                <Redactor
                    open={true}
                    // @ts-ignore
                    onAppReady={(ref) => {
                        console.log("onAppReady", ref);
                    }}
                    onChange={(content: any) => {
                        console.log("onChange", content);
                    }}
                    initContent="hi"
                    pageId="1"
                />
            </div>
        </div>
    );
}
