import { NextResponse } from 'next/server';
import { jsPDF } from "jspdf";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rosterData = await request.json();
    const eventId = params.id;

    console.log(`--- Final Roster Submitted for Event: ${eventId} ---`);
    
    for (const student of rosterData) {
      if (student.attendance && student.skillsCheck === 'Passed') {
        console.log(`Processing certificate for ${student.studentName} (${student.studentId})`);
        
        // 1. Mock FluentCRM tag application
        console.log(`Applying 'Certificate_Issued' tag to student ${student.studentId}`);

        // 2. Dynamically generate a PDF certificate
        const doc = new jsPDF();
        
        // 2a. Choose template based on licenseType
        const licenseType = student.licenseType || "Professional";
        console.log(`Choosing certificate template for license type: ${licenseType}`);
        
        doc.setFontSize(22);
        doc.text("Certificate of Completion", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`(${licenseType} Edition)`, 105, 30, { align: "center" });
        doc.setFontSize(16);
        doc.text("This is to certify that", 105, 50, { align: "center" });
        doc.setFontSize(20);
        doc.text(student.studentName, 105, 65, { align: "center" });
        doc.setFontSize(16);
        doc.text(`has successfully completed the training.`, 105, 80, { align: "center" });
        
        const pdfOutput = doc.output('datauristring');
        
        // 3. Mock saving to R2 and attaching link to profile
        console.log(`Generated PDF for student ${student.studentId}. In a real app, this would be uploaded and linked.`);

        // 4. Mock sending email with certificate
        console.log(`Sending certificate email to ${student.studentEmail}`);
      }
    }

    console.log("--- End of Roster Processing ---");

    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: `Roster for event ${eventId} updated successfully.`,
      processed: rosterData.length,
    });
  } catch (error) {
    console.error("Failed to process roster update:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}