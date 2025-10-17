var app = (function () {
    var stompClient = null;
    var drawingId = null;
    var canvas, ctx;

    var connect = function () {
        drawingId = document.getElementById("drawingId").value;
        if (!drawingId) {
            alert("Por favor ingresa un número de dibujo.");
            return;
        }

        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Conectado: ' + frame);

            // Suscribirse a los tópicos dinámicos
            stompClient.subscribe('/topic/newpoint.' + drawingId, function (eventbody) {
                var point = JSON.parse(eventbody.body);
                drawPoint(point.x, point.y);
            });

            stompClient.subscribe('/topic/newpolygon.' + drawingId, function (eventbody) {
                var polygon = JSON.parse(eventbody.body);
                drawPolygon(polygon.points);
            });
        });
    };

    var drawPoint = function (x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
    };

    var drawPolygon = function (points) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
        ctx.fill();
    };

    var publishPoint = function (px, py) {
        if (stompClient && drawingId) {
            let point = { x: px, y: py };
            stompClient.send("/app/newpoint." + drawingId, {}, JSON.stringify(point));
        }
    };

    var init = function () {
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");

        canvas.addEventListener("click", function (event) {
            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            publishPoint(x, y);
        });
    };

    return {
        connect: connect,
        init: init
    };
})();
