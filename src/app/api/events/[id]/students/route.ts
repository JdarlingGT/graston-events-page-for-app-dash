import { NextRequest, NextResponse } from 'next/server';

// Mock student data with FluentCRM fields
const mockStudents = [
  {
    id: "student-1",
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://picsum.photos/100/100?random=1",
    licenseNumber: "RN123456789",
    providerType: "Registered Nurse",
    licenseState: "CA",
    datePurchased: "2024-01-15",
    preCourseCompleted: true,
    preCourseProgress: 100,
    crmId: "crm-001",
    tags: ["VIP", "Returning Student"],
    lastActivity: "2024-01-20"
  },
  {
    id: "student-2",
    name: "Bob Smith",
    email: "bob.smith@email.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://picsum.photos/100/100?random=2",
    licenseNumber: "MD987654321",
    providerType: "Medical Doctor",
    licenseState: "NY",
    datePurchased: "2024-01-18",
    preCourseCompleted: false,
    preCourseProgress: 65,
    crmId: "crm-002",
    tags: ["New Student"],
    lastActivity: "2024-01-22"
  },
  {
    id: "student-3",
    name: "Carol Davis",
    email: "carol.davis@email.com",
    phone: "+1 (555) 345-6789",
    avatar: "https://picsum.photos/100/100?random=3",
    licenseNumber: "NP456789123",
    providerType: "Nurse Practitioner",
    licenseState: "TX",
    datePurchased: "2024-01-20",
    preCourseCompleted: false,
    preCourseProgress: 30,
    crmId: "crm-003",
    tags: ["Early Bird", "Referral"],
    lastActivity: "2024-01-21"
  },
  {
    id: "student-4",
    name: "David Wilson",
    email: "david.wilson@email.com",
    phone: "+1 (555) 456-7890",
    avatar: "https://picsum.photos/100/100?random=4",
    licenseNumber: "PA789123456",
    providerType: "Physician Assistant",
    licenseState: "FL",
    datePurchased: "2024-01-22",
    preCourseCompleted: true,
    preCourseProgress: 100,
    crmId: "crm-004",
    tags: ["Corporate", "Group Discount"],
    lastActivity: "2024-01-23"
  },
  {
    id: "student-5",
    name: "Emma Brown",
    email: "emma.brown@email.com",
    phone: "+1 (555) 567-8901",
    avatar: "https://picsum.photos/100/100?random=5",
    licenseNumber: "RN321654987",
    providerType: "Registered Nurse",
    licenseState: "WA",
    datePurchased: "2024-01-25",
    preCourseCompleted: false,
    preCourseProgress: 85,
    crmId: "crm-005",
    tags: ["Scholarship", "Student"],
    lastActivity: "2024-01-26"
  }
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return NextResponse.json(mockStudents);
}