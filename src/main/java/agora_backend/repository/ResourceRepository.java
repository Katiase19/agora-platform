package agora_backend.repository;

import agora_backend.entity.Resource;
import agora_backend.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByCourseCode(String courseCode);

    List<Resource> findByResourceType(ResourceType resourceType);

    List<Resource> findByUploaderId(Long uploaderId);

    List<Resource> findByUploaderIdOrderByCreatedAtDesc(Long uploaderId);

    List<Resource> findAllByOrderByCreatedAtDesc();

    @Query("SELECT r FROM Resource r WHERE " +
            "LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.courseCode) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Resource> searchByKeyword(@Param("keyword") String keyword);

    List<Resource> findTop10ByOrderByDownloadCountDesc();

    List<Resource> findTop10ByOrderByCreatedAtDesc();
}