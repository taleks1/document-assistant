package documentassistant.bootstrap;

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
import org.springframework.stereotype.Component;

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

    @Override
    public void run(String @NonNull ... args){

        if (userRepository.count() > 0) {
            System.out.println("Database already seeded.");
            return;
        }

        seedUsers();
        seedTemplates();
        seedRequests();

        System.out.println("Database seeded successfully.");
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
                        .title("Building Permit")
                        .description("Request for construction permit.")
                        .fieldsJson("""
                                [
                                  {
                                    "name": "constructionAddress",
                                    "label": "Construction Address",
                                    "type": "text",
                                    "required": true
                                  },
                                  {
                                    "name": "parcelNumber",
                                    "label": "Parcel Number",
                                    "type": "text",
                                    "required": true
                                  }
                                ]
                                """)
                        .createdAt(Instant.now())
                        .build(),

                DocumentTemplate.builder()
                        .type(DocumentRequestType.COMPLAINT)
                        .title("Citizen Complaint")
                        .description("Official citizen complaint form.")
                        .fieldsJson("""
                                [
                                  {
                                    "name": "institution",
                                    "label": "Institution",
                                    "type": "text",
                                    "required": true
                                  },
                                  {
                                    "name": "details",
                                    "label": "Complaint Details",
                                    "type": "textarea",
                                    "required": true
                                  }
                                ]
                                """)
                        .createdAt(Instant.now())
                        .build(),

                DocumentTemplate.builder()
                        .type(DocumentRequestType.CERTIFICATE)
                        .title("Birth Certificate Request")
                        .description("Request issuance of a birth certificate.")
                        .fieldsJson("""
                                [
                                  {
                                    "name": "purpose",
                                    "label": "Purpose",
                                    "type": "text",
                                    "required": true
                                  }
                                ]
                                """)
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

        List<DocumentRequest> requests = List.of(

                DocumentRequest.builder()
                        .referenceNumber("REQ-2026-000001")
                        .user(citizen1)
                        .type(DocumentRequestType.PERMIT)
                        .title("Garage Construction Permit")
                        .description("Need approval for garage construction.")
                        .notes("Attached all required documentation.")
                        .status(DocumentRequestStatus.SUBMITTED)
                        .build(),

                DocumentRequest.builder()
                        .referenceNumber("REQ-2026-000002")
                        .user(citizen1)
                        .type(DocumentRequestType.COMPLAINT)
                        .title("Noise Complaint")
                        .description("Excessive noise during night hours.")
                        .notes("Occurred repeatedly.")
                        .status(DocumentRequestStatus.IN_REVIEW)
                        .build(),

                DocumentRequest.builder()
                        .referenceNumber("REQ-2026-000003")
                        .user(citizen2)
                        .type(DocumentRequestType.CERTIFICATE)
                        .title("Birth Certificate")
                        .description("Need birth certificate for university.")
                        .notes("Urgent processing requested.")
                        .status(DocumentRequestStatus.APPROVED)
                        .build(),

                DocumentRequest.builder()
                        .referenceNumber("REQ-2026-000004")
                        .user(citizen2)
                        .type(DocumentRequestType.OBJECTION)
                        .title("Parking Fine Objection")
                        .description("Objecting to unfair parking fine.")
                        .notes("Photos attached.")
                        .status(DocumentRequestStatus.REJECTED)
                        .rejectionReason("Insufficient evidence.")
                        .build()
        );

        requestRepository.saveAll(requests);
    }
}
