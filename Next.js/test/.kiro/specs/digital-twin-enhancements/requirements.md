# Requirements Document

## Introduction

This document specifies requirements for enhancing the Digital Twin map system with five major features: spatial search/filtering, status dashboard, event impact analysis, layer quality improvements, and time-axis filtering. The Digital Twin system is built on DeckGL and MapLibre, displaying construction sites, tourist attractions, traffic links, and administrative boundaries with Supercluster-based clustering.

## Glossary

- **Digital_Twin_System**: The web-based 3D map visualization system built with DeckGL and MapLibre
- **Search_Module**: Component responsible for spatial search and filtering operations
- **Dashboard_Module**: Component displaying real-time statistics and aggregated data
- **Impact_Analyzer**: Component analyzing spatial relationships and event impacts
- **Layer_Renderer**: Component managing visual representation of map layers
- **Time_Filter**: Component filtering data based on temporal criteria
- **Construction_Data**: Dataset containing construction project information (location, progress, dates, budget)
- **Tourism_Data**: Dataset containing tourist attraction information (location, category, operating hours)
- **Link_Data**: Dataset containing traffic link information (road segments with traffic speed)
- **Boundary_Data**: Dataset containing administrative boundary polygons
- **Cluster_Manager**: Supercluster-based component managing point clustering at different zoom levels

## Requirements

### Requirement 1: Spatial Search and Filtering

**User Story:** As a map user, I want to search and filter locations by multiple criteria, so that I can quickly find relevant construction sites, tourist attractions, and administrative areas.

#### Acceptance Criteria

1. WHEN a user enters a district name (동 이름), THE Search_Module SHALL return all matching administrative boundaries and highlight them on the map
2. WHEN a user enters a construction project name, THE Search_Module SHALL return all matching construction sites and center the map on the results
3. WHEN a user enters a tourist attraction name, THE Search_Module SHALL return all matching tourism locations and display them with markers
4. WHEN a user specifies a center point and radius, THE Search_Module SHALL return all construction sites and tourist attractions within that radius
5. WHEN a user applies multiple filter conditions (district AND construction field AND date range), THE Search_Module SHALL return only items matching ALL conditions
6. THE Search_Module SHALL support partial text matching for all text-based searches
7. WHEN search results exceed 100 items, THE Search_Module SHALL paginate results with 50 items per page
8. WHEN a user selects a search result, THE Digital_Twin_System SHALL animate the camera to that location within 1 second

### Requirement 2: Status Dashboard

**User Story:** As a project manager, I want to view aggregated statistics on a dashboard, so that I can monitor overall construction progress and distribution patterns.

#### Acceptance Criteria

1. THE Dashboard_Module SHALL display the total count of ongoing construction projects (progress_rate < 100)
2. THE Dashboard_Module SHALL display construction counts grouped by field_code (F01-F08)
3. THE Dashboard_Module SHALL display construction counts grouped by district (동 이름)
4. THE Dashboard_Module SHALL display the average progress rate across all ongoing projects
5. THE Dashboard_Module SHALL display the count of projects behind schedule (progress_rate < plan_rate)
6. THE Dashboard_Module SHALL display the count of tourist attractions grouped by category_name
7. THE Dashboard_Module SHALL update all statistics within 500ms when the map viewport changes
8. WHEN a user clicks a dashboard statistic, THE Digital_Twin_System SHALL filter the map to show only relevant items

### Requirement 3: Event Impact Analysis

**User Story:** As a traffic analyst, I want to analyze the impact of construction sites on nearby roads and tourist areas, so that I can assess congestion risks and plan mitigation strategies.

#### Acceptance Criteria

