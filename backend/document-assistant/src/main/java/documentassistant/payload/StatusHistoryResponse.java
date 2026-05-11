package documentassistant.payload;

import documentassistant.model.entity.StatusHistory;
import documentassistant.model.enums.DocumentRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusHistoryResponse {

    private DocumentRequestStatus status;
    private Instant timestamp;
    private String note;

    public static StatusHistoryResponse from(StatusHistory history) {
        return StatusHistoryResponse.builder()
                .status(history.getStatus())
                .timestamp(history.getTimestamp())
                .note(history.getNote())
                .build();
    }
}
