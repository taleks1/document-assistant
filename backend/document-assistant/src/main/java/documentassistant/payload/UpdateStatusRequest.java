package documentassistant.payload;

import documentassistant.model.enums.DocumentRequestStatus;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    private DocumentRequestStatus status;
}
