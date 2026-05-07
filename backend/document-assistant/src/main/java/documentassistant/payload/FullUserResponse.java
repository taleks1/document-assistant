package documentassistant.payload;

import com.fasterxml.jackson.annotation.JsonFormat;
import documentassistant.model.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FullUserResponse {
    private Integer id;
    private String firstname;
    private String lastname;
    private String email;
    private String role;
    private boolean isActive;
    @JsonFormat(pattern = "dd/MM/yyyy")
    @Schema(example = "01/01/2026")
    private LocalDate dateCreated;
    private String embg;
    private String gender;
    private String nationality;
    private String phone;
    private String city;
    private String address;
    private String cardId;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate birthDate;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate cardIssueDate;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate cardExpiryDate;

    public static FullUserResponse from(final User user) {
        return FullUserResponse.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isActive(user.isActive())
                .dateCreated(user.getDateCreated())
                .nationality(user.getNationality())
                .city(user.getCity())
                .phone(user.getPhone())
                .address(user.getAddress())
                .embg(user.getEmbg())
                .birthDate(user.getBirthDate())
                .cardId(user.getCardId())
                .gender(user.getGender())
                .cardIssueDate(user.getCardIssueDate())
                .cardExpiryDate(user.getCardExpiryDate())
                .build();
    }
}
