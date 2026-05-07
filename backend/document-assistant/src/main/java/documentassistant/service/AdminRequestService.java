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

import java.util.List;

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

        request.setStatus(DocumentRequestStatus.APPROVED);
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

        request.setStatus(DocumentRequestStatus.REJECTED);
        request.setRejectionReason(reason);

        return DocumentRequestResponse.from(request);
    }

    private void validatePending(DocumentRequest request) {
        if (request.getStatus() != DocumentRequestStatus.SUBMITTED) {
            throw new InvalidRequestStateException("Only submitted requests can be processed");
        }
    }
}
