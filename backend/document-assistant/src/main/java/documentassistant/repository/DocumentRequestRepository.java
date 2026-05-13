package documentassistant.repository;

import documentassistant.model.entity.DocumentRequest;
import documentassistant.model.entity.User;
import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.model.enums.DocumentRequestType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {

    Page<DocumentRequest> findAllByUser(User user, Pageable page);

    Optional<DocumentRequest> findByIdAndUser(Long id, User user);

    Page<DocumentRequest> findByUserId(Integer citizenId, Pageable pageable);

    // ---- User stats ----

    long countByUser(User user);

    long countByUserAndStatusIn(User user, List<DocumentRequestStatus> statuses);

    long countByUserAndStatus(User user, DocumentRequestStatus status);

    // ---- Admin stats ----

    long countByStatusIn(List<DocumentRequestStatus> statuses);

    long countByStatus(DocumentRequestStatus status);

    @Query("SELECT r.type, COUNT(r) FROM DocumentRequest r GROUP BY r.type")
    List<Object[]> countGroupByType();
}
