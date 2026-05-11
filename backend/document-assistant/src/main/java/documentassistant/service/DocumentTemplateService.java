package documentassistant.service;

import documentassistant.exception.ResourceNotFoundException;
import documentassistant.model.entity.DocumentTemplate;
import documentassistant.model.enums.DocumentRequestType;
import documentassistant.payload.CreateDocumentTemplateRequest;
import documentassistant.payload.DocumentTemplateResponse;
import documentassistant.repository.DocumentTemplateRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DocumentTemplateService {

    private final DocumentTemplateRepository repository;

    public DocumentTemplateResponse getByType(String type) {

        try {

            DocumentRequestType requestType =
                    DocumentRequestType.valueOf(type.toUpperCase());

            return repository.findByType(requestType)
                    .map(DocumentTemplateResponse::from)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Template not found"));

        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid template type");
        }
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
                .fieldsJson(request.getFieldsJson())
                .build();

        return DocumentTemplateResponse.from(
                repository.save(template)
        );
    }
}