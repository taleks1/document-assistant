package documentassistant.ocr;

import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
