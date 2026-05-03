package documentassistant.service;

import documentassistant.exception.ResourceNotFoundException;
import documentassistant.payload.DocumentRequestResponse;
import documentassistant.repository.DocumentRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminRequestService {

    private final DocumentRequestRepository repository;

    @Transactional(readOnly = true)
    public List<DocumentRequestResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(DocumentRequestResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentRequestResponse getById(Long id) {
        return repository.findById(id)
                .map(DocumentRequestResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
    }
}
