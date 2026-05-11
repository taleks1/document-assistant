package documentassistant.web;

import documentassistant.payload.CreateDocumentTemplateRequest;
import documentassistant.payload.DocumentTemplateResponse;
import documentassistant.service.DocumentTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DocumentTemplateResponse> create(
            @Valid @RequestBody CreateDocumentTemplateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.create(request));
    }
}