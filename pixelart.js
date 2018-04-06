var area = document.getElementById("area");
activeColorTag = document.getElementById("activeColor");
activeColorTag.value = colorToHex("red");

var currentMap = {
    width: 30,
    height: 30,
    points: [],
    activeColor: activeColorTag.value
};

function build()
{
    while (area.firstChild)
        area.removeChild(area.firstChild);

    for (i=0; i<currentMap.height; i++)
    {
        let row = document.createElement("div");
        row.className="rowblock";
        area.appendChild(row);

        for (j=0; j<currentMap.width; j++)
        {
            let block = document.createElement("div");
            block.className="block";
            block.id=`${i}:${j}`;
            row.appendChild(block);

            var point = currentMap.points.find(p => p.id==block.id);
            if (point)
                block.style.background = point.hex;
        };
    };
    buildPalette();
}

function drawPixel(e)
{
    if (e.target.className=="block"){
        let initialColor = e.target.style.background;
        var id = e.target.id;
        var color = activeColorTag.value;

                    
        if (document.getElementById("floodfill").checked)
            floodFill(e.target, initialColor, color);
        
        e.target.style.background = color;
        updateMap(id, color);
    }
};

function updateMap(id, color)
{
    var point = currentMap.points.find(p => p.id==id);
    if (!point)
    {
        point = {};
        currentMap.points.push(point);
    };
    point["id"]=id;
    point["hex"]=color;    
}

function floodFill(node, targetColor, replacementColor)
{
    if (!node)
        return;
    if (targetColor == replacementColor)
        return;
    if (node.style.background != targetColor)
        return;

    node.style.background = replacementColor;
    updateMap(node.id, replacementColor);

    // west
    floodFill(node.previousSibling, targetColor, replacementColor);
    // east
    floodFill(node.nextSibling, targetColor, replacementColor);
    // north
    var row = node.parentNode.previousSibling;
    floodFill(getParallelPixel(node, row), targetColor, replacementColor);
    //south
    row = node.parentNode.nextSibling;
    floodFill(getParallelPixel(node, row), targetColor, replacementColor);

    function getParallelPixel(el, row)
    {
        if (!row) return;
        var curr = el.previousSibling;
        var anotherCurr = row.firstChild;
        while (curr != null)
        {
            anotherCurr = anotherCurr.nextSibling;
            curr = curr.previousSibling;
        };
        return anotherCurr;
    }
}

function buttonPressed(event) {
    if (event.buttons == null)
        return event.which != 0;
    else
        return event.buttons != 0;
}

var mouseMove = (e) => {
    if (buttonPressed(e)) {
        drawPixel(e);
    };
};

function buildPalette()
{
    var colors = ["red", "orange", "yellow", "green", "blue", 
        "purple", "brown", "gray", "black", "white" ];

    var container = document.getElementById("colorpalette");
    while(container.firstChild)
        container.removeChild(container.firstChild);

    for (var i in colors)
    {
        var colorBlock = document.createElement("div");
        colorBlock.className = "colorBlock";
        colorBlock.style.background = colors[i];
        container.appendChild(colorBlock); 
    }
}

function colorToHex(colorName)
{
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    d = document.getElementById("hiddenPixel");
    d.style.color = colorName;
    //Color in RGB 
    var rgbColor = window.getComputedStyle(d).color;
    var res = rgbColor.match(/\d+/g).map(x => parseInt(x));
    return rgbToHex(...res);
}

function updateActiveColor(activeColor)
{
    activeColorTag.value = colorToHex(activeColor);
}

activeColorTag.addEventListener("change", () => {
   currentMap.activeColor = activeColorTag.value; 
});
window.addEventListener("load", build(30, 30));
palette.addEventListener("mouseup", (e) => {
    if (e.target.className=="colorBlock")
    {
        let activeColor = e.target.style.background;
        updateActiveColor(activeColor);
    };
});
area.addEventListener("mousemove", mouseMove);    
area.addEventListener("mousedown", (e) => {
    drawPixel(e);
});
area.addEventListener("contextmenu", (e) => {
   e.preventDefault(); 
});
document.getElementById("save").addEventListener('click', () => {
   var value = JSON.stringify(currentMap);
   window.localStorage.setItem("map", value); 
});
document.getElementById("load").addEventListener('click', () => {
   var mapStr = window.localStorage.getItem("map");
   if (typeof mapStr != "undefined")
   {
     currentMap = JSON.parse(mapStr);
     activeColorTag.value = currentMap.activeColor;
     build();
   }
});