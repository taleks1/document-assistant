package documentassistant.service;

import documentassistant.exception.ResourceNotFoundException;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

    @Test
    void getAll_returnsOnlyCurrentUserRequests() {
        DocumentRequest own1 = buildRequest(1L, "Permit A", mockUser);
        DocumentRequest own2 = buildRequest(2L, "Permit B", mockUser);
        when(userService.getCurrentUser()).thenReturn(mockUser);
        when(repository.findAllByUser(mockUser)).thenReturn(List.of(own1, own2));

        List<DocumentRequestResponse> result = service.getAll();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(DocumentRequestResponse::getTitle)
                .containsExactly("Permit A", "Permit B");
    }

    @Test
    void getById_returnsRequest_whenOwnedByUser() {
        DocumentRequest own = buildRequest(5L, "My Request", mockUser);
        when(userService.getCurrentUser()).thenReturn(mockUser);
        when(repository.findByIdAndUser(5L, mockUser)).thenReturn(Optional.of(own));

        DocumentRequestResponse response = service.getById(5L);

        assertThat(response.getId()).isEqualTo(5L);
        assertThat(response.getTitle()).isEqualTo("My Request");
    }

    @Test
    void getById_throwsNotFound_whenNotOwnedByUser() {
        when(userService.getCurrentUser()).thenReturn(mockUser);
        when(repository.findByIdAndUser(99L, mockUser)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getById_throwsNotFound_whenIdDoesNotExist() {
        when(userService.getCurrentUser()).thenReturn(mockUser);
        when(repository.findByIdAndUser(0L, mockUser)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(0L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private DocumentRequest buildRequest(Long id, String title, User user) {
        Instant now = Instant.now();
        return DocumentRequest.builder()
                .id(id)
                .referenceNumber("REQ-03052026-00001")
                .user(user)
                .type(DocumentRequestType.PERMIT)
                .title(title)
                .description("Some description")
                .status(DocumentRequestStatus.SUBMITTED)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }
}
