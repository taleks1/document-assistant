package documentassistant.model.entity;

import com.fasterxml.jackson.databind.JsonNode;
import documentassistant.model.enums.DocumentRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "document_requests")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * Template used for this request.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_id")
    private DocumentTemplate template;

    /**
     * Immutable snapshot version.
     */
    @Column(nullable = false)
    private Integer templateVersion;

    /**
     * Snapshot of schema at submission time.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private JsonNode templateSchemaSnapshot;

    /**
     * Actual submitted citizen values.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private JsonNode submittedData;

    /**
     * Citizen additional notes.
     */
    @Column(length = 2000)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private DocumentRequestStatus status;

    @Column(length = 2000)
    private String rejectionReason;

    @ElementCollection
    @CollectionTable(
            name = "document_request_status_history",
            joinColumns = @JoinColumn(name = "request_id")
    )
    @Builder.Default
    private List<StatusHistory> statusHistory = new ArrayList<>();

    /**
     * Future-proofing.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    private Instant processedAt;

    /**
     * PDF/document path later.
     */
    private String generatedDocumentPath;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {

        Instant now = Instant.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = DocumentRequestStatus.SUBMITTED;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
