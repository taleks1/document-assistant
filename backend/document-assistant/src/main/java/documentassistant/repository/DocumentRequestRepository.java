package documentassistant.repository;

import documentassistant.model.entity.DocumentRequest;
import documentassistant.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {

    Page<DocumentRequest> findAllByUser(User user, Pageable page);

    Optional<DocumentRequest> findByIdAndUser(Long id, User user);
}
