package documentassistant.repository;

import documentassistant.model.entity.User;
import documentassistant.model.entity.UserIdentityDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserIdentityDocumentRepository extends JpaRepository<UserIdentityDocument, Long> {
    List<UserIdentityDocument> findAllByUserOrderByCreatedAtDesc(User user);
    Optional<UserIdentityDocument> findByIdAndUser(Long id, User user);
}
