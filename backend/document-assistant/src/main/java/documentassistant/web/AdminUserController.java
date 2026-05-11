package documentassistant.web;

import documentassistant.model.entity.User;
import documentassistant.payload.DocumentRequestResponse;
import documentassistant.payload.UserResponse;
import documentassistant.service.DocumentRequestService;
import documentassistant.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;
    private final DocumentRequestService documentRequestService;


    @GetMapping()
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(userService.getAllUsers(PageRequest.of(page, size)).map(UserResponse::from));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Integer id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @GetMapping("/{id}/requests")
    public ResponseEntity<Page<DocumentRequestResponse>> getUserRequests(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                documentRequestService.getRequestsByUserId(id, PageRequest.of(page, size))
        );
    }
}
