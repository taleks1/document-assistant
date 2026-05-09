package documentassistant.service;

import documentassistant.exception.EmailAlreadyExistsException;
import documentassistant.exception.UserNotFoundException;
import documentassistant.model.entity.User;
import documentassistant.payload.AuthenticationResponse;
import documentassistant.payload.ChangeEmailRequest;
import documentassistant.payload.ChangePasswordRequest;
import documentassistant.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public User getCurrentUser() {
        return (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }

    public User updateCurrentUser(documentassistant.payload.UpdateUserRequest request) {
        User user = getCurrentUser();

        if (request.getFirstname() != null) user.setFirstname(request.getFirstname());
        if (request.getLastname() != null) user.setLastname(request.getLastname());
        if (request.getEmbg() != null) user.setEmbg(request.getEmbg());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getNationality() != null) user.setNationality(request.getNationality());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCardId() != null) user.setCardId(request.getCardId());
        if (request.getBirthDate() != null) user.setBirthDate(request.getBirthDate());
        if (request.getCardIssueDate() != null) user.setCardIssueDate(request.getCardIssueDate());
        if (request.getCardExpiryDate() != null) user.setCardExpiryDate(request.getCardExpiryDate());

        return userRepository.save(user);
    }

    public AuthenticationResponse changeEmail(ChangeEmailRequest request) {
        User user = getCurrentUser();

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("This email is already in use.");
        }

        user.setEmail(request.getEmail());
        userRepository.save(user);

        String newToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(newToken)
                .role(user.getRole().name())
                .build();
    }

    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
