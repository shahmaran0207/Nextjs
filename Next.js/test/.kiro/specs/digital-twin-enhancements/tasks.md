# Implementation Plan: Digital Twin Enhancements

## Overview

This implementation plan breaks down the five enhancement features into discrete coding tasks following the priority order: Time-Axis Filtering → Layer Quality Enhancement → Status Dashboard → Spatial Search and Filtering → Event Impact Analysis. Each task builds incrementally on previous work, with property-based tests integrated throughout to validate correctness properties from the design document.

## Tasks

### Phase 1: Time-Axis Filtering (Simplest, High Value)

- [ ] 1. Set up utility modules and date handling
  - [x] 1.1 Create date utility module with parsing and comparison functions
    - Create `component/dt/utils/dateUtils.ts`
    - Implement date parsing, overlap detection, and ongoing status check functions
    - Use `dayjs` library for date operations
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 1.2 Write property tests for date utility functions
    - **Property 12: Date Range Overlap Detection**
    - **Property 13: Point-in-Interval Detection**
    - **Validates: Requirements 5.2, 5.3, 5.4**
    - Use fast-check to generate random date ranges and verify overlap logic
    - _Requirements: 5.2, 5.3, 5.4_

- [ ] 2. Implement Time Filter Module
  - [x] 2.1 Create TimeFilterModule with filtering logic
    - Create `component/dt/modules/TimeFilterModule.ts`
    - Implement `filterConstructionByDate` and `isProjectInRange` functions
    - Handle null dates and edge cases
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ]* 2.2 Write property tests for TimeFilterModule
    - **Property 5: Counting with Filter Conditions**
    - **Property 14: Filter-Cluster Data Flow**
    - **Validates: Requirements 5.5, 5.6**
    - Generate random construction datasets and filter configurations
    - Verify filtered count matches array length after filtering
    - _Requirements: 5.5, 5.6_

  - [ ]* 2.3 Write unit tests for edge cases
    - Test null start_date/end_date handling
    - Test start_date > end_date scenario
    - Test empty dataset filtering
    - _Requirements: 5.2, 5.3_

- [ ] 3. Create Time Filter UI components
  - [x] 3.1 Create useTimeFilter hook for state management
    - Create `component/dt/hooks/useTimeFilter.ts`
    - Implement state management with sessionStorage persistence
    - Return filtered construction data and visible count
    - _Requirements: 5.1, 5.5, 5.7_

  - [x] 3.2 Create TimeFilterPanel component
    - Create `component/dt/panels/TimeFilterPanel.tsx`
    - Implement date range inputs and ongoing toggle
    - Display filtered count in panel header
    - Style with dark theme matching existing panels
    - _Requirements: 5.1, 5.3, 5.5_

  - [ ]* 3.3 Write integration tests for time filter UI
    - Test date input changes trigger filtering
    - Test ongoing toggle behavior
    - Test sessionStorage persistence
    - _Requirements: 5.7_

- [ ] 4. Integrate Time Filter into TwinMap
  - [x] 4.1 Integrate TimeFilterPanel into TwinMap.tsx
    - Import and render TimeFilterPanel component
    - Pass filtered construction data to Supercluster
    - Verify clusters update correctly with filtered data
    - _Requirements: 5.6_

  - [ ]* 4.2 Write performance benchmark for time filtering
    - Test filtering performance with 10,000 construction projects
    - Verify completion within 500ms target
    - _Requirements: 5.8_

- [x] 5. Checkpoint - Phase 1 Complete
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Layer Quality Enhancement

- [ ] 6. Create color and icon utility functions
  - [x] 6.1 Create color utility module for progress-based colors
    - Create `component/dt/utils/colorUtils.ts`
    - Implement `getProgressColor(rate: number): [r, g, b, a]` function
    - Map progress rates to color scheme: 0-25% red, 26-50% orange, 51-75% yellow, 76-99% green, 100% blue
    - _Requirements: 4.1_

  - [ ]* 6.2 Write property tests for color mapping
    - **Property 9: Threshold-Based Classification (Progress Colors)**
    - **Validates: Requirements 4.1**
    - Generate random progress rates (0-100)
    - Verify assigned color matches threshold range
    - _Requirements: 4.1_

  - [x] 6.3 Extend iconUtils with configuration lookup functions
    - Modify `component/dt/utils/iconUtils.ts`
    - Add functions to retrieve icon URLs and labels from FIELD_CONFIG and THEME_CONFIG
    - _Requirements: 4.2, 4.3_

  - [ ]* 6.4 Write property tests for configuration lookup
    - **Property 10: Configuration Lookup Correctness**
    - **Validates: Requirements 4.2, 4.3**
    - Generate random field codes and category names (including invalid ones)
    - Verify returned values match config or default
    - _Requirements: 4.2, 4.3_

