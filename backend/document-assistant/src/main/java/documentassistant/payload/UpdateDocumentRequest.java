package documentassistant.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateDocumentRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 4000)
    private String description;

    @Size(max = 2000)
    private String notes;
}