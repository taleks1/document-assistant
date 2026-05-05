package documentassistant.repository;

import documentassistant.model.entity.DocumentRequest;
import documentassistant.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {

    List<DocumentRequest> findAllByUser(User user);

    Optional<DocumentRequest> findByIdAndUser(Long id, User user);
}
