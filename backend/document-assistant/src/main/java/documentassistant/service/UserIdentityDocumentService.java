package documentassistant.service;

import documentassistant.exception.ResourceNotFoundException;
import documentassistant.model.entity.User;
import documentassistant.model.entity.UserIdentityDocument;
import documentassistant.payload.UserIdentityDocumentRequest;
import documentassistant.payload.UserIdentityDocumentResponse;
import documentassistant.repository.UserIdentityDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserIdentityDocumentService {

    private final UserIdentityDocumentRepository userIdentityDocumentRepository;
    private final UserService userService;

    @Transactional
    public UserIdentityDocumentResponse save(UserIdentityDocumentRequest request) {
        User user = userService.getCurrentUser();
        UserIdentityDocument doc = UserIdentityDocument.builder()
                .user(user)
                .documentType(request.getDocumentType())
                .documentNumber(request.getDocumentNumber())
                .issueDate(request.getIssueDate())
                .expiryDate(request.getExpiryDate())
                .build();
        return UserIdentityDocumentResponse.from(userIdentityDocumentRepository.save(doc));
    }

    @Transactional(readOnly = true)
    public List<UserIdentityDocumentResponse> getAll() {
        User user = userService.getCurrentUser();
        return userIdentityDocumentRepository.findAllByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(UserIdentityDocumentResponse::from)
                .toList();
    }

    @Transactional
    public UserIdentityDocumentResponse update(Long id, UserIdentityDocumentRequest request) {
        User user = userService.getCurrentUser();
        UserIdentityDocument doc = userIdentityDocumentRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        doc.setDocumentType(request.getDocumentType());
        doc.setDocumentNumber(request.getDocumentNumber());
        doc.setIssueDate(request.getIssueDate());
        doc.setExpiryDate(request.getExpiryDate());
        return UserIdentityDocumentResponse.from(userIdentityDocumentRepository.save(doc));
    }

    @Transactional
    public void delete(Long id) {
        User user = userService.getCurrentUser();
        UserIdentityDocument doc = userIdentityDocumentRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        userIdentityDocumentRepository.delete(doc);
    }
}
