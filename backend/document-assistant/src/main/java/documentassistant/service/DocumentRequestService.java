package documentassistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import documentassistant.exception.InvalidRequestStateException;
import documentassistant.exception.NoDocumentRequestsFoundException;
import documentassistant.exception.ResourceNotFoundException;
import documentassistant.model.entity.DocumentRequest;
import documentassistant.model.entity.DocumentTemplate;
import documentassistant.model.entity.StatusHistory;
import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.payload.CreateDocumentRequest;
import documentassistant.payload.DocumentRequestResponse;
import documentassistant.payload.UpdateDocumentRequest;
import documentassistant.repository.DocumentRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class DocumentRequestService {

    private final DocumentRequestRepository repository;
    private final ReferenceNumberGenerator referenceNumberGenerator;
    private final UserService userService;
    private final ObjectMapper objectMapper;
    public final DocumentTemplateService templateService;

    @Transactional
    public DocumentRequestResponse create(
            CreateDocumentRequest request
    ) {

        DocumentTemplate template =
                templateService.getActiveTemplate(
                        request.getTemplateId()
                );

        // FUTURE:
        // validate submittedData against schema

        DocumentRequest documentRequest =
                DocumentRequest.builder()
                        .referenceNumber(
                                referenceNumberGenerator.generate()
                        )
                        .user(userService.getCurrentUser())
                        .template(template)
                        .templateVersion(template.getVersion())
                        .templateSchemaSnapshot(
                                template.getSchemaJson()
                        )
                        .submittedData(
                                objectMapper.valueToTree(request.getSubmittedData())
                        )
                        .notes(
                                request.getNotes() == null
                                        ? null
                                        : request.getNotes().trim()
                        )
                        .status(DocumentRequestStatus.SUBMITTED)
                        .statusHistory(
                                new java.util.ArrayList<>(
                                        java.util.List.of(
                                                StatusHistory.builder()
                                                        .status(
                                                                DocumentRequestStatus.SUBMITTED
                                                        )
                                                        .timestamp(
                                                                java.time.Instant.now()
                                                        )
                                                        .note(
                                                                "Барањето е поднесено"
                                                        )
                                                        .build()
                                        )
                                )
                        )
                        .build();

        DocumentRequest saved =
                repository.save(documentRequest);

        return DocumentRequestResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<DocumentRequestResponse> getAll(Pageable pageable) {
        return repository.findAllByUser(userService.getCurrentUser(), pageable)
                .map(DocumentRequestResponse::from);
    }

    @Transactional(readOnly = true)
    public DocumentRequestResponse getById(Long id) {
        DocumentRequest request = repository.findByIdAndUser(id, userService.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        return DocumentRequestResponse.from(request);
    }

    @Transactional
    public DocumentRequestResponse update(Long id, UpdateDocumentRequest request) {
        DocumentRequest documentRequest = repository.findByIdAndUser(id, userService.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (documentRequest.getStatus() != DocumentRequestStatus.SUBMITTED) {
            throw new InvalidRequestStateException("Only requests in SUBMITTED status can be updated");
        }

        documentRequest.setSubmittedData(objectMapper.valueToTree(request.getSubmittedData()));
        documentRequest.setNotes(request.getNotes().trim());
        documentRequest.setNotes(
                request.getNotes() == null ? null : request.getNotes().trim()
        );

        DocumentRequest updated = repository.save(documentRequest);

        return DocumentRequestResponse.from(updated);
    }

    @Transactional
    public Page<DocumentRequestResponse> getRequestsByUserId(Integer userId, Pageable pageable) {

        userService.getUserById(userId);

        Page<DocumentRequest> requests = repository.findByUserId(userId, pageable);

        if (requests.isEmpty()) {
            throw new NoDocumentRequestsFoundException("No requests for the selected user found");
        }

        return requests.map(DocumentRequestResponse::from);
    }
}