package documentassistant.model.entity;

import documentassistant.model.enums.DocumentRequestStatus;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class StatusHistory {

    @Enumerated(EnumType.STRING)
    private DocumentRequestStatus status;

    private Instant timestamp;

    private String note;
}
