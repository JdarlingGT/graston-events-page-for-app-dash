import { CheckInKiosk } from '@/components/instructor-workspace/check-in-kiosk';

export default function KioskPage({ params }: { params: { eventId: string } }) {
  return <CheckInKiosk eventId={params.eventId} />;
}