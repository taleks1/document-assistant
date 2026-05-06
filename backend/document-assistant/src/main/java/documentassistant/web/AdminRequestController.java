package documentassistant.web;

import documentassistant.payload.DocumentRequestResponse;
import documentassistant.payload.RejectRequest;
import documentassistant.service.AdminRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/requests")
@RequiredArgsConstructor
public class AdminRequestController {

    private final AdminRequestService adminRequestService;

    @GetMapping
    public ResponseEntity<List<DocumentRequestResponse>> getAll() {
        return ResponseEntity.ok(adminRequestService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(adminRequestService.getById(id));
    }

    @PutMapping("/accept/{id}")
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
}
