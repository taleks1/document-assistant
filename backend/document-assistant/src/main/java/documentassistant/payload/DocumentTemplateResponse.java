package documentassistant.payload;


import documentassistant.model.entity.DocumentTemplate;
import documentassistant.model.enums.DocumentRequestType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentTemplateResponse {

    private Long id;
    private DocumentRequestType type;
    private String title;
    private String description;
    private String fieldsJson;

    public static DocumentTemplateResponse from(DocumentTemplate template) {
        return DocumentTemplateResponse.builder()
                .id(template.getId())
                .type(template.getType())
                .title(template.getTitle())
                .description(template.getDescription())
                .fieldsJson(template.getFieldsJson())
                .build();
    }
}