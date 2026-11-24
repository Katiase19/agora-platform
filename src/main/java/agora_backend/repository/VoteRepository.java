package agora_backend.repository;

import agora_backend.entity.Vote;
import agora_backend.entity.VoteTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByUserIdAndTargetTypeAndTargetId(
            Long userId, VoteTargetType targetType, Long targetId
    );

    List<Vote> findByUserIdAndTargetTypeAndTargetIdIn(
            Long userId, VoteTargetType targetType, Collection<Long> targetIds
    );

    void deleteByUserIdAndTargetTypeAndTargetId(
            Long userId, VoteTargetType targetType, Long targetId
    );

    @Modifying
    @Query("DELETE FROM Vote v WHERE v.targetType = :targetType AND v.targetId IN :targetIds")
    void deleteByTargetTypeAndTargetIdIn(
            @Param("targetType") VoteTargetType targetType,
            @Param("targetIds") Collection<Long> targetIds
    );
}
