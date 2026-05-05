package documentassistant.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// One row per day. used by ReferenceNumberGenerator to hand out sequential numbers.
// We lock this row when we increment so two people submitting at the same time
// never get the same number.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "daily_document_request_counter")
public class DailyDocumentRequestCounter {

    @Id
    private LocalDate date;

    @Column(nullable = false)
    private long lastSequence;
}
