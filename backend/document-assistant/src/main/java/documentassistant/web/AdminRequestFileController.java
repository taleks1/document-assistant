package documentassistant.web;

import documentassistant.model.entity.RequestFile;
import documentassistant.payload.RequestFileResponse;
import documentassistant.service.RequestFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/requests/{requestId}/files")
@RequiredArgsConstructor
public class AdminRequestFileController {

    private final RequestFileService requestFileService;

    @GetMapping
    public ResponseEntity<List<RequestFileResponse>> list(@PathVariable Long requestId) {
        return ResponseEntity.ok(requestFileService.getFiles(requestId));
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<Resource> download(
            @PathVariable Long requestId,
            @PathVariable Long fileId
    ) {
        RequestFile file = requestFileService.getFile(requestId, fileId);
        Resource resource = requestFileService.loadAsResource(file);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getFileName() + "\"")
                .body(resource);
    }
}
