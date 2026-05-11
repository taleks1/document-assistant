package documentassistant.service;

import documentassistant.exception.InvalidRequestStateException;
import documentassistant.exception.MissingRejectionReasonException;
import documentassistant.exception.ResourceNotFoundException;
import documentassistant.model.entity.DocumentRequest;
import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.payload.DocumentRequestResponse;
import documentassistant.repository.DocumentRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class AdminRequestService {

    private final DocumentRequestRepository repository;

    @Transactional(readOnly = true)
    public Page<DocumentRequestResponse> getAll(Pageable pageable) {
        return repository.findAll(pageable)
                .map(DocumentRequestResponse::from);
    }

    @Transactional(readOnly = true)
    public DocumentRequestResponse getById(Long id) {
        return repository.findById(id)
                .map(DocumentRequestResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
    }

    @Transactional
    public DocumentRequestResponse accept(Long id) {
        DocumentRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        validatePending(request);

        addStatusHistory(request, DocumentRequestStatus.APPROVED, "Барањето е одобрено од администратор.");
        request.setRejectionReason(null);

        return DocumentRequestResponse.from(request);
    }

    @Transactional
    public DocumentRequestResponse reject(Long id, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new MissingRejectionReasonException("Rejection reason is required");
        }

        DocumentRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        validatePending(request);

        addStatusHistory(request, DocumentRequestStatus.REJECTED, reason);
        request.setRejectionReason(reason);

        return DocumentRequestResponse.from(request);
    }

    @Transactional
    public DocumentRequestResponse updateStatus(Long id, DocumentRequestStatus status) {
        DocumentRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        validatePending(request);

        String statusNote = switch (status) {
            case APPROVED -> "Барањето е одобрено од администратор.";
            case REJECTED -> "Барањето е одбиено од администратор.";
            default -> null;
        };

        addStatusHistory(request, status, statusNote);

        return DocumentRequestResponse.from(request);
    }

    private void addStatusHistory(DocumentRequest request, DocumentRequestStatus newStatus, String note) {
        if (request.getStatus() != newStatus) {
            request.getStatusHistory().add(documentassistant.model.entity.StatusHistory.builder()
                    .status(newStatus)
                    .timestamp(java.time.Instant.now())
                    .note(note)
                    .build());
            request.setStatus(newStatus);
        }
    }


    private void validatePending(DocumentRequest request) {
        if (request.getStatus() == DocumentRequestStatus.APPROVED || request.getStatus() == DocumentRequestStatus.REJECTED) {
            throw new InvalidRequestStateException("Only submitted requests can be processed");
        }
    }
}
