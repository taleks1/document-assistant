package documentassistant.payload;

import documentassistant.model.entity.DocumentRequest;
import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.model.enums.DocumentRequestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentRequestResponse {

    private Long id;
    private String referenceNumber;
    private Integer userId;
    private String userFullName;
    private String userEmail;
    private DocumentRequestType type;
    private String title;
    private String description;
    private String notes;
    private DocumentRequestStatus status;
    private String rejectionReason;
    private Instant createdAt;
    private Instant updatedAt;

    public static DocumentRequestResponse from(DocumentRequest request) {
        return DocumentRequestResponse.builder()
                .id(request.getId())
                .referenceNumber(request.getReferenceNumber())
                .userId(request.getUser().getId())
                .userFullName(request.getUser().getFirstname() + " " + request.getUser().getLastname())
                .userEmail(request.getUser().getEmail())
                .type(request.getType())
                .title(request.getTitle())
                .description(request.getDescription())
                .notes(request.getNotes())
                .status(request.getStatus())
                .rejectionReason(request.getRejectionReason())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
