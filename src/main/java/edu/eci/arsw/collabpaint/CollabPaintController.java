package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class CollabPaintController {

    @MessageMapping("/newpoint.{numdibujo}")
    @SendTo("/topic/newpoint.{numdibujo}")
    public Point handlePoint(Point point) {
        System.out.println("Nuevo punto recibido: " + point);
        return point;
    }
}