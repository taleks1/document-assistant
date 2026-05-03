package documentassistant.web;

import documentassistant.payload.DocumentRequestResponse;
import documentassistant.service.AdminRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
