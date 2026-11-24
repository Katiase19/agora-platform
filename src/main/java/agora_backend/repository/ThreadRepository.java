package agora_backend.repository;

import agora_backend.entity.DiscussionThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThreadRepository extends JpaRepository<DiscussionThread, Long> {

    List<DiscussionThread> findAllByOrderByCreatedAtDesc();

    List<DiscussionThread> findByCourseTagIgnoreCaseOrderByCreatedAtDesc(String courseTag);

    List<DiscussionThread> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    @Query("SELECT t FROM DiscussionThread t WHERE " +
            "LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(t.body) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(t.courseTag) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY t.createdAt DESC")
    List<DiscussionThread> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT UPPER(t.courseTag) FROM DiscussionThread t " +
            "WHERE t.courseTag IS NOT NULL AND t.courseTag <> '' ORDER BY UPPER(t.courseTag)")
    List<String> findDistinctCourseTags();

    List<DiscussionThread> findTop20ByOrderByCreatedAtDesc();

    List<DiscussionThread> findTop20ByOrderByVoteScoreDesc();
}
