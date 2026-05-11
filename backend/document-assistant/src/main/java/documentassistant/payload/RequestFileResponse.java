package documentassistant.payload;

import documentassistant.model.entity.RequestFile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestFileResponse {

    private Long id;
    private String fileName;
    private String contentType;
    private Long size;
    private Instant uploadedAt;

    public static RequestFileResponse from(RequestFile file) {
        return RequestFileResponse.builder()
                .id(file.getId())
                .fileName(file.getFileName())
                .contentType(file.getContentType())
                .size(file.getSize())
                .uploadedAt(file.getUploadedAt())
                .build();
    }
}
