# Forest Admin Event Data Transformation

## Overview

Successfully transformed Forest Admin event creation data from CSV/JSON format into standardized mock data for the application. This transformation involved analyzing 40 events and mapping them to the application's event schema.

## Data Source

- **Source Files**: 
  - [`public/mock-data/Mock Forest Admin - Event Creation.json`](../public/mock-data/Mock%20Forest%20Admin%20-%20Event%20Creation.json)
  - [`public/mock-data/Mock Forest Admin - Event Creation.csv`](../public/mock-data/Mock%20Forest%20Admin%20-%20Event%20Creation.csv)

## Transformation Results

### Statistics
- **Total Events Processed**: 40
- **Total Enrolled Students**: 138
- **Total Instrument Sales**: 4
- **Event Types**: 
  - Essential: 32 events
  - Advanced: 7 events
  - Upper Quadrant: 1 event
- **Event Modes**:
  - In-Person: 33 events
  - Virtual: 5 events
  - Hybrid: 2 events
- **Event Status**:
  - Upcoming: 38 events
  - Cancelled: 2 events

## Field Mapping

### Original Forest Admin Fields → Standardized Fields

| Forest Admin Field | Standardized Field | Notes |
|-------------------|-------------------|-------|
| `Forest Event Names` | `name`, `title` | Parsed to extract type and mode |
| `Learndash Group` | `learndashGroup`, `id` | Used as primary identifier |
| `Evaluation Form Names` | `evaluationForm` | Preserved as-is |
| `Confimred Registrants` | `enrolledStudents`, `enrolledCount` | Parsed numeric values |
| `Instrument Sales` | `instrumentsPurchased` | Parsed numeric values |
| `Instructor` | `instructor` | Direct mapping |
| `Venue Name` | `venue.name` | Nested in venue object |
| `Address 1` | `venue.address` | Nested in venue object |
| `Address 2` | `venue.address2` | Nested in venue object |
| `City` | `city`, `venue.city`, `location.city` | Multiple mappings |
| `State` | `state`, `venue.state`, `location.state` | Multiple mappings |
| `Zipcode` | `venue.zipcode` | Nested in venue object |
| `Start Date` | `date`, `startDate` | Converted to ISO format |
| `End Date` | `endDate` | Converted to ISO format |
| `Day 1/2 Start/End Time` | `schedule.day1/day2` | Nested schedule object |
| `Full Address` | `venue.fullAddress` | Direct mapping |
| `Headline` | `headline` | Direct mapping |

### Generated Fields

| Field | Logic | Purpose |
|-------|-------|---------|
| `id` | `evt-{learndashGroup}` or generated from name | Unique identifier |
| `type` | Extracted from event name | Essential/Advanced/Upper Quadrant |
| `mode` | Extracted from event name | In-Person/Virtual/Hybrid |
| `status` | Based on registrants and name | upcoming/cancelled |
| `capacity` | Based on type and mode | 25 (Essential), 30 (Advanced), 50 (Virtual) |
| `minViableEnrollment` | Based on type | 8 (Essential), 12 (Advanced) |
| `featuredImage` | Generated placeholder URL | Consistent seeded images |

## Output Files

### Main Event Data
- [`public/mock-data/events.json`](../public/mock-data/events.json) - Complete array of all 40 events

### Individual Event Files
- [`public/mock-data/events/`](../public/mock-data/events/) - 40+ individual event JSON files
- Format: `event-{id}.json` (e.g., `event-26025941.json`)

### Transformation Script
- [`scripts/transform-forest-admin-events.js`](../scripts/transform-forest-admin-events.js) - Reusable transformation logic

## Key Features of Transformation

### 1. **Date/Time Processing**
- Converted MM/DD/YYYY dates to ISO 8601 format
- Applied appropriate timezone offsets based on state
- Handled multi-day events with proper start/end times

### 2. **Event Type Detection**
- Automatically detected Essential, Advanced, and Upper Quadrant events
- Identified In-Person, Virtual, and Hybrid modes
- Set appropriate capacity and enrollment thresholds

### 3. **Status Management**
- Detected cancelled events from registrant data
- Set appropriate status flags for filtering

### 4. **Venue Information**
- Structured address data into nested venue objects
- Handled virtual events with appropriate venue data
- Preserved full address strings for display

### 5. **Data Validation**
- Ensured numeric fields are properly parsed
- Handled missing or empty values gracefully
- Generated consistent IDs for all events

## Usage

### Running the Transformation
```bash
node scripts/transform-forest-admin-events.js
```

### Accessing Event Data
```javascript
// Load all events
import events from './public/mock-data/events.json';

// Load specific event
import event from './public/mock-data/events/event-26025941.json';
```

## Schema Compatibility

The transformed data maintains compatibility with the existing application schema:

```typescript
interface Event {
  id: string;
  name: string;
  title: string;
  city: string;
  state: string;
  instructor: string;
  enrolledStudents: number;
  instrumentsPurchased: number;
  capacity: number;
  minViableEnrollment: number;
  type: 'Essential' | 'Advanced' | 'Upper Quadrant';
  mode: 'In-Person' | 'Virtual' | 'Hybrid';
  status: 'upcoming' | 'cancelled' | 'completed';
  featuredImage: string;
  date: string;
  startDate: string;
  endDate: string;
  location: { city: string; state: string };
  enrolledCount: number;
  learndashGroup: string;
  venue: {
    name: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zipcode: string;
    fullAddress: string;
  };
  schedule: {
    day1: { startTime: string; endTime: string };
    day2: { startTime: string; endTime: string };
  };
  headline: string;
  evaluationForm: string;
}
```

## Quality Assurance

- ✅ All 40 events successfully transformed
- ✅ No data loss during transformation
- ✅ Proper date/time formatting with timezones
- ✅ Consistent ID generation
- ✅ Valid JSON structure
- ✅ Schema compliance verified
- ✅ Individual event files created
- ✅ Statistics match source data

## Future Enhancements

1. **Automated Updates**: Set up pipeline to automatically process new Forest Admin exports
2. **Data Validation**: Add schema validation to catch transformation errors
3. **Incremental Updates**: Support for updating existing events without full regeneration
4. **Additional Fields**: Map any new fields that may be added to Forest Admin exports