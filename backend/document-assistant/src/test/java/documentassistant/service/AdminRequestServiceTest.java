package documentassistant.service;

import documentassistant.exception.ResourceNotFoundException;
import documentassistant.model.entity.DocumentRequest;
import documentassistant.model.entity.User;
import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.model.enums.DocumentRequestType;
import documentassistant.model.enums.Role;
import documentassistant.payload.DocumentRequestResponse;
import documentassistant.repository.DocumentRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminRequestServiceTest {

    @Mock
    private DocumentRequestRepository repository;

    @InjectMocks
    private AdminRequestService service;

    private User citizen1;
    private User citizen2;

    @BeforeEach
    void setUp() {
        citizen1 = User.builder()
                .id(1)
                .firstname("John")
                .lastname("Citizen")
                .email("john@example.com")
                .role(Role.CITIZEN)
                .build();

        citizen2 = User.builder()
                .id(2)
                .firstname("Jane")
                .lastname("Doe")
                .email("jane@example.com")
                .role(Role.CITIZEN)
                .build();
    }

    @Test
    void getAll_returnsAllRequests() {
        DocumentRequest r1 = buildRequest(1L, "Request A", citizen1);
        DocumentRequest r2 = buildRequest(2L, "Request B", citizen2);

        when(repository.findAll(PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(r1, r2)));

        Page<DocumentRequestResponse> result =
                service.getAll(PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(2);

        assertThat(result.getContent())
                .extracting(DocumentRequestResponse::getTitle)
                .containsExactly("Request A", "Request B");

        assertThat(result.getContent())
                .extracting(DocumentRequestResponse::getUserEmail)
                .containsExactly("john@example.com", "jane@example.com");
    }

    @Test
    void getById_returnsRequest_whenExists() {
        DocumentRequest request = buildRequest(5L, "Some Request", citizen1);
        when(repository.findById(5L)).thenReturn(Optional.of(request));

        DocumentRequestResponse response = service.getById(5L);

        assertThat(response.getId()).isEqualTo(5L);
        assertThat(response.getTitle()).isEqualTo("Some Request");
        assertThat(response.getUserEmail()).isEqualTo("john@example.com");
    }

    @Test
    void getById_throwsNotFound_whenIdDoesNotExist() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private DocumentRequest buildRequest(Long id, String title, User user) {
        Instant now = Instant.now();
        return DocumentRequest.builder()
                .id(id)
                .referenceNumber("REQ-03052026-00001")
                .user(user)
                .type(DocumentRequestType.APPLICATION)
                .title(title)
                .description("Some description")
                .status(DocumentRequestStatus.SUBMITTED)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }
}
