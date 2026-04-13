package documentassistant.service;

import documentassistant.model.entity.User;
import documentassistant.model.enums.Role;
import documentassistant.model.entity.DocumentRequest;
import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.model.enums.DocumentRequestType;
import documentassistant.payload.CreateDocumentRequest;
import documentassistant.payload.DocumentRequestResponse;
import documentassistant.repository.DocumentRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentRequestServiceTest {

    @Mock
    private DocumentRequestRepository repository;

    @Mock
    private ReferenceNumberGenerator referenceNumberGenerator;

    @Mock
    private UserService userService;

    @InjectMocks
    private DocumentRequestService service;

    private CreateDocumentRequest request;
    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(42)
                .firstname("John")
                .lastname("Citizen")
                .email("john@example.com")
                .role(Role.CITIZEN)
                .build();

        request = CreateDocumentRequest.builder()
                .type(DocumentRequestType.PERMIT)
                .title("  Building Permit  ")
                .description("  Renovation of residential property.  ")
                .notes("  Urgent  ")
                .build();
    }

    @Test
    void create_assignsSubmittedStatusAndReferenceNumberAndUser() {
        when(referenceNumberGenerator.generate()).thenReturn("REQ-13042026-00001");
        when(userService.getCurrentUser()).thenReturn(mockUser);
        when(repository.save(any(DocumentRequest.class))).thenAnswer(invocation -> {
            DocumentRequest entity = invocation.getArgument(0);
            entity.setId(7L);
            Instant now = Instant.now();
            entity.setCreatedAt(now);
            entity.setUpdatedAt(now);
            return entity;
        });

        DocumentRequestResponse response = service.create(request);

        ArgumentCaptor<DocumentRequest> captor = ArgumentCaptor.forClass(DocumentRequest.class);
        verify(repository).save(captor.capture());
        DocumentRequest persisted = captor.getValue();

        assertThat(persisted.getReferenceNumber()).isEqualTo("REQ-13042026-00001");
        assertThat(persisted.getUser()).isEqualTo(mockUser);
        assertThat(persisted.getUser().getId()).isEqualTo(42);
        assertThat(persisted.getStatus()).isEqualTo(DocumentRequestStatus.SUBMITTED);
        assertThat(persisted.getType()).isEqualTo(DocumentRequestType.PERMIT);
        assertThat(persisted.getTitle()).isEqualTo("Building Permit");
        assertThat(persisted.getDescription()).isEqualTo("Renovation of residential property.");
        assertThat(persisted.getNotes()).isEqualTo("Urgent");

        assertThat(response.getId()).isEqualTo(7L);
        assertThat(response.getReferenceNumber()).isEqualTo("REQ-13042026-00001");
        assertThat(response.getStatus()).isEqualTo(DocumentRequestStatus.SUBMITTED);
        assertThat(response.getUserId()).isEqualTo(42);
        assertThat(response.getUserFullName()).isEqualTo("John Citizen");
        assertThat(response.getUserEmail()).isEqualTo("john@example.com");
    }

    @Test
    void create_handlesNullNotes() {
        request.setNotes(null);
        when(referenceNumberGenerator.generate()).thenReturn("REQ-13042026-00002");
        when(userService.getCurrentUser()).thenReturn(mockUser);
        when(repository.save(any(DocumentRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentRequestResponse response = service.create(request);

        assertThat(response.getNotes()).isNull();
    }
}
