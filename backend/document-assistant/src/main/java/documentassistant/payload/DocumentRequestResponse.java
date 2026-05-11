package documentassistant.payload;

import com.fasterxml.jackson.databind.ObjectMapper;
import documentassistant.model.entity.DocumentRequest;
import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.model.enums.DocumentRequestType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Data
@Builder
public class DocumentRequestResponse {

    private static final ObjectMapper mapper = new ObjectMapper();

    private Long id;

    private String referenceNumber;

    private Integer userId;

    private String userFullName;

    private String userEmail;

    private Long templateId;

    private String templateTitle;

    private DocumentRequestType templateType;

    private Integer templateVersion;

    private Object submittedData;

    private String notes;

    private DocumentRequestStatus status;

    private String rejectionReason;

    private Instant createdAt;

    private Instant updatedAt;

    private List<StatusHistoryResponse> statusHistory;

    public static DocumentRequestResponse from(
            DocumentRequest request
    ) {

        return DocumentRequestResponse.builder()
                .id(request.getId())
                .referenceNumber(request.getReferenceNumber())
                .userId(request.getUser().getId())
                .userFullName(
                        request.getUser().getFirstname()
                                + " "
                                + request.getUser().getLastname()
                )
                .userEmail(request.getUser().getEmail())
                .templateId(request.getTemplate().getId())
                .templateTitle(request.getTemplate().getTitle())
                .templateType(request.getTemplate().getType())
                .templateVersion(request.getTemplateVersion())
                .submittedData(mapper.convertValue(request.getSubmittedData(), Object.class))
                .notes(request.getNotes())
                .status(request.getStatus())
                .rejectionReason(request.getRejectionReason())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .statusHistory(
                        request.getStatusHistory() != null
                                ? request.getStatusHistory()
                                .stream()
                                .map(StatusHistoryResponse::from)
                                .toList()
                                : Collections.emptyList()
                )
                .build();
    }
}