package agora_backend.repository;

import agora_backend.entity.Reply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReplyRepository extends JpaRepository<Reply, Long> {

    List<Reply> findByThreadIdOrderByVoteScoreDesc(Long threadId);

    List<Reply> findByAuthorId(Long authorId);
}