package documentassistant.service;

import documentassistant.exception.ResourceNotFoundException;
import documentassistant.model.entity.DocumentRequest;
import documentassistant.model.entity.RequestFile;
import documentassistant.model.entity.User;
import documentassistant.model.enums.Role;
import documentassistant.payload.RequestFileResponse;
import documentassistant.repository.DocumentRequestRepository;
import documentassistant.repository.RequestFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

@Service
@RequiredArgsConstructor
public class RequestFileService {

    private final RequestFileRepository fileRepository;
    private final DocumentRequestRepository requestRepository;
    private final UserService userService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional
    public List<RequestFileResponse> uploadFiles(Long requestId, List<MultipartFile> files) {
        DocumentRequest request = requestRepository.findByIdAndUser(requestId, userService.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to create upload directory", e);
        }

        List<RequestFile> saved = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String ext = getExtension(file.getOriginalFilename());
            String storedName = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
            Path dest = uploadPath.resolve(storedName);

            try {
                file.transferTo(dest.toFile());
            } catch (IOException e) {
                throw new UncheckedIOException("Failed to save file: " + file.getOriginalFilename(), e);
            }

            RequestFile entity = RequestFile.builder()
                    .documentRequest(request)
                    .fileName(file.getOriginalFilename())
                    .storedFileName(storedName)
                    .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .size(file.getSize())
                    .build();

            saved.add(fileRepository.save(entity));
        }

        return saved.stream().map(RequestFileResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<RequestFileResponse> getFiles(Long requestId) {
        validateRequestAccess(requestId);

        return fileRepository.findAllByDocumentRequest_Id(requestId).stream()
                .map(RequestFileResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public RequestFile getFile(Long requestId, Long fileId) {
        validateRequestAccess(requestId);

        return fileRepository.findByIdAndDocumentRequest_Id(fileId, requestId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
    }

    public Resource loadAsResource(RequestFile file) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(file.getStoredFileName());
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("File not found on disk");
            }
            return resource;
        } catch (Exception e) {
            throw new ResourceNotFoundException("File not found: " + e.getMessage());
        }
    }

    private DocumentRequest validateRequestAccess(Long requestId) {
        User currentUser = userService.getCurrentUser();
        if (currentUser.getRole() == Role.ADMIN) {
            return requestRepository.findById(requestId)
                    .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        } else {
            return requestRepository.findByIdAndUser(requestId, currentUser)
                    .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
