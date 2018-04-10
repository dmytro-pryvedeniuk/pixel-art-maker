var area = $("#area");
activeColorTag = $("#activeColor");

var currentMap = {
    width: 30,
    height: 30,
    points: [],
    activeColor: null
};

function build() {
    area.empty();

    for (i = 0; i < currentMap.height; i++) {
        let row = area.append('<div className="rowblock">');

        for (j = 0; j < currentMap.width; j++) {
            let blockId = '${i}:${j}';
            let color = null; 
            var point = currentMap.points.find(p=>p.id == blockId);
            if (point)
                color = point.hex;

            $("<div>", 
            {
                id: blockId,
                class: "block"
            }).css('background-color', color)
            .appendTo(row);
        }
    }
    buildPalette();
}

function drawPixel(e) {
    if (e.target.className == "block") {
        let initialColor = e.target.style.background;
        var id = e.target.id;
        var color = activeColorTag.val();

        if (document.getElementById("floodfill").checked)
            floodFill(e.target, initialColor, color);

        e.target.style.background = color;
        updateMap(id, color);
    }
}

function updateMap(id, color) {
    var point = currentMap.points.find(p=>p.id == id);
    if (!point) {
        point = {};
        currentMap.points.push(point);
    }
    point["id"] = id;
    point["hex"] = color;
}

function mouseMove(e) {
    function buttonPressed(event) {
        if (event.buttons == null)
            return event.which != 0;
        else
            return event.buttons != 0;
    }

    if (!buttonPressed(e))
        return;
    drawPixel(e);
}

function buildPalette() {
    var colors = ["red", "orange", "yellow", "green", "blue", "purple", "brown", "gray", "black", "white"];

    var container = $("#colorpalette");
    container.empty();

    for (var i in colors) {
        $('<div>', {
            class: "colorBlock"
        }).css("background-color", colors[i])
        .appendTo(container);
    }
}

function colorToHex(colorName) {
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    d = $("#hiddenPixel");
    d.css("color", colorName);
    var rgbColor = d.css("color");
    var res = rgbColor.match(/\d+/g).map(x=>parseInt(x));
    return rgbToHex(...res);
}

function updateActiveColor(activeColor) {
    activeColorTag.val(colorToHex(activeColor));
    currentMap.color = activeColorTag.val();
}

function selectColor(e) {
    if (e.target.className == "colorBlock") {
        let activeColor = e.target.style.backgroundColor;
        updateActiveColor(activeColor);
    } else {
        // color picker
        currentMap.activeColor = activeColorTag.val();
    }
}

function saveImage() {
    var value = JSON.stringify(currentMap);
    window.localStorage.setItem("map", value);
}

function loadImage() {
    var mapStr = window.localStorage.getItem("map");
    if (typeof mapStr != "undefined") {
        currentMap = JSON.parse(mapStr);
        activeColorTag.value = currentMap.activeColor;
        build();
    }
}

function setup()
{
    updateActiveColor("red");
    build(30, 30);
}

function floodFill(node, targetColor, replacementColor) {
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

    function getParallelPixel(el, row) {
        if (!row)
            return;
        var curr = el.previousSibling;
        var anotherCurr = row.firstChild;
        while (curr != null) {
            anotherCurr = anotherCurr.nextSibling;
            curr = curr.previousSibling;
        }
        return anotherCurr;
    }
}

$(document).ready(setup);
activeColorTag.change(selectColor);
$("#palette").mouseup(selectColor);
area.mousemove(mouseMove);
area.mousedown(drawPixel);
area.contextmenu((e)=>e.preventDefault());
$("#save").click(saveImage);
$("#load").click(loadImage);