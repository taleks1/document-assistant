package documentassistant.ocr;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ParserService {

    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> parseWithGemini(String rawText) {

        String prompt = "Имам текст од македонска лична карта:\n" + rawText +
                "\nИзвлечи ги полињата: name, surname, idNumber, birthDate, issueDate, expiryDate, nationality, gender. Врати само JSON.";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        String urlWithKey = GEMINI_URL + "?key=" + geminiApiKey;

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(urlWithKey, request, Map.class);

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new RuntimeException("Gemini API call failed: " + response.getStatusCode());
        }

        try {
            Map<String, Object> data = response.getBody();

            Map<String, Object> candidate =
                    ((List<Map<String, Object>>) data.get("candidates")).get(0);

            Map<String, Object> content =
                    (Map<String, Object>) candidate.get("content");

            List<Map<String, Object>> parts =
                    (List<Map<String, Object>>) content.get("parts");

            String text = parts.get(0).get("text").toString();

            text = text.replaceAll("```json", "")
                       .replaceAll("```", "")
                       .trim();

            return objectMapper.readValue(text, Map.class);

        } catch (Exception e) {
            throw new RuntimeException("Error parsing Gemini response: " + e.getMessage(), e);
        }
    }
}
