// this flag shows if the drop is already handled by boxes
var dropHandled = false;

var itemMap = { // contains the 3 selected items
    box1: null,
    box2: null,
    box3: null
};

var labelMap = { // contains the placed labels, max 3 per box
    // stuff here is set in drag-labels.js
    box1: [],
    box2: [],
    box3: []
};

const containers = document.querySelectorAll('.fancy-drop-container')

const droppable = new Draggable.Droppable(containers, {
    draggable: '.fancy-draggable',
    droppable: '.fancy-droppable'
});

function dropped(ev) {
    console.log(JSON.stringify(ev));
    console.log(JSON.stringify(droppable.lastDropzone));

    if (ev._canceled)
        return;
}

$('#save').click(function () {
    console.log("saving");
    itemMap["box1"] = $('#box1-tag p:first')[0] == undefined ? undefined : $('#box1-tag p:first')[0].innerText
    itemMap["box2"] = $('#box2-tag p:first')[0] == undefined ? undefined : $('#box2-tag p:first')[0].innerText
    itemMap["box3"] = $('#box3-tag p:first')[0] == undefined ? undefined : $('#box3-tag p:first')[0].innerText
    console.log(itemMap)
});

function getMargin(elem) {
    return parseInt(elem.css("marginTop").replace('px', ''));
}

function placeElementAtLoc(elem, left, top) {
    elem.css({
        left: left,
        top: top,
        position: 'absolute',
        // background: "red",
        // zIndex: 10
    });

    elem.children('.emoji-text').css({
        position: 'relative',
        top: '-50%',
    });
}

function storeLabelPlacement(draggable, canvas, dropPosition) {
    // $("#info").html(
    //     "&lt" + draggable.attr('id') + "&gt" +
    //     " set to " + "&lt" + canvas.attr('id') + "&gt" +
    //     " at absolute pos " + dropPosition.left + ", " + dropPosition.top
    // );
    // return;


    if (draggable.attr('placement') != null)
        var oldPlacement = JSON.parse(draggable.attr('placement'));
    else
        var oldPlacement = null;

    if (canvas.attr('id') != 'unset' // many can be unset
        && labelMap[canvas.attr('id')].length == 3 // max three are allowed per box
        && !labelMap[canvas.attr('id')].map(e => e['label']).includes(draggable.attr('id')) // a label is moved on the box
        ) {
        // TODO reset placement if the box is already full (i.e., 3 stickers)
        // TODO a) reset to old box (partially working), b) reset to outside boxes
        alert("please remove other labels first");
        if (oldPlacement != null) {
            placeElementAtLoc(draggable, oldPlacement.left, oldPlacement.top);
        }
        return;
    }

    if (oldPlacement != null) {
        // remove old placement
        labelMap[oldPlacement.box] = labelMap[oldPlacement.box].filter((value, index, arr) => value.label != oldPlacement.label);

        if(canvas.attr('id') == 'unset')
            draggable.attr('placement', null);
    }

    if (canvas.attr('id') != 'unset') {
        var newPlacement = {
            label: draggable.attr('id'),
            box: canvas.attr('id'),
            left: dropPosition.left,
            top: dropPosition.top
        };
        draggable.attr('placement', JSON.stringify(newPlacement));

        labelMap[newPlacement.box].push(newPlacement);
    }

    $("#info").html(
        JSON.stringify(labelMap)
    );
}

$(function () {
    $(".draggable").draggable(
        {
            // helper: "clone",
            cursor: "move",
        }
    );


    $(".dropzone").droppable({
        drop: function (event, ui) {
            var canvas = $(this);
            var dropzonePos = canvas.position();

            var dropPosition = {
                left: ui.draggable.offset().left,
                top: ui.draggable.offset().top // + dropzonePos.top //  + canvas.height() + getMargin(canvas)
            };

            // alert(
            //     dropzonePos.left + " " + dropzonePos.top + "\n"
            //     // ui.draggable.offset().left + " " + ui.draggable.offset().top + "\n" +
            //     // dropPosition.left + " " + dropPosition.top
            // );

            var marker = $(".marker");
            marker.css({
                left: dropPosition.left,
                top: dropPosition.top,
                position: 'absolute',
                background: "red",
                zIndex: 10
            })

            dropHandled = true;
            storeLabelPlacement(ui.draggable, canvas, dropPosition)
        }
    });


    $(".outside-dropzone").droppable({
        drop: function (event, ui) {

            if (dropHandled) {
                dropHandled = false;
                return;
            }

            var canvas = $(this);

            var dropPosition = {
                left: -1,
                top: -1
            };

            // TODO dup code
            var marker = $(".marker");
            marker.css({
                left: dropPosition.left,
                top: dropPosition.top,
                position: 'absolute',
                background: "white",
                zIndex: 10
            })

            storeLabelPlacement(ui.draggable, canvas, dropPosition)
        }
    });

})
