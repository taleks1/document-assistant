package documentassistant.ocr;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ParserService {

    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent";

    public Map<String, Object> parseWithGemini(String rawText) {
        RestTemplate restTemplate = new RestTemplate();

        String prompt = "Имам текст од македонска лична карта:\n" + rawText + 
                "\nИзвлечи ги полињата: name, surname, idNumber, birthDate, issueDate, expiryDate, nationality, gender. Врати само JSON.";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String bodyJson = "{ \"contents\": [ { \"parts\": [ { \"text\": \"" + prompt.replace("\"", "\\\"") + "\" } ] } ] }";

        // Add API key as query parameter
        String urlWithKey = GEMINI_URL + "?key=" + geminiApiKey;

        HttpEntity<String> request = new HttpEntity<>(bodyJson, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(urlWithKey, request, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Map<String, Object> data = (Map<String, Object>) response.getBody();
            try {
                Map<String, Object> candidate = ((java.util.List<Map<String, Object>>) data.get("candidates")).get(0);
                Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                java.util.List<Map<String, Object>> parts = (java.util.List<Map<String, Object>>) content.get("parts");

                String text = parts.get(0).get("text").toString();

                text = text.replaceAll("```json", "")
                        .replaceAll("```", "")
                        .trim();

                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                return mapper.readValue(text, Map.class);

            } catch (Exception e) {
                throw new RuntimeException("Error parsing Gemini response: " + e.getMessage());
            }
        } else {
            throw new RuntimeException("Gemini API call failed: " + response.getStatusCode());
        }
    }
}
