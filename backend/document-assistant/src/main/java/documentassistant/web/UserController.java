package documentassistant.web;

import documentassistant.model.entity.User;
import documentassistant.payload.AuthenticationResponse;
import documentassistant.payload.ChangeEmailRequest;
import documentassistant.payload.ChangePasswordRequest;
import documentassistant.payload.FullUserResponse;
import documentassistant.payload.UpdateUserRequest;
import documentassistant.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<FullUserResponse> getAuthenticatedUser() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(FullUserResponse.from(user));
    }

    @PatchMapping("/me")
    public ResponseEntity<FullUserResponse> updateCurrentUser(@Valid @RequestBody UpdateUserRequest request) {
        User user = userService.updateCurrentUser(request);
        return ResponseEntity.ok(FullUserResponse.from(user));
    }

    @PostMapping("/change-email")
    public ResponseEntity<AuthenticationResponse> changeEmail(@Valid @RequestBody ChangeEmailRequest request) {
        return ResponseEntity.ok(userService.changeEmail(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok().build();
    }
}