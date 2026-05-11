package documentassistant.payload;


import com.fasterxml.jackson.databind.ObjectMapper;
import documentassistant.model.entity.DocumentTemplate;
import documentassistant.model.enums.DocumentRequestType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class DocumentTemplateResponse {

    private static final ObjectMapper mapper = new ObjectMapper();

    private Long id;
    private DocumentRequestType type;
    private String title;
    private String description;
    private Object schemaJson;
    private Integer version;
    private Boolean active;
    private Instant createdAt;

    public static DocumentTemplateResponse from(DocumentTemplate template) {
        return DocumentTemplateResponse.builder()
                .id(template.getId())
                .type(template.getType())
                .title(template.getTitle())
                .description(template.getDescription())
                .schemaJson(mapper.convertValue(template.getSchemaJson(), Object.class))
                .version(template.getVersion())
                .active(template.getActive())
                .createdAt(template.getCreatedAt())
                .build();
    }
}