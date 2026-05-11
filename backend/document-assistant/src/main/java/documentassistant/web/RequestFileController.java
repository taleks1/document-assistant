package documentassistant.web;

import documentassistant.payload.RequestFileResponse;
import documentassistant.service.RequestFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/requests/{requestId}/files")
@RequiredArgsConstructor
public class RequestFileController {

    private final RequestFileService requestFileService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<List<RequestFileResponse>> upload(
            @PathVariable Long requestId,
            @RequestParam("files") List<MultipartFile> files
    ) {
        return ResponseEntity.ok(requestFileService.uploadFiles(requestId, files));
    }

    @GetMapping
    public ResponseEntity<List<RequestFileResponse>> list(@PathVariable Long requestId) {
        return ResponseEntity.ok(requestFileService.getFiles(requestId));
    }
}
