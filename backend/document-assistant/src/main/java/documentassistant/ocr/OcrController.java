package documentassistant.ocr;

import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/ocr")
public class OcrController {

    @Autowired
    private OcrService ocrService;

    @Autowired
    private ParserService parserService;

    @GetMapping("/parse")
    public ResponseEntity<Map<String, Object>> parseImage(@RequestParam String path) {
        try {
            String rawText = ocrService.extractTextFromImage(path);
            Map<String, Object> parsedFields = parserService.parseAndTranslate(rawText);
            return ResponseEntity.ok(Map.of(
                "rawText", rawText,
                "parsed", parsedFields
            ));
        } catch (TesseractException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> uploadAndParse(@RequestParam("file") MultipartFile file) {
        File tempFile = null;
        try {
            String suffix = "." + getExtension(file.getOriginalFilename());
            tempFile = File.createTempFile("ocr_", suffix);
            file.transferTo(tempFile);

            String rawText = ocrService.extractTextFromFile(tempFile);
            Map<String, Object> parsedFields = parserService.parseAndTranslate(rawText);
            return ResponseEntity.ok(Map.of(
                "rawText", rawText,
                "parsed", parsedFields
            ));
        } catch (TesseractException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process uploaded file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        } finally {
            if (tempFile != null) {
                tempFile.delete();
            }
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "tmp";
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