1. WHEN a user selects a construction site, THE Impact_Analyzer SHALL identify all traffic links within a configurable radius (default 500m)
2. WHEN a user selects a construction site, THE Impact_Analyzer SHALL highlight affected traffic links in a distinct color (gold)
3. WHEN a user selects a construction site, THE Impact_Analyzer SHALL display the count of affected links and their average traffic speed
4. WHEN a user selects a tourist attraction, THE Impact_Analyzer SHALL identify all traffic links within a configurable radius (default 300m)
5. WHEN a user selects a tourist attraction, THE Impact_Analyzer SHALL calculate and display the average congestion level (based on traffic speed) around the attraction
6. THE Impact_Analyzer SHALL support radius values between 100m and 2000m
7. WHEN multiple construction sites are selected, THE Impact_Analyzer SHALL aggregate affected links without duplication
8. THE Impact_Analyzer SHALL complete spatial analysis and update the display within 1 second for up to 1000 links

### Requirement 4: Layer Quality Enhancement

**User Story:** As a map user, I want visually enhanced map layers with progress-based colors, category icons, and detailed popups, so that I can quickly understand the status and details of each location.

#### Acceptance Criteria

1. WHEN displaying construction sites, THE Layer_Renderer SHALL color-code markers based on progress_rate: red (0-25%), orange (26-50%), yellow (51-75%), green (76-99%), blue (100%)
2. WHEN displaying construction sites, THE Layer_Renderer SHALL display field-specific icons on markers according to field_code (F01-F08)
3. WHEN displaying tourist attractions, THE Layer_Renderer SHALL display category-specific icons according to category_name
4. WHEN a user hovers over a construction site marker, THE Layer_Renderer SHALL display a popup containing: project_name, field_code label, location_text, date range, progress_rate, plan_rate, budget_text, and contact
5. WHEN a user hovers over a tourist attraction marker, THE Layer_Renderer SHALL display a popup containing: content_name, category_name, place_name, district_name, address, operating_hours, closed_days, fee_info, and phone
6. WHEN a user hovers over a traffic link, THE Layer_Renderer SHALL display a popup containing: link_id and current traffic speed
7. THE Layer_Renderer SHALL render popup content within 100ms of hover event
8. THE Layer_Renderer SHALL ensure all icons are visible and distinguishable at zoom levels 12-18

### Requirement 5: Time-Axis Filtering

**User Story:** As a construction coordinator, I want to filter construction projects by date range and view only ongoing projects, so that I can focus on current activities and plan future work.

#### Acceptance Criteria

1. THE Time_Filter SHALL provide a date range selector with start_date and end_date inputs
2. WHEN a user selects a date range, THE Time_Filter SHALL display only construction projects where the project period overlaps the selected range
3. THE Time_Filter SHALL provide a toggle to show only ongoing projects (current date between start_date and end_date)
4. WHEN the "ongoing only" toggle is enabled, THE Time_Filter SHALL hide all completed and future projects
5. THE Time_Filter SHALL display the count of visible projects after filtering
6. WHEN date filters are applied, THE Cluster_Manager SHALL recalculate clusters based on the filtered dataset
7. THE Time_Filter SHALL persist filter settings in browser session storage
8. THE Time_Filter SHALL apply filters and update the map within 500ms for datasets up to 10,000 projects

## Implementation Priority

Based on implementation complexity and value delivery, the recommended order is:

1. **Requirement 5 (Time-Axis Filtering)** - Simplest to implement, high value for focusing on current work
2. **Requirement 4 (Layer Quality Enhancement)** - Builds on existing layer infrastructure, improves UX immediately
3. **Requirement 2 (Status Dashboard)** - Straightforward aggregation logic, provides valuable overview
4. **Requirement 1 (Spatial Search and Filtering)** - Moderate complexity, requires UI components and search logic
5. **Requirement 3 (Event Impact Analysis)** - Most complex, requires spatial algorithms and performance optimization

## Technical Context

- **Framework**: Next.js with TypeScript
- **Map Libraries**: DeckGL (layers), MapLibre (base map), Supercluster (clustering)
- **Main Component**: `TwinMap.tsx` manages all layers and state
- **Data Sources**: `constructionData`, `themeTravelData`, `linkData`, `boundaryData`
- **Existing Layers**: BoundaryLayer, PathLayer, BitClusterLayers, ConstructionClusterLayers, ThemeTravelClusterLayers
- **State Management**: React hooks (`useTwinMapFunction`)
