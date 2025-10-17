var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var drawingId = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
    };

    var getMousePosition = function (evt) {
        var canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            console.log('Subscribed to /topic/newpoint.' + drawingId);

            stompClient.subscribe('/topic/newpoint.' + drawingId, function (eventbody) {
                var point = JSON.parse(eventbody.body);
                addPointToCanvas(point);
            });
        });
    };

    return {
        init: function () {
            var can = document.getElementById("canvas");

            // Captura clics en el canvas
            can.addEventListener("click", function (evt) {
                if (stompClient && drawingId) {
                    var point = getMousePosition(evt);
                    app.publishPoint(point.x, point.y);
                } else {
                    alert("Primero debes conectarte a un dibujo.");
                }
            });
        },

        connect: function () {
            var id = document.getElementById("drawingId").value;
            if (!id) {
                alert("Por favor ingresa un ID de dibujo antes de conectarte.");
                return;
            }
            drawingId = id;
            connectAndSubscribe();
        },

        publishPoint: function (px, py) {
            var pt = new Point(px, py);
            console.info("Publishing point at (" + pt.x + ", " + pt.y + ") to drawing " + drawingId);
            addPointToCanvas(pt);
            stompClient.send("/app/newpoint." + drawingId, {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
        }
    };
})();
