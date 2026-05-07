package documentassistant.repository;

import documentassistant.model.entity.RequestFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RequestFileRepository extends JpaRepository<RequestFile, Long> {
    List<RequestFile> findAllByDocumentRequest_Id(Long requestId);
    Optional<RequestFile> findByIdAndDocumentRequest_Id(Long id, Long requestId);
}
