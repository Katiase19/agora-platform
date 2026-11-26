package agora_backend.entity;

public enum NotificationType {
    /** Someone replied to your thread. */
    NEW_REPLY,
    /** Someone replied to a thread you bookmarked. */
    BOOKMARKED_THREAD_REPLY,
    /** Your reply was accepted as the answer. */
    ANSWER_ACCEPTED,
    /** Someone upvoted your thread or reply. */
    UPVOTE
}
