package documentassistant.web;

import documentassistant.payload.UserStatsResponse;
import documentassistant.service.UserStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/requests/stats")
@RequiredArgsConstructor
public class UserStatsController {

    private final UserStatsService userStatsService;

    @GetMapping
    public ResponseEntity<UserStatsResponse> getStats() {
        return ResponseEntity.ok(userStatsService.getStats());
    }
}
