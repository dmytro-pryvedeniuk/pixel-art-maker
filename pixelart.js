var area = $("#area");
activeColorTag = $("#activeColor");
const noColor="#ffffff";

var currentMap = {
    width: 30,
    height: 30,
    points: [[]],
    activeColor: null
};

function build() {
    area.empty();
    for (i = 0; i < currentMap.points.length; i++) {
        area.append(`<div id="row${i}" class="rowblock">`);
        var row = $(`#row${i}`);    
        for (j = 0; j < currentMap.points[i].length; j++)
        {
            var point = currentMap.points[i][j];
            row.append(`<div id="${point.id}" class="block" data-i="${i}" data-j="${j}">`);
        }
    }
    updateAllPixels();
    buildPalette();
}

function updateAllPixels() {
    for (let i=0; i < currentMap.points.length; i++)
        for (let j=0; j < currentMap.points[i].length; j++)
        {
            let point = currentMap.points[i][j];
            $(`#${point.id}`).css('background-color', point.hex);
        }
}

function drawPixel(el) {
    if (el.hasClass("block")) {
        var colorToUse = colorToHex(activeColorTag.val());
        let i = parseInt(el.attr('data-i'));
        let j = parseInt(el.attr('data-j'));

        if ($("#floodfill").is(":checked"))
        {
            let initialColor = colorToHex(el.css("background-color"));
            floodFill(i, j, initialColor, colorToUse);
        }
        else
        {
            updateMap(i, j, colorToUse);
        }
        updateAllPixels();
    }
}

function updateMap(i, j, color) {
    var point = currentMap.points[i][j];
    point.hex = color;
}

function mouseMove(e) {
    let el = null;
    if (e.which != 0)
    {
        el = e.target;
    }
    else if (e.touches)
    {
        var touch = e.changedTouches[0];
        el = document.elementFromPoint(touch.clientX, touch.clientY);
    }
    
    if (el != null)
    {
        e.stopPropagation();
        e.preventDefault();
        drawPixel($(el));
    }
}

function mouseDown(e){
    drawPixel($(e.target));    
}

function buildPalette() {
    var colors = ["red", "orange", "yellow", "green", "blue", "purple", "brown", "gray", "black", "white"];

    var container = $("#colorpalette");
    container.empty();

    for (var i in colors) {
        $('<div>', {
            class: "colorBlock"
        }).css("background-color", colors[i]).appendTo(container);
    }
}

function colorToHex(color) {
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    d = $("#hiddenPixel");
    d.css("color", color);
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

function setup() {
    updateActiveColor("red");
    clearImage();
}

function floodFill(i, j, targetColor, replacementColor) {
    if (i < 0 || j < 0 || i >= currentMap.height || j >= currentMap.width)
        return;
    if (targetColor == replacementColor)
        return;
    if (currentMap.points[i][j].hex != targetColor)
        return;
    updateMap(i, j, replacementColor);

    floodFill(i-1, j, targetColor, replacementColor);
    floodFill(i+1, j, targetColor, replacementColor);
    floodFill(i, j-1, targetColor, replacementColor);
    floodFill(i, j+1, targetColor, replacementColor);
}

function clearImage()
{
    currentMap.points = new Array(currentMap.height);
    for(var i=0;i<currentMap.points.length;i++)
    {
        currentMap.points[i] = new Array(currentMap.width);
        for (var j=0; j<currentMap.points[i].length; j++)
        {
            currentMap.points[i][j] = {
               id: `${i}_${j}`,
               hex: noColor 
            };
        }
    }
    build();
}

$(document).ready(setup);
activeColorTag.change(selectColor);
$("#palette").mouseup(selectColor);
area.mousemove(mouseMove);
area.mousedown(mouseDown);
area.contextmenu((e)=>e.preventDefault());
area.on("touchmove", mouseMove);
$("#save").click(saveImage);
$("#load").click(loadImage);
$("#clear").click(clearImage);