package com.finance.budget_tracker.controller;

import com.finance.budget_tracker.dto.category.CategoryRequest;
import com.finance.budget_tracker.dto.category.CategoryResponse;
import com.finance.budget_tracker.enums.CategoryType;
import com.finance.budget_tracker.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * POST /api/categories
     * Create a new category for the authenticated user.
     */
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        CategoryResponse response = categoryService.createCategory(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/categories
     * Get all categories (optionally filtered by type=INCOME or type=EXPENSE).
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(
            @RequestParam(required = false) CategoryType type,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<CategoryResponse> categories = (type != null)
                ? categoryService.getCategoriesByType(type, userDetails.getUsername())
                : categoryService.getAllCategories(userDetails.getUsername());

        return ResponseEntity.ok(categories);
    }

    /**
     * GET /api/categories/{id}
     * Get a single category by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        CategoryResponse response = categoryService.getCategoryById(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/categories/{id}
     * Update an existing category.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        CategoryResponse response = categoryService.updateCategory(id, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/categories/{id}
     * Delete a category.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        categoryService.deleteCategory(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
