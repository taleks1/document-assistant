package documentassistant.service;

import documentassistant.model.entity.DocumentRequest;
import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.payload.CreateDocumentRequest;
import documentassistant.payload.DocumentRequestResponse;
import documentassistant.repository.DocumentRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentRequestService {

    private final DocumentRequestRepository repository;
    private final ReferenceNumberGenerator referenceNumberGenerator;
    private final UserService userService;

    @Transactional
    public DocumentRequestResponse create(CreateDocumentRequest request) {
        DocumentRequest documentRequest = DocumentRequest.builder()
                .referenceNumber(referenceNumberGenerator.generate())
                .user(userService.getCurrentUser())
                .type(request.getType())
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .notes(request.getNotes() == null ? null : request.getNotes().trim())
                .status(DocumentRequestStatus.SUBMITTED)
                .build();

        DocumentRequest saved = repository.save(documentRequest);
        return DocumentRequestResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<DocumentRequestResponse> getAll() {
        return repository.findAllByUser(userService.getCurrentUser())
                .stream()
                .map(DocumentRequestResponse::from)
                .toList();
    }
}