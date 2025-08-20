import { NextRequest, NextResponse } from 'next/server';

interface ForecastData {
  eventId: string;
  currentEnrollment: number;
  capacity: number;
  minViable: number;
  daysUntilEvent: number;
  historicalData: {
    similarEvents: number;
    averageEnrollmentRate: number;
    seasonalFactor: number;
  };
  predictions: {
    finalEnrollment: {
      predicted: number;
      confidence: number;
      range: { min: number; max: number };
    };
    enrollmentTrend: Array<{
      date: string;
      predicted: number;
      confidence: number;
    }>;
    riskAssessment: {
      level: 'low' | 'medium' | 'high' | 'critical';
      factors: string[];
      recommendations: string[];
    };
  };
}

// Simulate ML-based attendance forecasting
function generateAttendanceForecast(
  eventId: string,
  currentEnrollment: number,
  capacity: number,
  minViable: number,
  daysUntilEvent: number,
  eventType: string,
  location: string,
  instructor: string
): ForecastData {
  // Simulate historical analysis
  const similarEvents = Math.floor(Math.random() * 20) + 10;
  const averageEnrollmentRate = 0.75 + Math.random() * 0.2; // 75-95%
  const seasonalFactor = Math.sin((Date.now() / (1000 * 60 * 60 * 24 * 365)) * 2 * Math.PI) * 0.1 + 1;

  // Calculate enrollment velocity (enrollments per day)
  const enrollmentVelocity = currentEnrollment / Math.max(30 - daysUntilEvent, 1);
  
  // Predict final enrollment using multiple factors
  const baselinePrediction = currentEnrollment + (enrollmentVelocity * daysUntilEvent);
  const seasonalAdjustment = baselinePrediction * seasonalFactor;
  const historicalAdjustment = seasonalAdjustment * averageEnrollmentRate;
  
  const finalPrediction = Math.min(Math.max(historicalAdjustment, currentEnrollment), capacity);
  const confidence = Math.max(0.6, 1 - (daysUntilEvent / 60)); // Higher confidence closer to event
  
  // Generate enrollment trend
  const enrollmentTrend = [];
  for (let i = 0; i <= daysUntilEvent; i += Math.max(1, Math.floor(daysUntilEvent / 10))) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const progress = i / daysUntilEvent;
    const predicted = currentEnrollment + (finalPrediction - currentEnrollment) * progress;
    
    enrollmentTrend.push({
      date: date.toISOString().split('T')[0],
      predicted: Math.round(predicted),
      confidence: confidence * (0.8 + 0.2 * progress)
    });
  }

  // Risk assessment
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  const factors: string[] = [];
  const recommendations: string[] = [];

  if (finalPrediction < minViable * 0.7) {
    riskLevel = 'critical';
    factors.push('Predicted enrollment significantly below minimum viable');
    recommendations.push('Consider cancellation or intensive marketing campaign');
    recommendations.push('Reach out to past attendees for referrals');
  } else if (finalPrediction < minViable) {
    riskLevel = 'high';
    factors.push('Predicted enrollment below minimum viable');
    recommendations.push('Increase marketing efforts');
    recommendations.push('Consider early bird pricing or group discounts');
  } else if (finalPrediction < capacity * 0.6) {
    riskLevel = 'medium';
    factors.push('Moderate enrollment expected');
    recommendations.push('Maintain current marketing strategy');
    recommendations.push('Monitor enrollment velocity weekly');
  } else {
    riskLevel = 'low';
    factors.push('Strong enrollment predicted');
    recommendations.push('Prepare for potential capacity constraints');
    recommendations.push('Consider waitlist management');
  }

  // Add velocity-based factors
  if (enrollmentVelocity < 0.5) {
    factors.push('Low enrollment velocity detected');
    recommendations.push('Analyze marketing channel performance');
  }

  if (daysUntilEvent < 14 && finalPrediction < minViable) {
    factors.push('Limited time remaining for enrollment recovery');
    recommendations.push('Implement urgent marketing tactics');
  }

  return {
    eventId,
    currentEnrollment,
    capacity,
    minViable,
    daysUntilEvent,
    historicalData: {
      similarEvents,
      averageEnrollmentRate,
      seasonalFactor
    },
    predictions: {
      finalEnrollment: {
        predicted: Math.round(finalPrediction),
        confidence: Math.round(confidence * 100) / 100,
        range: {
          min: Math.round(finalPrediction * 0.8),
          max: Math.round(Math.min(finalPrediction * 1.2, capacity))
        }
      },
      enrollmentTrend,
      riskAssessment: {
        level: riskLevel,
        factors,
        recommendations
      }
    }
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = params.id;

    // In a real implementation, fetch event data from database
    // For now, simulate with mock data based on the events.json structure
    const mockEventData = {
      currentEnrollment: parseInt(searchParams.get('enrollment') || '15'),
      capacity: parseInt(searchParams.get('capacity') || '25'),
      minViable: parseInt(searchParams.get('minViable') || '8'),
      daysUntilEvent: parseInt(searchParams.get('daysUntil') || '21'),
      eventType: searchParams.get('type') || 'Essential',
      location: searchParams.get('location') || 'Indianapolis, IN',
      instructor: searchParams.get('instructor') || 'Mike Ploski'
    };

    // Simulate API processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const forecast = generateAttendanceForecast(
      eventId,
      mockEventData.currentEnrollment,
      mockEventData.capacity,
      mockEventData.minViable,
      mockEventData.daysUntilEvent,
      mockEventData.eventType,
      mockEventData.location,
      mockEventData.instructor
    );

    return NextResponse.json(forecast, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Forecast API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate attendance forecast' },
      { status: 500 }
    );
  }
}
