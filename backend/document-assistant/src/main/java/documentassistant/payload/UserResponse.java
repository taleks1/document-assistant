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
public class UserResponse {
    private Integer id;
    private String firstname;
    private String lastname;
    private String email;
    private String role;
    private boolean isActive;
    @JsonFormat(pattern = "dd/MM/yyyy")
    @Schema(example = "01/01/2026")
    private LocalDate dateCreated;

    public static UserResponse from(final User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isActive(user.isActive())
                .dateCreated(user.getDateCreated())
                .build();
    }
}