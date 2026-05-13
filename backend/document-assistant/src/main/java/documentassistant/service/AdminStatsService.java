package documentassistant.service;

import documentassistant.model.entity.DailyDocumentRequestCounter;
import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.model.enums.DocumentRequestType;
import documentassistant.payload.AdminStatsResponse;
import documentassistant.repository.DailyDocumentRequestCounterRepository;
import documentassistant.repository.DocumentRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private static final List<DocumentRequestStatus> PROCESSING_STATUSES = List.of(
            DocumentRequestStatus.SUBMITTED,
            DocumentRequestStatus.IN_REVIEW,
            DocumentRequestStatus.REVIEWED
    );

    private final DocumentRequestRepository repository;
    private final DailyDocumentRequestCounterRepository dailyCounterRepository;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {

        // Overall counts
        long total = repository.count();
        long processing = repository.countByStatusIn(PROCESSING_STATUSES);
        long approved = repository.countByStatus(DocumentRequestStatus.APPROVED);
        long rejected = repository.countByStatus(DocumentRequestStatus.REJECTED);

        long processed = approved + rejected;

        double approvedRate = 0;
        double rejectedRate = 0;

        if (processed > 0) {
            approvedRate = (approved * 100.0) / processed;
            rejectedRate = (rejected * 100.0) / processed;
        }

        // This week: Monday → Sunday, per-day breakdown
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        // Initialize all days to 0
        Map<String, Long> thisWeek = new LinkedHashMap<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            thisWeek.put(day.name(), 0L);
        }
        
        List<DailyDocumentRequestCounter> weekCounters =
                dailyCounterRepository.findByDateBetween(startOfWeek, endOfWeek);
        for (DailyDocumentRequestCounter counter : weekCounters) {
            String dayName = counter.getDate().getDayOfWeek().name();
            thisWeek.put(dayName, counter.getLastSequence());
        }

        // By month
        LocalDate startMonth = today.minusMonths(5).withDayOfMonth(1);

        List<DailyDocumentRequestCounter> counters =
                dailyCounterRepository.findByDateBetween(startMonth, today);

        Map<String, Long> months = new LinkedHashMap<>();

        for (int i = 0; i < 6; i++) {
            LocalDate month = startMonth.plusMonths(i);
            String key = month.getMonth().name();
            months.put(key, 0L);
        }

        for (DailyDocumentRequestCounter c : counters) {
            String key = c.getDate().getMonth().name();
            months.put(key, months.get(key) + c.getLastSequence());
        }

        // Breakdown by type
        Map<DocumentRequestType, Long> byType = new EnumMap<>(DocumentRequestType.class);
        for (DocumentRequestType t : DocumentRequestType.values()) {
            byType.put(t, 0L);
        }
        for (Object[] row : repository.countGroupByType()) {
            DocumentRequestType type  = (DocumentRequestType) row[0];
            long count = (Long) row[1];
            byType.put(type, count);
        }

        return AdminStatsResponse.builder()
                .total(total)
                .processing(processing)
                .approved(approved)
                .rejected(rejected)
                .approvedRate(approvedRate)
                .rejectedRate(rejectedRate)
                .thisWeek(thisWeek)
                .byMonth(months)
                .byType(byType)
                .build();
    }
}
