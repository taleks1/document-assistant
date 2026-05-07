package documentassistant.web;

import documentassistant.payload.DocumentTemplateResponse;
import documentassistant.service.DocumentTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class DocumentTemplateController {

    private final DocumentTemplateService service;

    @GetMapping("/{type}")
    public ResponseEntity<DocumentTemplateResponse> getByType(
            @PathVariable String type
    ) {
        return ResponseEntity.ok(service.getByType(type));
    }
}