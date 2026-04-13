package documentassistant.repository;

import documentassistant.model.entity.DailyDocumentRequestCounter;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyDocumentRequestCounterRepository
        extends JpaRepository<DailyDocumentRequestCounter, LocalDate> {

    // Must be called inside a @Transactional method.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from DailyDocumentRequestCounter c where c.date = :date")
    Optional<DailyDocumentRequestCounter> findByDateForUpdate(@Param("date") LocalDate date);
}
