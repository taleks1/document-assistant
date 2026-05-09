package documentassistant.repository;

import documentassistant.model.entity.DocumentTemplate;
import documentassistant.model.enums.DocumentRequestType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentTemplateRepository
        extends JpaRepository<DocumentTemplate, Long> {

    Optional<DocumentTemplate> findByType(DocumentRequestType type);
}