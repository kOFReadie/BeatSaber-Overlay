import { Client } from "../../../assets/js/overlay/client.js";
import { UI } from "../../../assets/js/overlay/ui.js";
//Editor import is dynamic based on the URL

export class main
{
    public static WEB_ROOT: string;
    public static params: URLSearchParams = new URLSearchParams(window.location.search);
    public static useEditor: boolean = window.location.pathname.includes("/edit/");

    private _ui?: UI;
    private _editor?: object;
    private _client?: Client;

    public async init(): Promise<main>
    {
        setInterval(() => { console.clear(); }, 600000); //Try to clear some memory every 10 mins (mainly for clearing disconnected client errors)
        
        this._ui = await new UI().init();

        if (main.useEditor)
        {
            jQuery.ajax(
            {
                async: false,
                type: "GET",
                url: `assets/html/editor.html`,
                dataType: "html",
                success: (editorHtml: string) => { document.querySelector("#editorContainer")!.innerHTML = editorHtml; }
            });
            let editorCSS: HTMLLinkElement = document.createElement("link");
            editorCSS.rel = "stylesheet";
            editorCSS.href = "../edit/assets/css/editor.css";
            document.head.appendChild(editorCSS);

            if (this._ui !== undefined && this._ui.ImportedElements !== undefined)
            { this._editor = new (await import("./editor.js")).editor().init(); }
        }

        if (this._ui !== undefined)
        {
            this._client = new Client(main.params.get("ip"));
            this._client.AddEndpoint("MapData");
            this._client.websocketData["MapData"].e.addListener("message", (data) => { this._ui!.updateUIElements(data); });
            this._client.AddEndpoint("LiveData");
            this._client.websocketData["LiveData"].e.addListener("message", (data) => { this._ui!.updateUIElements(data); });
        }

        this.hideSplashScreen();

        return this;
    }

    private hideSplashScreen(): void
    {
        if (main.useEditor) { document.body.removeChild(document.querySelector(".slideMenuClick.view")!); }
        let splashScreen: HTMLElement | null = document.querySelector("#splashScreen");
        splashScreen!.style.opacity = "0";
        setTimeout(() => { splashScreen!.style.display = "none"; }, 500);
    }
}
new main().init();

export function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }