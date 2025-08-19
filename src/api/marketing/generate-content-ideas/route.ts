import { NextResponse } from 'next/server';

const mockIdeas = {
  'default': [
    { 'type': 'Headline', 'content': 'Unlock Your Potential: The Ultimate Guide to Advanced Techniques' },
    { 'type': 'Social Hook', 'content': "Stuck in a rut? Here are 3 signs you're ready to level up your skills. #ProTip" },
    { 'type': 'Email Subject', 'content': "Don't Get Left Behind. Master the Skills of Tomorrow." },
  ],
  'advanced training': [
    { 'type': 'Headline', 'content': 'Go Beyond the Basics: Master Advanced Training Techniques' },
    { 'type': 'Social Hook', 'content': 'Think you know it all? Our advanced course will challenge everything you thought you knew.' },
    { 'type': 'Email Subject', 'content': 'Exclusive Invitation: For Experts Only' },
  ],
  'essential training': [
    { 'type': 'Headline', 'content': 'Build a Strong Foundation with Our Essential Training Course' },
    { 'type': 'Social Hook', 'content': 'New to the field? Avoid these common mistakes with our essential training. #Beginner' },
    { 'type': 'Email Subject', 'content': 'Your First Step Towards Mastery Starts Here' },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic')?.toLowerCase() || 'default';
  
  let ideas = mockIdeas.default;
  if (topic.includes('advanced')) {
    ideas = mockIdeas['advanced training'];
  } else if (topic.includes('essential')) {
    ideas = mockIdeas['essential training'];
  }

  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate AI generation delay
  
  return NextResponse.json(ideas);
}