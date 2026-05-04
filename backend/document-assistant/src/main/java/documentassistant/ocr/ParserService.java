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

    public Map<String, Object> parseAndTranslate(String rawText) {
        String prompt = "You have raw text from a Macedonian ID card. Extract the fields into valid JSON using English keys only: name, surname, idNumber (the number under the photo - ALWAYS ONE LETTER + 7 DIGITS), embg (personal identification number), birthDate, issueDate, expiryDate, nationality, gender. " +
                "Use the English text from the card if available. If the values are in Macedonian, translate them into English when you extract them. " +
                "For more accurate data, compare the EMBG and birthDate - the first 7 numbers in the EMBG represent the date of birth in DDMMYYY format ( example birth date: 10.07.1994 -> 1007994...). " +
                "Then return a second JSON object with the same field values translated into Macedonian. " +
                "Return only valid JSON in the following structure:\n" +
                "{\n  \"fields_en\": { ... },\n  \"fields_mk\": { ... }\n}\n\n" +
                "Raw text:\n" + rawText;

        Map<String, Object> result = callGeminiApi(prompt);
        return validateFields(result);
    }

    private Map<String, Object> callGeminiApi(String prompt) {
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

        ResponseEntity<Map> response = restTemplate.postForEntity(urlWithKey, request, Map.class);
        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new RuntimeException("Gemini API call failed: " + response.getStatusCode());
        }

        try {
            Map<String, Object> data = response.getBody();
            Map<String, Object> candidate = ((List<Map<String, Object>>) data.get("candidates")).get(0);
            Map<String, Object> content = (Map<String, Object>) candidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String text = parts.get(0).get("text").toString();
            text = text.replaceAll("```json", "")
                       .replaceAll("```", "")
                       .trim();
            return objectMapper.readValue(text, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing Gemini response: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> validateFields(Map<String, Object> result) {
        Map<String, Object> fieldsEn = (Map<String, Object>) result.get("fields_en");

        if (fieldsEn != null) {
            String birthDate = (String) fieldsEn.get("birthDate");
            String issueDate = (String) fieldsEn.get("issueDate");
            String expiryDate = (String) fieldsEn.get("expiryDate");

            if (birthDate != null && !isValidDate(birthDate)) {
                System.out.println("Invalid birthDate: " + birthDate);
            }

            if (issueDate != null && !isValidDate(issueDate)) {
                System.out.println("Invalid issueDate: " + issueDate);
            }

            if (expiryDate != null && !isValidDate(expiryDate)) {
                System.out.println("Invalid expiryDate: " + expiryDate);
            }
        }

        return result;
    }

    private boolean isValidDate(String date) {
        if (date == null || !date.matches("\\d{2}\\.\\d{2}\\.\\d{4}")) {
            return false;
        }
        String[] parts = date.split("\\.");
        int day = Integer.parseInt(parts[0]);
        int month = Integer.parseInt(parts[1]);
        return day >= 1 && day <= 31 && month >= 1 && month <= 12;
    }
}
