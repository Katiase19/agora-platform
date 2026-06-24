package agora_backend.repository;

import agora_backend.entity.Vote;
import agora_backend.entity.VoteTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByUserIdAndTargetTypeAndTargetId(
            Long userId, VoteTargetType targetType, Long targetId
    );

    void deleteByUserIdAndTargetTypeAndTargetId(
            Long userId, VoteTargetType targetType, Long targetId
    );
}