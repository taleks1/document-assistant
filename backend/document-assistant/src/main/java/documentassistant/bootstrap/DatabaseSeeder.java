package documentassistant.bootstrap;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import documentassistant.model.entity.DocumentRequest;
import documentassistant.model.entity.DocumentTemplate;
import documentassistant.model.entity.User;
import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.model.enums.DocumentRequestType;
import documentassistant.model.enums.Role;
import documentassistant.repository.DocumentRequestRepository;
import documentassistant.repository.DocumentTemplateRepository;
import documentassistant.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DocumentTemplateRepository templateRepository;
    private final DocumentRequestRepository requestRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String @NonNull ... args){

        if (userRepository.count() > 0) {
            System.out.println("Database already seeded. Resetting sequences...");
            resetSequences();
            return;
        }

        seedUsers();
        seedTemplates();
        seedRequests();
        resetSequences();

        System.out.println("Database seeded successfully.");
    }

    private void resetSequences() {
        try {
            entityManager.createNativeQuery("SELECT setval('document_requests_id_seq', COALESCE((SELECT MAX(id) FROM document_requests), 1), (SELECT MAX(id) FROM document_requests) IS NOT NULL)").getSingleResult();
            entityManager.createNativeQuery("SELECT setval('document_templates_id_seq', COALESCE((SELECT MAX(id) FROM document_templates), 1), (SELECT MAX(id) FROM document_templates) IS NOT NULL)").getSingleResult();
            entityManager.createNativeQuery("SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), (SELECT MAX(id) FROM users) IS NOT NULL)").getSingleResult();
            System.out.println("Sequences reset successfully.");
        } catch (Exception e) {
            System.err.println("Failed to reset sequences: " + e.getMessage());
        }
    }

    private JsonNode parseJson(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse JSON in seeder: " + json, e);
        }
    }

    private void seedUsers() {

        List<User> users = new ArrayList<>();

        User admin = User.builder()
                .firstname("Admin")
                .lastname("User")
                .email("admin@documentassistant.mk")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .dateCreated(LocalDate.now())
                .embg("0101990450001")
                .gender("Male")
                .nationality("Macedonian")
                .phone("070123456")
                .city("Skopje")
                .address("Partizanska bb")
                .cardId("A1234567")
                .birthDate(LocalDate.of(1990, 1, 1))
                .cardIssueDate(LocalDate.of(2020, 1, 1))
                .cardExpiryDate(LocalDate.of(2030, 1, 1))
                .build();

        User citizen1 = User.builder()
                .firstname("Aleksandar")
                .lastname("Jovanov")
                .email("aleksandar@example.com")
                .password(passwordEncoder.encode("password"))
                .role(Role.CITIZEN)
                .dateCreated(LocalDate.now())
                .embg("1205998450002")
                .gender("Male")
                .nationality("Macedonian")
                .phone("071222333")
                .city("Skopje")
                .address("Ilindenska 12")
                .cardId("B7654321")
                .birthDate(LocalDate.of(1998, 5, 12))
                .cardIssueDate(LocalDate.of(2021, 5, 12))
                .cardExpiryDate(LocalDate.of(2031, 5, 12))
                .build();

        User citizen2 = User.builder()
                .firstname("Marija")
                .lastname("Petrova")
                .email("marija@example.com")
                .password(passwordEncoder.encode("password"))
                .role(Role.CITIZEN)
                .dateCreated(LocalDate.now())
                .embg("2307991450003")
                .gender("Female")
                .nationality("Macedonian")
                .phone("075111222")
                .city("Bitola")
                .address("Shirok Sokak 5")
                .cardId("C998877")
                .birthDate(LocalDate.of(1991, 7, 23))
                .cardIssueDate(LocalDate.of(2019, 7, 23))
                .cardExpiryDate(LocalDate.of(2029, 7, 23))
                .build();

        users.add(admin);
        users.add(citizen1);
        users.add(citizen2);

        userRepository.saveAll(users);
    }

    private void seedTemplates(){

        List<DocumentTemplate> templates = List.of(

                DocumentTemplate.builder()
                        .type(DocumentRequestType.PERMIT)
                        .title("Градежна дозвола")
                        .description("Барање за добивање на градежна дозвола за објект.")
                        .schemaJson(parseJson("""
                                [
                                  {
                                    "name": "constructionAddress",
                                    "label": "Адреса на градење",
                                    "type": "text",
                                    "required": true
                                  },
                                  {
                                    "name": "parcelNumber",
                                    "label": "Број на парцела",
                                    "type": "text",
                                    "required": true
                                  }
                                ]
                                """))
                        .version(1)
                        .active(true)
                        .createdAt(Instant.now())
                        .build(),

                DocumentTemplate.builder()
                        .type(DocumentRequestType.COMPLAINT)
                        .title("Жалба од граѓани")
                        .description("Официјален формулар за поднесување жалба.")
                        .schemaJson(parseJson("""
                                [
                                  {
                                    "name": "institution",
                                    "label": "Институција",
                                    "type": "text",
                                    "required": true
                                  },
                                  {
                                    "name": "details",
                                    "label": "Детали на жалбата",
                                    "type": "textarea",
                                    "required": true
                                  }
                                ]
                                """))
                        .version(1)
                        .active(true)
                        .createdAt(Instant.now())
                        .build(),

                DocumentTemplate.builder()
                        .type(DocumentRequestType.CERTIFICATE)
                        .title("Извод од матична книга")
                        .description("Барање за издавање на извод од матична книга на родени.")
                        .schemaJson(parseJson("""
                                [
                                  {
                                    "name": "purpose",
                                    "label": "Цел на барањето",
                                    "type": "text",
                                    "required": true
                                  }
                                ]
                                """))
                        .version(1)
                        .active(true)
                        .createdAt(Instant.now())
                        .build()
        );

        templateRepository.saveAll(templates);
    }

    private void seedRequests() {

        User citizen1 = userRepository.findByEmail("aleksandar@example.com")
                .orElseThrow();

        User citizen2 = userRepository.findByEmail("marija@example.com")
                .orElseThrow();

        DocumentTemplate permitTemplate = templateRepository.findByType(DocumentRequestType.PERMIT).orElseThrow();
        DocumentTemplate complaintTemplate = templateRepository.findByType(DocumentRequestType.COMPLAINT).orElseThrow();
        DocumentTemplate certificateTemplate = templateRepository.findByType(DocumentRequestType.CERTIFICATE).orElseThrow();

        List<DocumentRequest> requests = List.of(

                DocumentRequest.builder()
                        .referenceNumber("REQ-2026-000001")
                        .user(citizen1)
                        .template(permitTemplate)
                        .templateVersion(permitTemplate.getVersion())
                        .templateSchemaSnapshot(permitTemplate.getSchemaJson())
                        .submittedData(parseJson("""
                                {
                                  "constructionAddress": "Партизанска 10, Скопје",
                                  "parcelNumber": "123/45"
                                }
                                """))
                        .notes("Приложена целата потребна документација.")
                        .status(DocumentRequestStatus.SUBMITTED)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build(),

                DocumentRequest.builder()
                        .referenceNumber("REQ-2026-000002")
                        .user(citizen1)
                        .template(complaintTemplate)
                        .templateVersion(complaintTemplate.getVersion())
                        .templateSchemaSnapshot(complaintTemplate.getSchemaJson())
                        .submittedData(parseJson("""
                                {
                                  "institution": "Општина Центар",
                                  "details": "Прекумерна бучава во ноќните часови."
                                }
                                """))
                        .notes("Се случува постојано.")
                        .status(DocumentRequestStatus.IN_REVIEW)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build(),

                DocumentRequest.builder()
                        .referenceNumber("REQ-2026-000003")
                        .user(citizen2)
                        .template(certificateTemplate)
                        .templateVersion(certificateTemplate.getVersion())
                        .templateSchemaSnapshot(certificateTemplate.getSchemaJson())
                        .submittedData(parseJson("""
                                {
                                  "purpose": "За упис на факултет"
                                }
                                """))
                        .notes("Потребно е итно процесирање.")
                        .status(DocumentRequestStatus.APPROVED)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build()
        );

        requestRepository.saveAll(requests);
    }
}