- [ ] 7. Enhance cluster layer renderers
  - [x] 7.1 Enhance createConstructionClusterLayers with progress colors
    - Modify `component/dt/layers/createClusterLayers.ts`
    - Apply `getProgressColor` to construction markers based on progress_rate
    - Update getFillColor function in construction layer
    - _Requirements: 4.1_

  - [x] 7.2 Enhance popup content for construction sites
    - Update hover handler in TwinMap.tsx for construction-layer
    - Include all required fields: project_name, field_code label, location_text, date range, progress_rate, plan_rate, budget_text, contact
    - Format with line breaks and emoji for readability
    - _Requirements: 4.4_

  - [ ]* 7.3 Write property tests for popup content generation
    - **Property 11: Content Inclusion in Generated Strings**
    - **Validates: Requirements 4.4, 4.5, 4.6**
    - Generate random data objects with varying null/non-null fields
    - Verify generated popup string contains all non-null required fields
    - _Requirements: 4.4, 4.5, 4.6_

  - [x] 7.4 Enhance popup content for tourism sites
    - Update hover handler in TwinMap.tsx for theme-layer
    - Include all required fields: content_name, category_name, place_name, district_name, address, operating_hours, closed_days, fee_info, phone
    - _Requirements: 4.5_

  - [x] 7.5 Enhance popup content for traffic links
    - Update hover handler in TwinMap.tsx for path-layer
    - Include link_id and current traffic speed
    - _Requirements: 4.6_

  - [ ]* 7.6 Write integration tests for popup rendering
    - Test popup render timing <100ms
    - Test popup positioning doesn't go off-screen
    - _Requirements: 4.7_

- [x] 8. Checkpoint - Phase 2 Complete
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Status Dashboard

- [ ] 9. Implement Dashboard Stats Module
  - [x] 9.1 Create DashboardStatsModule with calculation functions
    - Create `component/dt/modules/DashboardStatsModule.ts`
    - Implement `calculateStats` function for all dashboard metrics
    - Implement `getProjectsInViewport` for viewport filtering
    - Handle null/undefined values gracefully
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 9.2 Write property tests for counting and grouping
    - **Property 5: Counting with Filter Conditions**
    - **Property 6: Grouping Invariants**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.5, 2.6**
    - Generate random datasets with grouping keys
    - Verify sum of group counts equals total dataset size
    - Verify each group contains only matching items
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

  - [ ]* 9.3 Write property tests for average calculation
    - **Property 7: Average Calculation Bounds**
    - **Validates: Requirements 2.4**
    - Generate random numeric arrays (non-empty)
    - Verify average within [min, max] bounds
    - Verify uniform array average equals value
    - _Requirements: 2.4_

  - [ ]* 9.4 Write unit tests for edge cases
    - Test empty dataset handling (return zero counts)
    - Test null progress_rate/plan_rate (treat as 0)
    - Test division by zero scenarios
    - _Requirements: 2.1, 2.4_

- [ ] 10. Create Dashboard UI components
  - [x] 10.1 Create useDashboardStats hook
    - Create `component/dt/hooks/useDashboardStats.ts`
    - Use useMemo to avoid recalculation on every render
    - Implement debounced viewport updates (500ms)
    - _Requirements: 2.7_

  - [x] 10.2 Create DashboardPanel component
    - Create `component/dt/panels/DashboardPanel.tsx`
    - Display all statistics in grid layout with stat cards
    - Add hover effects and click handlers
    - Style with dark theme matching existing panels
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 10.3 Write integration tests for dashboard UI
    - Test viewport change triggers stats update within 500ms
    - Test clicking a stat filters the map
    - _Requirements: 2.7, 2.8_

- [ ] 11. Integrate Dashboard into TwinMap
  - [x] 11.1 Integrate DashboardPanel into TwinMap.tsx
    - Import and render DashboardPanel component
    - Wire up click handlers to filter map
    - Pass filtered data to dashboard
    - _Requirements: 2.8_

  - [ ]* 11.2 Write performance benchmark for dashboard calculations
    - Test stats calculation with 50,000 items
    - Verify completion within 500ms target
    - _Requirements: 2.7_

