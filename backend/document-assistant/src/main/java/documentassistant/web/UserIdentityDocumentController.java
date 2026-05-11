package documentassistant.web;

import documentassistant.payload.UserIdentityDocumentRequest;
import documentassistant.payload.UserIdentityDocumentResponse;
import documentassistant.service.UserIdentityDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/documents")
@RequiredArgsConstructor
public class UserIdentityDocumentController {

    private final UserIdentityDocumentService userIdentityDocumentService;

    @GetMapping
    public ResponseEntity<List<UserIdentityDocumentResponse>> getAll() {
        return ResponseEntity.ok(userIdentityDocumentService.getAll());
    }

    @PostMapping
    public ResponseEntity<UserIdentityDocumentResponse> save(@RequestBody UserIdentityDocumentRequest request) {
        return ResponseEntity.ok(userIdentityDocumentService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserIdentityDocumentResponse> update(
            @PathVariable Long id,
            @RequestBody UserIdentityDocumentRequest request
    ) {
        return ResponseEntity.ok(userIdentityDocumentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userIdentityDocumentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
