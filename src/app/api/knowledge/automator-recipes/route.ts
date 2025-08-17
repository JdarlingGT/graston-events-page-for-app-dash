import { NextResponse } from 'next/server';

const mockRecipes = [
  { id: 101, name: 'New Student Welcome Sequence', description: 'Triggered on new WooCommerce order. Adds "New Student" tag and sends welcome email sequence.' },
  { id: 102, name: 'Pre-Course Reminder', description: 'Runs 7 days before an event. Sends a reminder to students who have not completed pre-course work.' },
  { id: 103, name: 'Course Completion Certificate', description: 'Triggered when a student completes a LearnDash course. Generates and emails a certificate.' },
  { id: 104, name: 'Danger Zone Alert', description: 'Runs daily. Checks for at-risk events and sends a Slack notification to the events team.' },
];

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return NextResponse.json(mockRecipes);
}