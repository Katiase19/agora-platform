package agora_backend.repository;

import agora_backend.entity.DiscussionThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThreadRepository extends JpaRepository<DiscussionThread, Long> {

    List<DiscussionThread> findByCourseTag(String courseTag);

    List<DiscussionThread> findByAuthorId(Long authorId);

    @Query("SELECT t FROM DiscussionThread t WHERE " +
            "LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(t.body) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<DiscussionThread> searchByKeyword(@Param("keyword") String keyword);

    List<DiscussionThread> findTop20ByOrderByCreatedAtDesc();

    List<DiscussionThread> findTop20ByOrderByVoteScoreDesc();
}