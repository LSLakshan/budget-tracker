package com.finance.budget_tracker.service;

import com.finance.budget_tracker.dto.budget.BudgetRequest;
import com.finance.budget_tracker.dto.budget.BudgetResponse;
import com.finance.budget_tracker.dto.category.CategoryRequest;
import com.finance.budget_tracker.dto.category.CategoryResponse;
import com.finance.budget_tracker.entity.Budget;
import com.finance.budget_tracker.entity.Category;
import com.finance.budget_tracker.entity.User;
import com.finance.budget_tracker.enums.CategoryType;
import com.finance.budget_tracker.exception.DuplicateResourceException;
import com.finance.budget_tracker.exception.ResourceNotFoundException;
import com.finance.budget_tracker.repository.CategoryRepository;
import com.finance.budget_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    // ─── Helper ───────────────────────────────────────────────────────────────

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getType());
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, String username) {
        User user = getUser(username);

        if (categoryRepository.existsByNameAndUserId(request.getName(), user.getId())) {
            throw new DuplicateResourceException("Category '" + request.getName() + "' already exists.");
        }

        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .user(user)
                .build();

        return toResponse(categoryRepository.save(category));
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(String username) {
        User user = getUser(username);
        return categoryRepository.findByUserId(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByType(CategoryType type, String username) {
        User user = getUser(username);
        return categoryRepository.findByUserIdAndType(user.getId(), type)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id, String username) {
        User user = getUser(username);
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return toResponse(category);
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request, String username) {
        User user = getUser(username);
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        // Check for name conflict only if name is changing
        if (!category.getName().equalsIgnoreCase(request.getName())
                && categoryRepository.existsByNameAndUserId(request.getName(), user.getId())) {
            throw new DuplicateResourceException("Category '" + request.getName() + "' already exists.");
        }

        category.setName(request.getName());
        category.setType(request.getType());
        return toResponse(categoryRepository.save(category));
    }

    // ─── Delete ───────────────────────────────────────────────────────────────

    @Transactional
    public void deleteCategory(Long id, String username) {
        User user = getUser(username);
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        categoryRepository.delete(category);
    }
}