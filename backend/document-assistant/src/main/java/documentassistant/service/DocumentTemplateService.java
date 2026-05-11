package documentassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import documentassistant.exception.ResourceNotFoundException;
import documentassistant.model.entity.DocumentTemplate;
import documentassistant.payload.CreateDocumentTemplateRequest;
import documentassistant.payload.DocumentTemplateResponse;
import documentassistant.repository.DocumentTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DocumentTemplateService {

    private final DocumentTemplateRepository repository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public DocumentTemplate getActiveTemplate(Long id) {

        return repository.findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Template not found"
                        )
                );
    }

    @Transactional
    public DocumentTemplateResponse create(CreateDocumentTemplateRequest request) {

        if (repository.findByType(request.getType()).isPresent()) {
            throw new IllegalArgumentException("Template already exists");
        }

        DocumentTemplate template = DocumentTemplate.builder()
                .type(request.getType())
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .schemaJson(objectMapper.valueToTree(request.getSchemaJson()))
                .build();

        return DocumentTemplateResponse.from(
                repository.save(template));
    }
}