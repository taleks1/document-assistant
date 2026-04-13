package documentassistant.payload;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "First name is required")
    @Schema(example = "John")
    private String firstname;
    @NotBlank(message = "Last name is required")
    @Schema(example = "Doe")
    private String lastname;
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Schema(example = "johndoe@gmail.com")
    private String email;
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(example = "johndoe123")
    private String password;
}
