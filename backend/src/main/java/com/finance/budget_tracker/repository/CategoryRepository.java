package com.finance.budget_tracker.repository;

import com.finance.budget_tracker.entity.Category;
import com.finance.budget_tracker.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // All categories for a specific user
    List<Category> findByUserId(Long userId);

    // Filter by type (income or expense) for a specific user
    List<Category> findByUserIdAndType(Long userId, CategoryType type);

    // prevent duplicate category names for the same user
    boolean existsByNameAndUserId(String name, Long userId);

    // find one category by id and user id
    Optional<Category> findByIdAndUserId(Long id, Long userId);

}

