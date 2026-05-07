package documentassistant.service;

import documentassistant.exception.ResourceNotFoundException;
import documentassistant.payload.DocumentTemplateResponse;
import documentassistant.repository.DocumentTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DocumentTemplateService {

    private final DocumentTemplateRepository repository;

    public DocumentTemplateResponse getByType(String type) {

        return repository.findByType(
                        Enum.valueOf(
                                documentassistant.model.enums.DocumentRequestType.class,
                                type
                        )
                )
                .map(DocumentTemplateResponse::from)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Template not found"));
    }
}