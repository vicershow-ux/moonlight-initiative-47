import type {ReactNode} from "react";
import {HeadContent, Outlet, Scripts, createRootRoute} from "@tanstack/react-router";
import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {PLATFORM_META, PLATFORM_SCRIPTS} from "@/platform/scripts.gen";
import {HMR_CLIENT} from "@/platform/dev-hmr";
import {AuthProvider} from "@/contexts/AuthContext";
import {CookieBanner} from "@/components/CookieBanner";
import {MetrikaTracker} from "@/components/MetrikaTracker";
import {AnalyticsHead} from "@/components/AnalyticsHead";
import PageNotFound from "@/pages/PageNotFound";
import appCss from "@/index.css?url";

const TITLE = "Ремонт квартир под ключ в Хабаровске — FixKey";
const DESCRIPTION =
    "Ремонт квартир и домов под ключ в Хабаровске и Хабаровском р-не. Фиксированная смета до начала работ, гарантия 3 года, контроль на каждом этапе.";
const OG_IMAGE = "https://cdn.poehali.dev/projects/***/files/og-image-1792749059216.png";

const SEO_SCRIPT = `(function () {
            var known = ["/", "/uslugi"];
            var noindexPages = ["/privacy", "/terms", "/cookies"];
            var path = location.pathname.replace(/\\/+$/, "") || "/";
            var isCabinet = path === "/cabinet" || path.indexOf("/cabinet/") === 0;
            var isService = path.indexOf("/uslugi/") === 0;
            var hasQuery = location.search.length > 0;

            window.__isCabinet = isCabinet;

            var isKnown = known.indexOf(path) !== -1 || isService;
            var isLegal = noindexPages.indexOf(path) !== -1;
            var isUnknown = !isKnown && !isLegal && !isCabinet;

            function noindex() {
                if (document.querySelector('meta[name="robots"]')) return;
                var m = document.createElement("meta");
                m.setAttribute("name", "robots");
                m.setAttribute("content", "noindex, follow");
                document.head.appendChild(m);
            }

            if (isUnknown) {
                noindex();
                document.title = "Страница не найдена — FixKey";
            } else if (isCabinet || isLegal) {
                noindex();
            } else if (hasQuery) {
                var allowed = /^(utm_|yclid|gclid|from|ysclid)/;
                var junk = false;
                location.search.slice(1).split("&").forEach(function (pair) {
                    var key = pair.split("=")[0];
                    if (key && !allowed.test(key)) junk = true;
                });
                if (junk) noindex();
            }
        })();`;

const METRIKA_SCRIPT = `(function (m, e, t, r, i, k, a) {
        m[i] = m[i] || function () {
            (m[i].a = m[i].a || []).push(arguments)
        };
        m[i].l = 1 * new Date();
        for (var j = 0; j < document.scripts.length; j++) {
            if (document.scripts[j].src === r) {
                return;
            }
        }
        k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
    })
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    window.__ymId = 101026698;

    if (!window.__isCabinet) {
        ym(101026698, "init", {
            trustedDomains: ["poehali.dev"],
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
            trackHash: true
        });
        window.__ymReady = true;
    }`;

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {charSet: "utf-8"},
            {name: "viewport", content: "width=device-width, initial-scale=1.0"},
            {title: TITLE},
            {name: "description", content: DESCRIPTION},
            {property: "og:title", content: TITLE},
            {property: "og:description", content: DESCRIPTION},
            {property: "og:image", content: OG_IMAGE},
            {name: "author", content: "FixKey"},
            {property: "og:image:width", content: "1280"},
            {property: "og:image:height", content: "720"},
            {property: "og:image:alt", content: "FixKey — ремонт квартир под ключ"},
            {name: "twitter:image", content: OG_IMAGE},
            ...PLATFORM_META,
        ],
        links: [
            {rel: "stylesheet", href: appCss},
            {rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png"},
            {rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png"},
            {rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png"},
            {rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png"},
            {rel: "shortcut icon", href: "/favicon.ico"},
        ],
        // IMPORTANT: DO NOT REMOVE PLATFORM SCRIPTS AND THE DEV HMR CLIENT!
        scripts: [
            ...(import.meta.env.DEV ? [{children: HMR_CLIENT}] : []),
            ...PLATFORM_SCRIPTS,
            {children: SEO_SCRIPT},
            {children: METRIKA_SCRIPT},
        ],
    }),
    component: RootComponent,
    notFoundComponent: PageNotFound,
});

function RootComponent() {
    return (
        <RootDocument>
            <TooltipProvider>
                <Toaster/>
                <Sonner/>
                <AuthProvider>
                    <MetrikaTracker/>
                    <AnalyticsHead/>
                    <Outlet/>
                    <CookieBanner/>
                </AuthProvider>
            </TooltipProvider>
        </RootDocument>
    );
}

function RootDocument({children}: { children: ReactNode }) {
    return (
        <html lang="ru">
        <head>
            <HeadContent/>
        </head>
        <body>
        {children}
        <Scripts/>
        </body>
        </html>
    );
}