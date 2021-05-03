import { Main } from "../js/main.js";
import { HeaderSlide } from "../js/headerSlide.js";
import { Client, LiveData, MapData, SampleData } from "../js/overlay/client.js";

class OverlayElements
{
    public async Init()
    {
        new Main();
        new HeaderSlide();

        if(Main.urlParams.has("element"))
        {
            var html: string;
            var css: string;
            var script: any;

            try
            {
                html = await jQuery.ajax(
                {
                    type: "GET",
                    url: `./${Main.urlParams.get("element")!}/html.html`,
                    dataType: "html"
                });
    
                css = await jQuery.ajax(
                {
                    type: "GET",
                    url: `./${Main.urlParams.get("element")!}/css.css`,
                    dataType: "html" //CSS
                });
    
                script = await import(`./${Main.urlParams.get("element")!}/script.js`);
            }
            catch (ex)
            {
                window.location.href = Main.WEB_ROOT;
            }

            var container: HTMLDivElement = (<HTMLDivElement>Main.ThrowIfNullOrUndefined(document.querySelector(".elementContainer")));
            container.innerHTML = html!;

            var style: HTMLStyleElement = document.createElement("style");
            style.id = Main.urlParams.get("element")!;
            style.innerHTML = css!;
            document.body.appendChild(style);

            var initalisedScript: ElementScript = new script!.Script();
            initalisedScript.AddElement(container);

            /*var client: Client = new Client(Main.urlParams.get("ip"));
            client.AddEndpoint("MapData");
            client.websocketData["MapData"].e.addListener("message", (data) => { initalisedScript.UpdateMapData(data); });
            client.AddEndpoint("LiveData");
            client.websocketData["LiveData"].e.addListener("message", (data) => { initalisedScript.UpdateLiveData(data); });*/

            initalisedScript.UpdateMapData(SampleData.mapData);
            initalisedScript.UpdateLiveData(SampleData.liveData);

            //this.DragElement(Main.ThrowIfNullOrUndefined(document.querySelector("#element_01")));
            //new DragElement(Main.ThrowIfNullOrUndefined(document.querySelector("#element_01")));
            new DragElement(Main.ThrowIfNullOrUndefined(document.querySelector("#element_01")), Main.ThrowIfNullOrUndefined(document.querySelector("#overlay")));
        }
        else
        {
            window.location.href = Main.WEB_ROOT;
        }
    }
}
new OverlayElements().Init();

class DragElement
{
    private container: HTMLElement;
    private element: HTMLElement;
    private mouseX: number;
    private mouseY: number;
    private xChange: number;
    private yChange: number;

    constructor(_element: HTMLDivElement, _container?: HTMLElement)
    {
        if (_container !== undefined) { this.container = _container; }
        else { this.container = document.body; }
        this.element = _element;
        this.mouseX = 0;
        this.mouseY = 0;
        this.xChange = 0;
        this.yChange = 0;

        //Event listeners were being a problem here so for now I will be setting only one event to the container (this will stop me from being able to use this event on this element elsewhere).
        this.element.onmousedown = (e: MouseEvent) => { this.MouseDownEvent(e); };
    }

    private MouseDownEvent(e: MouseEvent): void
    {
        //When this was inside the if statment below the element would resizse from the side it was offset from which was good but it was very hard to control.
        this.element.style.left = `${this.element.offsetLeft}px`;
        this.element.style.top = `${this.element.offsetTop}px`;
        this.element.style.right = "unset";
        this.element.style.bottom = "unset";
        this.container.onmouseup = (e: MouseEvent) => { this.MouseUpEvent(e); };

        if (e.offsetX < this.element.clientWidth - 15 && e.offsetY < this.element.clientHeight - 15) //The resize grabber is 15px
        {
            e.preventDefault();
            //Remove the elements right/bottom position and replace it back to left/top.
            //Set mouse position when the mouse is first down.
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            //If using element instead of the container, if the mouse moves fast enough to escape the element before its position is updated, it will stop updating the elements position until the mouse goes over the element again.
            this.container.onmousemove = (e: MouseEvent) => { this.MouseMoveEvent(e); };
        }
    }
    
    private MouseMoveEvent(e: MouseEvent): void
    {
        e.preventDefault();
        //Calculate the change in mouse position. Is this not just the same as 'e.MovmentX/Y'?
        this.xChange = this.mouseX - e.clientX;
        this.yChange = this.mouseY - e.clientY;
        //Set the new position of the mouse.
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        //Move the element to the new position.
        var elementLeft: number;
        if (this.element.offsetLeft + this.element.clientWidth > this.container.clientWidth)
        { elementLeft = this.container.clientWidth - this.element.clientWidth }
        else if (this.element.offsetLeft < 0)
        { elementLeft = 0; }
        else
        { elementLeft = this.element.offsetLeft - this.xChange; }
        this.element.style.left = `${elementLeft}px`;

        var elementTop: number;
        if (this.element.offsetTop + this.element.clientHeight > this.container.clientHeight)
        { elementTop = this.container.clientHeight - this.element.clientHeight }
        else if (this.element.offsetTop < 0)
        { elementTop = 0; }
        else
        { elementTop = this.element.offsetTop - this.yChange; }
        this.element.style.top = `${elementTop}px`;
    }
    
    private MouseUpEvent(e: MouseEvent): void
    {
        //Stop moving when the mouse is released.
        this.container.onmouseup = null;
        this.container.onmousemove = null;

        //Set the elements position with left/right/top/bottom, work % values into this
        if (this.element.offsetLeft > this.container.clientWidth / 2)
        {
            this.element.style.right = `${this.container.clientWidth - this.element.offsetLeft - this.element.clientWidth}px`;
            this.element.style.left = "unset";
        }

        if (this.element.offsetTop > this.container.clientHeight / 2)
        {
            this.element.style.bottom = `${this.container.clientHeight - this.element.offsetTop - this.element.clientHeight}px`;
            this.element.style.top = "unset";
        }
    }
}

interface ElementScript
{
    AddElement(element: HTMLDivElement, width?: number, height?: number): void;
    UpdateMapData(data: MapData): void;
    UpdateLiveData(data: LiveData): void;
}