- [x] 12. Checkpoint - Phase 3 Complete
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Spatial Search and Filtering

- [ ] 13. Create spatial and search utility modules
  - [x] 13.1 Create spatial utility module with Haversine distance
    - Create `component/dt/utils/spatialUtils.ts`
    - Implement `haversineDistance` function for point-to-point distance
    - Implement `isWithinRadius` function
    - _Requirements: 1.4, 3.1, 3.4, 3.6_

  - [ ]* 13.2 Write property tests for spatial filtering
    - **Property 2: Spatial Radius Filtering**
    - **Validates: Requirements 1.4, 3.1, 3.4, 3.6**
    - Generate random center points, radii (100-2000), and point datasets
    - Verify all results within radius, no results outside radius
    - _Requirements: 1.4, 3.1, 3.4, 3.6_

  - [x] 13.3 Create search utility module with text normalization
    - Create `component/dt/utils/searchUtils.ts`
    - Implement text normalization (lowercase, trimming)
    - Implement search index building functions
    - _Requirements: 1.1, 1.2, 1.3, 1.6_

- [ ] 14. Implement Search Filter Module
  - [x] 14.1 Create SearchFilterModule with search functions
    - Create `component/dt/modules/SearchFilterModule.ts`
    - Implement `searchConstruction`, `searchTourism`, `searchBoundaries` functions
    - Implement pagination logic (50 items per page)
    - Combine text search with spatial filtering
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 14.2 Write property tests for text search
    - **Property 1: Text Search Correctness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.6**
    - Generate random datasets with varying text fields and search queries
    - Verify all results contain query substring (case-insensitive)
    - _Requirements: 1.1, 1.2, 1.3, 1.6_

  - [ ]* 14.3 Write property tests for multi-condition filtering
    - **Property 3: Multi-Condition Filter Intersection**
    - **Validates: Requirements 1.5**
    - Generate random datasets and combinations of filters
    - Verify multi-filter result equals intersection of individual filter results
    - _Requirements: 1.5_

  - [ ]* 14.4 Write property tests for pagination
    - **Property 4: Pagination Correctness**
    - **Validates: Requirements 1.7**
    - Generate random datasets (size 0-1000) and page numbers
    - Verify correct slice returned and correct page count
    - _Requirements: 1.7_

  - [ ]* 14.5 Write unit tests for edge cases
    - Test empty/whitespace-only search queries
    - Test invalid radius values (clamp to [100, 2000])
    - Test null coordinates handling
    - _Requirements: 1.4, 1.6_

- [ ] 15. Create Search UI components
  - [x] 15.1 Create useSearchFilter hook
    - Create `component/dt/hooks/useSearchFilter.ts`
    - Implement search state management with debouncing (300ms)
    - Build search index on mount and data changes
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 15.2 Create SearchPanel component
    - Create `component/dt/panels/SearchPanel.tsx`
    - Implement text input, district filter, field filter, date range, radius inputs
    - Display paginated results with Previous/Next buttons
    - Style with dark theme matching existing panels
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7_

  - [ ]* 15.3 Write integration tests for search UI
    - Test search input triggers filtering with debounce
    - Test result selection animates camera to location within 1s
    - Test pagination navigation
    - _Requirements: 1.7, 1.8_

- [ ] 16. Integrate Search into TwinMap
  - [x] 16.1 Integrate SearchPanel into TwinMap.tsx
    - Import and render SearchPanel component
    - Handle result selection with camera animation
    - Use setViewState with transitionDuration for smooth animation
    - _Requirements: 1.8_

  - [ ]* 16.2 Write performance benchmark for search operations
    - Test search with pagination on 10,000 items
    - Verify completion within 100ms target
    - _Requirements: 1.7_

- [x] 17. Checkpoint - Phase 4 Complete
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: Event Impact Analysis (Most Complex)

- [ ] 18. Extend spatial utilities for line distance calculations
  - [x] 18.1 Implement point-to-line distance functions
    - Extend `component/dt/utils/spatialUtils.ts`
    - Implement `pointToLineDistance` function
    - Implement `pointToSegmentDistance` helper function
    - _Requirements: 3.1, 3.4_

  - [ ]* 18.2 Write unit tests for point-to-line distance
    - Test distance to horizontal/vertical line segments
    - Test distance to diagonal line segments
    - Test point projection onto segment
    - _Requirements: 3.1, 3.4_

