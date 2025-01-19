import React from "react";
// import { Analytics } from "@/components/core/Analytics";
// import { NextIntlClientProvider } from "next-intl";
// import { getLocale, getMessages } from "next-intl/server";
import Script from "next/script";
// import { WebVitals } from "@/components/core/WebVitals";
import { GoogleAnalytics } from "@next/third-parties/google";
// import { renderLogger } from "@/debug/render";
import { Viewport } from "next";

const APP_NAME = "OTU";
const APP_DEFAULT_TITLE = "OTU";
const APP_TITLE_TEMPLATE = "%s - OTU";
const APP_DESCRIPTION = "Memo is all you need";
export const metadata = {
    applicationName: APP_NAME,
    title: {
        default: APP_DEFAULT_TITLE,
        template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    appleWebApp: {
        statusBarStyle: "default",
        title: APP_DEFAULT_TITLE,
        appleMobileWebAppTitle: APP_NAME,
    },
    formatDetection: {
        telephone: false,
        address: false,
    },
    openGraph: {
        type: "website",
        siteName: APP_NAME,
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
    twitter: {
        card: "summary",
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
    other: {
        "mobile-web-app-capable": "yes",
    },
    // icons와 manifest 제거
};
export const viewport: Viewport = {
    width: "device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no",
};
export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // renderLogger("root/layout.tsx");
    const buildTimestamp = process.env.VERCEL_GIT_COMMIT_SHA
        ? process.env.VERCEL_GIT_COMMIT_SHA
        : "be_happy";

    // Providing all messages to the client
    // side is the easiest way to get started
    const currentEnv = process.env.VERCEL_ENV || "development";
    return (
        <html className="light" dark-theme="light">
            <head>
                <link
                    rel="manifest"
                    href={`/manifest.json?seed=${buildTimestamp}`}
                />
                <script src="https://cdn.amplitude.com/script/daa06fca0f535342f3141551c9c62360.js"></script>
                <Script strategy="lazyOnload">
                    {`
                      window.onload = function() {
                          if (window.amplitude && typeof window.amplitude.add === 'function') {
                              window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));
                              window.amplitude.init('daa06fca0f535342f3141551c9c62360', {
                                  "fetchRemoteConfig": true,
                                  "autocapture": true,
                                  userProperties: {
                                    environment: ${currentEnv} 
                                  }
                              });
                          } else {
                              console.warn('Amplitude is not initialized or add method is missing!');
                          }
                      };

                    (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/i06d49ic';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();

                  `}
                </Script>
                <Script>
                    {`
                      (function(h,o,t,j,a,r){
                          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                          h._hjSettings={hjid:5153673,hjsv:6};
                          a=o.getElementsByTagName('head')[0];
                          r=o.createElement('script');r.async=1;
                          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                          a.appendChild(r);
                      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                  `}
                </Script>
            </head>
            <GoogleAnalytics gaId="G-NB1M2L6C9R" />
            <body>
                {/* <NextIntlClientProvider messages={messages}> */}
                {children}
                {/* <Analytics /> */}
                {/* </NextIntlClientProvider> */}
            </body>
        </html>
    );
}
