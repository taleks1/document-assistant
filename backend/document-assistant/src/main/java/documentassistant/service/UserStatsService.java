package documentassistant.service;

import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.payload.UserStatsResponse;
import documentassistant.repository.DocumentRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserStatsService {

    private static final List<DocumentRequestStatus> PROCESSING_STATUSES = List.of(
            DocumentRequestStatus.SUBMITTED,
            DocumentRequestStatus.IN_REVIEW,
            DocumentRequestStatus.REVIEWED
    );

    private final DocumentRequestRepository repository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public UserStatsResponse getStats() {
        var user = userService.getCurrentUser();

        long total = repository.countByUser(user);
        long processing = repository.countByUserAndStatusIn(user, PROCESSING_STATUSES);
        long approved = repository.countByUserAndStatus(user, DocumentRequestStatus.APPROVED);
        long rejected = repository.countByUserAndStatus(user, DocumentRequestStatus.REJECTED);

        return UserStatsResponse.builder()
                .total(total)
                .processing(processing)
                .approved(approved)
                .rejected(rejected)
                .build();
    }
}
