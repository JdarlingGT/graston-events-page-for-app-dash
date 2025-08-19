const fs = require('fs');
const path = require('path');

// Read the Forest Admin event data
const forestAdminData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/mock-data/Mock Forest Admin - Event Creation.json'), 'utf8')
);

// Helper function to parse date and create ISO string
function parseEventDate(dateStr, timeStr, state) {
  if (!dateStr || !timeStr) return new Date().toISOString();
  
  // Map states to timezone offsets (simplified)
  const timezoneMap = {
    'WI': '-05:00', 'AZ': '-07:00', 'IL': '-05:00', 'IN': '-05:00',
    'ME': '-04:00', 'OH': '-04:00', 'MA': '-04:00', 'FL': '-04:00',
    'CA': '-07:00', 'NJ': '-04:00', 'PA': '-04:00', 'IA': '-05:00',
    'NY': '-04:00', 'NV': '-07:00', 'GA': '-04:00', 'KS': '-05:00',
    'VA': '-04:00', 'CO': '-06:00', 'OR': '-07:00'
  };
  
  const timezone = timezoneMap[state] || '-05:00';
  const [month, day, year] = dateStr.split('/');
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':');
  
  let hour24 = parseInt(hours);
  if (period === 'PM' && hour24 !== 12) hour24 += 12;
  if (period === 'AM' && hour24 === 12) hour24 = 0;
  
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour24.toString().padStart(2, '0')}:${minutes}:00${timezone}`;
}

// Helper function to determine event status
function getEventStatus(registrants, eventName) {
  if (eventName.toLowerCase().includes('cancelled')) return 'cancelled';
  if (registrants === 'Cancelled') return 'cancelled';
  if (registrants === '' || registrants === '0' || registrants === 0) return 'upcoming';
  return 'upcoming';
}

// Helper function to extract event type and mode
function parseEventType(eventName) {
  const name = eventName.toLowerCase();
  
  let type = 'Essential';
  if (name.includes('advanced')) type = 'Advanced';
  if (name.includes('upper quadrant')) type = 'Upper Quadrant';
  
  let mode = 'In-Person';
  if (name.includes('virtual')) mode = 'Virtual';
  if (name.includes('hybrid')) mode = 'Hybrid';
  
  return { type, mode };
}

// Helper function to generate event ID
function generateEventId(learndashGroup, eventName) {
  if (learndashGroup && learndashGroup !== '') {
    return `evt-${learndashGroup}`;
  }
  
  // Generate ID from event name
  const cleanName = eventName.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 20);
  return `evt-${cleanName}`;
}

// Transform the data
const transformedEvents = forestAdminData.map((event, index) => {
  const { type, mode } = parseEventType(event['Forest Event Names']);
  const registrants = event['Confimred Registrants'] || 0;
  const instrumentSales = event['Instrument Sales'] || 0;
  
  // Parse numeric values
  const enrolledCount = typeof registrants === 'string' && registrants !== 'Cancelled' 
    ? parseInt(registrants) || 0 
    : typeof registrants === 'number' ? registrants : 0;
    
  const instrumentsPurchased = typeof instrumentSales === 'string' 
    ? parseInt(instrumentSales) || 0 
    : typeof instrumentSales === 'number' ? instrumentSales : 0;

  // Generate capacity based on type and mode
  let capacity = 25;
  if (mode === 'Virtual') capacity = 50;
  if (type === 'Advanced') capacity = 30;
  if (event['Forest Event Names'].toLowerCase().includes('onsite')) capacity = 20;

  const startDate = parseEventDate(event['Start Date'], event['Day 1 Start Time'], event['State']);
  const endDate = parseEventDate(event['End Date'] || event['Start Date'], event['Day 2 End Time'] || event['Day 1 End Time'], event['State']);

  return {
    id: generateEventId(event['Learndash Group'], event['Forest Event Names']),
    name: `${type} ${mode} | ${event['City'] || 'Online'}, ${event['State'] || 'Virtual'}`,
    title: `${type} ${mode} | ${event['City'] || 'Online'}, ${event['State'] || 'Virtual'}`,
    city: event['City'] || (mode === 'Virtual' ? 'Online' : ''),
    state: event['State'] || (mode === 'Virtual' ? 'Virtual' : ''),
    instructor: event['Instructor'] || 'TBA',
    enrolledStudents: enrolledCount,
    instrumentsPurchased: instrumentsPurchased,
    capacity: capacity,
    minViableEnrollment: type === 'Advanced' ? 12 : 8,
    type: type,
    mode: mode,
    status: getEventStatus(registrants, event['Forest Event Names']),
    featuredImage: `https://picsum.photos/seed/${generateEventId(event['Learndash Group'], event['Forest Event Names'])}/800/400`,
    date: startDate,
    startDate: startDate,
    endDate: endDate,
    location: { 
      city: event['City'] || (mode === 'Virtual' ? 'Online' : ''), 
      state: event['State'] || (mode === 'Virtual' ? 'Virtual' : '') 
    },
    enrolledCount: enrolledCount,
    learndashGroup: event['Learndash Group'] || '',
    venue: {
      name: event['Venue Name'] || (mode === 'Virtual' ? 'Virtual Platform' : ''),
      address: event['Address 1'] || '',
      address2: event['Address 2'] || '',
      city: event['City'] || '',
      state: event['State'] || '',
      zipcode: event['Zipcode'] || '',
      fullAddress: event['Full Address'] || ''
    },
    schedule: {
      day1: {
        startTime: event['Day 1 Start Time'] || '8:00 AM',
        endTime: event['Day 1 End Time'] || '6:00 PM'
      },
      day2: {
        startTime: event['Day 2 Start Time'] || '8:00 AM',
        endTime: event['Day 2 End Time'] || '6:00 PM'
      }
    },
    headline: event['Headline'] || `${type} ${mode} Training`,
    evaluationForm: event['Evaluation Form Names'] || ''
  };
});

// Write the transformed data
fs.writeFileSync(
  path.join(__dirname, '../public/mock-data/events.json'),
  JSON.stringify(transformedEvents, null, 2)
);

// Also create individual event files
const eventsDir = path.join(__dirname, '../public/mock-data/events');
if (!fs.existsSync(eventsDir)) {
  fs.mkdirSync(eventsDir, { recursive: true });
}

transformedEvents.forEach(event => {
  const filename = `event-${event.id.replace('evt-', '')}.json`;
  fs.writeFileSync(
    path.join(eventsDir, filename),
    JSON.stringify(event, null, 2)
  );
});

console.log(`✅ Transformed ${transformedEvents.length} events from Forest Admin data`);
console.log(`✅ Updated events.json with comprehensive event data`);
console.log(`✅ Created ${transformedEvents.length} individual event files`);

// Generate summary statistics
const stats = {
  total: transformedEvents.length,
  byType: {},
  byMode: {},
  byStatus: {},
  totalEnrolled: 0,
  totalInstruments: 0
};

transformedEvents.forEach(event => {
  stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
  stats.byMode[event.mode] = (stats.byMode[event.mode] || 0) + 1;
  stats.byStatus[event.status] = (stats.byStatus[event.status] || 0) + 1;
  stats.totalEnrolled += event.enrolledStudents;
  stats.totalInstruments += event.instrumentsPurchased;
});

console.log('\n📊 Event Statistics:');
console.log(`Total Events: ${stats.total}`);
console.log(`Total Enrolled: ${stats.totalEnrolled}`);
console.log(`Total Instruments: ${stats.totalInstruments}`);
console.log('\nBy Type:', stats.byType);
console.log('By Mode:', stats.byMode);
console.log('By Status:', stats.byStatus);