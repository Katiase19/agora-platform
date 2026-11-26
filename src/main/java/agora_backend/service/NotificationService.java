package agora_backend.service;

import agora_backend.dto.response.NotificationResponse;
import agora_backend.entity.Notification;
import agora_backend.entity.NotificationType;
import agora_backend.entity.User;
import agora_backend.exception.ApiException;
import agora_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private static final int MAX_TITLE_LENGTH = 80;

    private final NotificationRepository notificationRepository;

    /** Creates a notification, unless the user caused it themselves. */
    public void notify(User recipient, User actor, NotificationType type, String message, Long threadId) {
        if (recipient == null || (actor != null && recipient.getId().equals(actor.getId()))) {
            return;
        }
        notificationRepository.save(Notification.builder()
                .recipient(recipient)
                .type(type)
                .message(message)
                .actorName(actor == null ? null : actor.getFirstName() + " " + actor.getLastName())
                .threadId(threadId)
                .isRead(false)
                .build());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(User user) {
        return notificationRepository.findTop50ByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    public NotificationResponse markRead(Long id, User user) {
        Notification notification = notificationRepository.findByIdAndRecipientId(id, user.getId())
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        notification.setIsRead(true);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    public void markAllRead(User user) {
        notificationRepository.markAllRead(user.getId());
    }

    public void deleteForThread(Long threadId) {
        notificationRepository.deleteByThreadId(threadId);
    }

    /** Shortens a thread title so it fits nicely in a notification. */
    public static String quote(String title) {
        String t = title == null ? "" : title.trim();
        if (t.length() > MAX_TITLE_LENGTH) {
            t = t.substring(0, MAX_TITLE_LENGTH - 1).trim() + "…";
        }
        return "\"" + t + "\"";
    }
}
