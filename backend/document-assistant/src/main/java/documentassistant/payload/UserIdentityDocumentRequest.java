package documentassistant.payload;

import documentassistant.model.enums.DocumentType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserIdentityDocumentRequest {
    private DocumentType documentType;
    private String documentNumber;
    private LocalDate issueDate;
    private LocalDate expiryDate;
}
