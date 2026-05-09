package documentassistant.payload;

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
public class UpdateUserRequest {
    @Schema(example = "John")
    private String firstname;
    
    @Schema(example = "Doe")
    private String lastname;

    @Schema(example = "1234567890123")
    private String embg;
    
    @Schema(example = "Male")
    private String gender;
    
    @Schema(example = "Macedonian")
    private String nationality;
    
    @Schema(example = "+38970123456")
    private String phone;
    
    @Schema(example = "Skopje")
    private String city;

    private String address;
    
    @Schema(example = "A1234567")
    private String cardId;
    
    private LocalDate birthDate;
    
    private LocalDate cardIssueDate;
    
    private LocalDate cardExpiryDate;
}
