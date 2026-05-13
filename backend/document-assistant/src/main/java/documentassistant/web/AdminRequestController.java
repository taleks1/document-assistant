package documentassistant.web;

import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.payload.DocumentRequestResponse;
import documentassistant.payload.RejectRequest;
import documentassistant.service.AdminRequestService;
import documentassistant.service.PdfGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/requests")
@RequiredArgsConstructor
public class AdminRequestController {

    private final AdminRequestService adminRequestService;
    private final PdfGenerationService pdfGenerationService;

    @GetMapping
    public ResponseEntity<Page<DocumentRequestResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminRequestService.getAll(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(adminRequestService.getById(id));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<DocumentRequestResponse> accept(@PathVariable Long id) {
        return ResponseEntity.ok(adminRequestService.accept(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<DocumentRequestResponse> reject(
            @PathVariable Long id,
            @RequestBody RejectRequest request
    ) {
        return ResponseEntity.ok(adminRequestService.reject(id, request.getReason()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<DocumentRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody documentassistant.payload.UpdateStatusRequest request
    ) {
        return ResponseEntity.ok(adminRequestService.updateStatus(id, request.getStatus()));
    }

    @GetMapping("/{id}/pdf/confirmation")
    public ResponseEntity<byte[]> downloadConfirmation(@PathVariable Long id) {
        DocumentRequestResponse req = adminRequestService.getById(id);
        byte[] pdf = pdfGenerationService.generateConfirmation(req);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"confirmation-" + req.getReferenceNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{id}/pdf/document")
    public ResponseEntity<byte[]> downloadOfficialDocument(@PathVariable Long id) {
        DocumentRequestResponse req = adminRequestService.getById(id);
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
