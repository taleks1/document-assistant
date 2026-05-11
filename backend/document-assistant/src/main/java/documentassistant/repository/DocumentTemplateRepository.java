package documentassistant.repository;

import documentassistant.model.entity.DocumentTemplate;
import documentassistant.model.enums.DocumentRequestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentTemplateRepository
        extends JpaRepository<DocumentTemplate, Long> {

    Optional<DocumentTemplate> findByIdAndActiveTrue(Long id);

    Optional<DocumentTemplate> findByType(DocumentRequestType type);
}