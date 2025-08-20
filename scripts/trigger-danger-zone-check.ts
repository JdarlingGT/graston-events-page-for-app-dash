import fetch from 'node-fetch';

async function triggerDangerZoneCheck() {
  const endpoint = process.env.DANGER_ZONE_ENDPOINT || 'http://localhost:3000/api/events/check-danger-zone';
  const token = process.env.CRON_SECRET || 'dev-secret';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log('Danger Zone Check Result:', result);
  } catch (error) {
    console.error('Failed to trigger danger zone check:', error);
    process.exit(1);
  }
}

triggerDangerZoneCheck();