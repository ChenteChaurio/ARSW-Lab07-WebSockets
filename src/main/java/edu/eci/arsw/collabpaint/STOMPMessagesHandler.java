package edu.eci.arsw.collabpaint;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    private ConcurrentHashMap<String, List<Point>> drawings = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor para dibujo " + numdibujo + ": " + pt);
        msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);
        drawings.putIfAbsent(numdibujo, new CopyOnWriteArrayList<>());
        drawings.get(numdibujo).add(pt);
        List<Point> points = drawings.get(numdibujo);
        if (points.size() >= 4) {
            Polygon polygon = new Polygon(new ArrayList<>(points));
            System.out.println("Polígono completo en dibujo " + numdibujo + ": " + polygon);
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);
            drawings.put(numdibujo, new CopyOnWriteArrayList<>());
        }
    }
}
