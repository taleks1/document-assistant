package documentassistant.payload;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateDocumentRequest {

    @NotNull(message = "Submitted data is required")
    private Object submittedData;

    @Size(max = 2000)
    private String notes;
}