- [ ] 19. Implement Impact Analysis Module
  - [x] 19.1 Create ImpactAnalysisModule with spatial query functions
    - Create `component/dt/modules/ImpactAnalysisModule.ts`
    - Implement `analyzeConstructionImpact` and `analyzeTourismImpact` functions
    - Implement `findLinksWithinRadius` with spatial filtering
    - Implement `calculateCongestionLevel` with speed thresholds
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 19.2 Write property tests for congestion classification
    - **Property 9: Threshold-Based Classification (Congestion Level)**
    - **Validates: Requirements 3.5**
    - Generate random speeds (0-100 km/h)
    - Verify assigned congestion level matches threshold range
    - _Requirements: 3.5_

  - [ ]* 19.3 Write property tests for set union
    - **Property 8: Set Union Without Duplication**
    - **Validates: Requirements 3.7**
    - Generate random multiple selections
    - Verify result is union with no duplicates
    - _Requirements: 3.7_

  - [ ]* 19.4 Write unit tests for edge cases
    - Test empty link dataset handling
    - Test null coordinates (skip and log warning)
    - Test missing traffic data (mark as "no data")
    - _Requirements: 3.1, 3.3_

- [ ] 20. Optimize for large datasets with spatial indexing
  - [x] 20.1 Add R-tree spatial indexing for large link datasets
    - Install and integrate `rbush` library
    - Build R-tree index for link datasets >5000 items
    - Use bounding box pre-filter before precise distance calculation
    - _Requirements: 3.8_

  - [ ]* 20.2 Write performance benchmark for spatial queries
    - Test impact analysis with 1000 links
    - Verify completion within 1s target
    - _Requirements: 3.8_

- [ ] 21. Create Impact Analysis UI components
  - [x] 21.1 Create useImpactAnalysis hook
    - Create `component/dt/hooks/useImpactAnalysis.ts`
    - Implement site selection state management
    - Implement radius configuration (default 500m for construction, 300m for tourism)
    - Calculate impact results when site is selected
    - _Requirements: 3.1, 3.4, 3.6_

  - [x] 21.2 Create ImpactAnalysisPanel component
    - Create `component/dt/panels/ImpactAnalysisPanel.tsx`
    - Display selected site information
    - Display radius slider (100-2000m)
    - Display affected link count and average speed
    - Display congestion level indicator
    - Style with dark theme matching existing panels
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 21.3 Write integration tests for impact analysis UI
    - Test site selection triggers impact calculation
    - Test radius change updates affected links
    - Test multiple site selection aggregates results
    - _Requirements: 3.6, 3.7_

- [ ] 22. Integrate Impact Analysis into TwinMap
  - [x] 22.1 Integrate ImpactAnalysisPanel into TwinMap.tsx
    - Import and render ImpactAnalysisPanel component
    - Handle site selection from construction and tourism layers
    - Pass highlighted link IDs to PathLayer for gold highlighting
    - _Requirements: 3.2_

  - [x] 22.2 Add radius circle overlay for selected site
    - Create circle overlay layer showing impact radius
    - Display when site is selected
    - Update when radius changes
    - _Requirements: 3.6_

  - [x] 22.3 Enhance PathLayer to support impact highlighting
    - Modify `component/dt/layers/createBaseLayers.ts`
    - Add gold color for impact-highlighted links
    - Distinguish from existing link selection highlighting
    - _Requirements: 3.2_

  - [ ]* 22.4 Write integration tests for impact visualization
    - Test affected links highlighted in gold
    - Test radius circle displays correctly
    - Test multiple selections aggregate without duplication
    - _Requirements: 3.2, 3.7_

- [x] 23. Final Checkpoint - All Phases Complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows and performance targets
- Checkpoints ensure incremental validation at phase boundaries
- All code uses TypeScript with strict type checking
- All UI components follow the existing dark theme styling pattern
- Performance benchmarks use `performance.now()` for timing measurements

## Testing Framework Setup

Before starting implementation, ensure the following testing dependencies are installed:

```bash
npm install --save-dev fast-check @testing-library/react @testing-library/jest-dom jest
```

Configure Jest for property-based testing with minimum 100 iterations per test.
