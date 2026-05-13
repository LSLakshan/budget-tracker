package com.finance.budget_tracker.controller;

import com.finance.budget_tracker.dto.dashboard.DashboardResponse;
import com.finance.budget_tracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * GET /api/dashboard/summary
     * Returns: Total Income, Total Expenses, Current Balance (all-time).
     */
    @GetMapping("/summary")
    public ResponseEntity<DashboardResponse> getSummary(
            @AuthenticationPrincipal UserDetails userDetails) {

        DashboardResponse response = dashboardService.getDashboardSummary(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
