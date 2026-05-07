package documentassistant.web;

import documentassistant.payload.CreateDocumentRequest;
import documentassistant.payload.DocumentRequestResponse;
import documentassistant.service.DocumentRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class DocumentRequestController {

    private final DocumentRequestService documentRequestService;

    @GetMapping
    public ResponseEntity<Page<DocumentRequestResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(page, size);

        return ResponseEntity.ok(documentRequestService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(documentRequestService.getById(id));
    }

    @PostMapping
    public ResponseEntity<DocumentRequestResponse> submit(@Valid @RequestBody CreateDocumentRequest request) {
        DocumentRequestResponse created = documentRequestService.create(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }
}
