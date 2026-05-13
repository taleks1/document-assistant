package documentassistant.payload;

import documentassistant.model.enums.DocumentRequestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    // Overall counts
    private long total;
    private long processing;
    private long approved;
    private long rejected;
    private double approvedRate;
    private double rejectedRate;
    private Map<String, Long> thisWeek;
    private Map<String, Long> byMonth;
    private Map<DocumentRequestType, Long> byType;
}

