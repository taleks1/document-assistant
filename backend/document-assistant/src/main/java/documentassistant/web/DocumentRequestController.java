package documentassistant.web;

import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.payload.CreateDocumentRequest;
import documentassistant.payload.DocumentRequestResponse;
import documentassistant.payload.UpdateDocumentRequest;
import documentassistant.service.DocumentRequestService;
import documentassistant.service.PdfGenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class DocumentRequestController {

    private final DocumentRequestService documentRequestService;
    private final PdfGenerationService pdfGenerationService;

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

    @PutMapping("/{id}")
    public ResponseEntity<DocumentRequestResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDocumentRequest request
    ) {
        return ResponseEntity.ok(documentRequestService.update(id, request));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<Page<DocumentRequestResponse>> getRequestsForUser(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                documentRequestService.getRequestsByUserId(id, PageRequest.of(page, size))
        );
    }

    @GetMapping("/{id}/pdf/confirmation")
    public ResponseEntity<byte[]> downloadConfirmation(@PathVariable Long id) {
        DocumentRequestResponse req = documentRequestService.getById(id);
        byte[] pdf = pdfGenerationService.generateConfirmation(req);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"confirmation-" + req.getReferenceNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{id}/pdf/document")
    public ResponseEntity<byte[]> downloadOfficialDocument(@PathVariable Long id) {
        DocumentRequestResponse req = documentRequestService.getById(id);
        if (req.getStatus() != DocumentRequestStatus.APPROVED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        byte[] pdf = pdfGenerationService.generateOfficialDocument(req);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"document-" + req.getReferenceNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
