package documentassistant.payload;

import documentassistant.model.entity.UserIdentityDocument;
import documentassistant.model.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserIdentityDocumentResponse {

    private Long id;
    private DocumentType documentType;
    private String documentNumber;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private Instant createdAt;

    public static UserIdentityDocumentResponse from(UserIdentityDocument doc) {
        return UserIdentityDocumentResponse.builder()
                .id(doc.getId())
                .documentType(doc.getDocumentType())
                .documentNumber(doc.getDocumentNumber())
                .issueDate(doc.getIssueDate())
                .expiryDate(doc.getExpiryDate())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
