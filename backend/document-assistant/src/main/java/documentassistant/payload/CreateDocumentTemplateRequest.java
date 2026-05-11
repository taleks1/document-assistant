package documentassistant.payload;

import com.fasterxml.jackson.databind.JsonNode;
import documentassistant.model.enums.DocumentRequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateDocumentTemplateRequest {

    @NotNull
    private DocumentRequestType type;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private Object schemaJson;
}