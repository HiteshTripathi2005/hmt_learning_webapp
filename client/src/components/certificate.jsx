import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Certificate({ studentName, courseName, quizName, score, date }) {
  const certificateRef = useRef(null);

  const handleDownloadPDF = async () => {
    const certificate = certificateRef.current;
    if (!certificate) return;

    try {
      const canvas = await html2canvas(certificate, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `${studentName.replace(/\s+/g, "_")}_${courseName.replace(
          /\s+/g,
          "_"
        )}_Certificate.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handlePrint = () => {
    const certificateContent = certificateRef.current;
    if (!certificateContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printDocument = printWindow.document;
    printDocument.write(`
      <html>
        <head>
          <title>Certificate of Completion</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #f9f9f9;
            }
            .certificate-container {
              width: 100%;
              max-width: 900px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          ${certificateContent.outerHTML}
        </body>
      </html>
    `);

    printDocument.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="flex flex-col items-center">
      <Card className="w-full max-w-4xl p-1 mb-4" ref={certificateRef}>
        <div className="border-8 border-double border-amber-200 p-8 bg-white">
          <div className="text-center">
            <div className="text-3xl font-serif text-amber-800 mb-2">
              Certificate of Completion
            </div>
            <div className="text-lg text-gray-500 mb-8">
              This is to certify that
            </div>

            <div className="text-3xl font-bold mb-6 text-gray-800">
              {studentName}
            </div>

            <div className="text-lg text-gray-500 mb-2">
              has successfully completed
            </div>
            <div className="text-2xl font-bold mb-2 text-gray-800">
              {courseName}
            </div>
            <div className="text-xl mb-6 text-gray-700">Quiz: {quizName}</div>

            <div className="text-lg mb-8">
              with a score of{" "}
              <span className="font-bold text-amber-700">{score}%</span>
            </div>

            <div className="flex justify-between items-center mt-12 px-12">
              <div className="text-center">
                <div className="w-40 border-t border-gray-400 pt-1">Date</div>
                <div className="font-medium">{date}</div>
              </div>

              <div className="text-center">
                <div className="w-40 border-t border-gray-400 pt-1">
                  Signature
                </div>
                <div className="font-medium italic">Course Instructor</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex space-x-4">
        <Button onClick={handleDownloadPDF} className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="flex items-center"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>
    </div>
  );
}

export default Certificate;
