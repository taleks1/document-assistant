package documentassistant.service;

import org.springframework.stereotype.Service;

// Returns the id of the currently logged-in user.
// TODO: Remove this when User model is implemented.
public class CurrentUserService {
    private static final Integer DEV_USER_ID = 1;

    public Integer getCurrentUserId() {
        return DEV_USER_ID;
    }
}
