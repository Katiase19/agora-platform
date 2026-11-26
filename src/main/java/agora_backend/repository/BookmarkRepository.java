package agora_backend.repository;

import agora_backend.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    Optional<Bookmark> findByUserIdAndThreadId(Long userId, Long threadId);

    boolean existsByUserIdAndThreadId(Long userId, Long threadId);

    List<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Bookmark> findByThreadId(Long threadId);

    @Query("SELECT b.thread.id FROM Bookmark b WHERE b.user.id = :userId AND b.thread.id IN :threadIds")
    List<Long> findBookmarkedThreadIds(@Param("userId") Long userId, @Param("threadIds") Collection<Long> threadIds);

    @Modifying
    @Query("DELETE FROM Bookmark b WHERE b.thread.id = :threadId")
    void deleteByThreadId(@Param("threadId") Long threadId);
}
