package documentassistant.model.entity;

import com.fasterxml.jackson.databind.JsonNode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import documentassistant.model.enums.DocumentRequestType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "document_templates")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * General category.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentRequestType type;

    /**
     * Citizen-visible title.
     */
    @Column(nullable = false)
    private String title;

    /**
     * Citizen-visible description/instructions.
     */
    @Column(nullable = false, length = 5000)
    private String description;

    /**
     * Dynamic form schema.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private JsonNode schemaJson;

    /**
     * Allows template evolution.
     */
    @Column(nullable = false)
    private Integer version;

    /**
     * Enables disabling templates.
     */
    @Column(nullable = false)
    private Boolean active;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {

        createdAt = Instant.now();

        if (version == null) {
            version = 1;
        }

        if (active == null) {
            active = true;
        }
    }
}