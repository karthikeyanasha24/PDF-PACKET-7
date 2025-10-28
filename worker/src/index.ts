import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib'

export interface Env {
  // Define your environment variables here
}

interface ProjectData {
  projectName: string;
  submittedTo: string;
  preparedBy: string;
  date: string;
  projectNumber?: string;
  emailAddress: string;
  phoneNumber: string;
  product: string;
  status: {
    forReview: boolean;
    forApproval: boolean;
    forRecord: boolean;
    forInformationOnly: boolean;
  };
  submittalType: {
    tds: boolean;
    threePartSpecs: boolean;
    testReportIccEsr5194: boolean;
    testReportIccEsl1645: boolean;
    fireAssembly: boolean;
    fireAssembly01: boolean;
    fireAssembly02: boolean;
    fireAssembly03: boolean;
    msds: boolean;
    leedGuide: boolean;
    installationGuide: boolean;
    warranty: boolean;
    samples: boolean;
    other: boolean;
    otherText?: string;
  };
}

interface DocumentRequest {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface GeneratePacketRequest {
  projectData: ProjectData;
  documents: DocumentRequest[];
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (request.method === 'POST' && new URL(request.url).pathname === '/generate-packet') {
      try {
        const { projectData, documents }: GeneratePacketRequest = await request.json()

        console.log(`Generating packet for: ${projectData.projectName}`)
        console.log(`Processing ${documents.length} documents`)

        // Create new PDF document
        const finalPdf = await PDFDocument.create()

        // Add cover page
        await addCoverPage(finalPdf, projectData)

        let currentPageNumber = 2 // Start after cover page

        // Process each document
        for (const doc of documents) {
          try {
            console.log(`Processing: ${doc.name}`)

            // Add divider page
            await addDividerPage(finalPdf, doc.name, doc.type, currentPageNumber)
            currentPageNumber++

            // Fetch and merge PDF
            const pdfBytes = await fetchPDF(doc.url)
            if (pdfBytes) {
              const sourcePdf = await PDFDocument.load(pdfBytes)
              const pageIndices = sourcePdf.getPageIndices()

              // Copy pages one by one for better error handling
              for (let i = 0; i < pageIndices.length; i++) {
                try {
                  const [copiedPage] = await finalPdf.copyPages(sourcePdf, [pageIndices[i]])
                  finalPdf.addPage(copiedPage)
                  currentPageNumber++
                } catch (pageError) {
                  console.warn(`Failed to copy page ${i + 1} from ${doc.name}:`, pageError)
                  // Add error page instead
                  await addErrorPage(finalPdf, doc.name, `Page ${i + 1} could not be processed`)
                  currentPageNumber++
                }
              }

              console.log(`Successfully processed ${pageIndices.length} pages from ${doc.name}`)
            } else {
              // Add error page if PDF couldn't be loaded
              await addErrorPage(finalPdf, doc.name, 'Document could not be loaded')
              currentPageNumber++
            }
          } catch (docError) {
            console.error(`Error processing ${doc.name}:`, docError)
            await addErrorPage(finalPdf, doc.name, 'Document processing failed')
            currentPageNumber++
          }
        }

        // Add page numbers to all pages
        await addPageNumbers(finalPdf)

        // Generate final PDF
        const pdfBytes = await finalPdf.save()

        console.log(`Packet generated successfully: ${pdfBytes.length} bytes`)

        return new Response(pdfBytes, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${projectData.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Packet.pdf"`,
            'Content-Length': pdfBytes.length.toString(),
          },
        })

      } catch (error) {
        console.error('Error generating packet:', error)
        return new Response(JSON.stringify({
          error: 'Failed to generate packet',
          details: error instanceof Error ? error.message : 'Unknown error'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response('PDF Packet Generator Worker', {
      headers: corsHeaders,
    })
  },
}

async function fetchPDF(url: string): Promise<ArrayBuffer | null> {
  try {
    // Convert relative URL to properly encoded GitHub raw URL
    let fullUrl = url
    if (!url.startsWith('http')) {
      // Remove leading slash if present
      const cleanPath = url.startsWith('/') ? url.substring(1) : url
      // Properly encode the URL components
      const encodedPath = encodeURIComponent(cleanPath).replace(/%2F/g, '/')
      fullUrl = `https://raw.githubusercontent.com/karthikeyanasha24/pdf-packet-4/main/public/${encodedPath}`
    }

    console.log(`Fetching PDF from: ${fullUrl}`)

    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'PDF-Packet-Generator/1.0',
      }
    })

    if (!response.ok) {
      console.error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
      console.error(`URL attempted: ${fullUrl}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log(`PDF fetched successfully: ${arrayBuffer.byteLength} bytes`)
    return arrayBuffer
  } catch (error) {
    console.error(`Error fetching PDF from ${url}:`, error)
    return null
  }
}

async function addCoverPage(pdf: PDFDocument, projectData: ProjectData) {
  const page = pdf.addPage(PageSizes.Letter);
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const nexgenCyan = rgb(0, 0.6, 0.8); // NEXGEN cyan/teal color
  const darkGray = rgb(0.2, 0.2, 0.2);
  const mediumGray = rgb(0.4, 0.4, 0.4);
  const lightBlue = rgb(0.84, 0.9, 0.96); // Light blue for form backgrounds
  const borderGray = rgb(0.7, 0.7, 0.7);

  // NEXGEN Header (top left)
  page.drawText('NEXGEN', {
    x: 50,
    y: height - 50,
    size: 24,
    font: boldFont,
    color: nexgenCyan,
  });

  // Section identifier (top right)
  const sectionText = 'SECTION 06 16 26';
  const sectionWidth = font.widthOfTextAtSize(sectionText, 10);
  page.drawRectangle({
    x: width - 150,
    y: height - 60,
    width: 100,
    height: 20,
    color: nexgenCyan,
  });
  page.drawText(sectionText, {
    x: width - 145,
    y: height - 54,
    size: 10,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  // Title
  const titleY = height - 100;
  page.drawText('MAXTERRA® MgO Non-Combustible Structural', {
    x: 50,
    y: titleY,
    size: 12,
    font: font,
    color: darkGray,
  });
  page.drawText('Floor Panels Submittal Form', {
    x: 50,
    y: titleY - 15,
    size: 12,
    font: font,
    color: darkGray,
  });

  // Form fields start position
  let currentY = titleY - 50;
  const labelX = 50;
  const valueX = 200;
  const fieldHeight = 25;
  const fieldWidth = width - valueX - 50;

  // Helper function to draw form field
  const drawFormField = (label: string, value: string, y: number) => {
    // Label
    page.drawText(label, {
      x: labelX,
      y: y + 8,
      size: 10,
      font: font,
      color: darkGray,
    });

    // Background box
    page.drawRectangle({
      x: valueX,
      y: y,
      width: fieldWidth,
      height: fieldHeight,
      color: lightBlue,
      borderColor: borderGray,
      borderWidth: 0.5,
    });

    // Value text
    page.drawText(value || '', {
      x: valueX + 5,
      y: y + 8,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Bottom border line
    page.drawLine({
      start: { x: labelX, y: y },
      end: { x: valueX + fieldWidth, y: y },
      color: borderGray,
      thickness: 0.5,
    });
  };

  // Draw form fields
  drawFormField('Submitted To', projectData.submittedTo, currentY);
  currentY -= fieldHeight;

  drawFormField('Project Name', projectData.projectName, currentY);
  currentY -= fieldHeight;

  drawFormField('Project Number', projectData.projectNumber || '', currentY);
  currentY -= fieldHeight;

  drawFormField('Prepared By', projectData.preparedBy, currentY);
  currentY -= fieldHeight;

  drawFormField('Phone/Email', `${projectData.phoneNumber} / ${projectData.emailAddress}`, currentY);
  currentY -= fieldHeight;

  drawFormField('Date', projectData.date, currentY);
  currentY -= fieldHeight + 10;

  // Status/Action section with checkboxes
  page.drawText('Status / Action', {
    x: labelX,
    y: currentY,
    size: 10,
    font: boldFont,
    color: darkGray,
  });
  currentY -= 20;

  const checkboxSize = 12;
  const checkboxSpacing = 130;
  let checkboxX = valueX;

  const drawCheckbox = (label: string, checked: boolean, x: number, y: number) => {
    // Checkbox border
    page.drawRectangle({
      x: x,
      y: y,
      width: checkboxSize,
      height: checkboxSize,
      borderColor: borderGray,
      borderWidth: 1,
    });

    // Checkbox background if checked
    if (checked) {
      page.drawRectangle({
        x: x + 2,
        y: y + 2,
        width: checkboxSize - 4,
        height: checkboxSize - 4,
        color: nexgenCyan,
      });

      // X mark
      page.drawText('X', {
        x: x + 3,
        y: y + 2,
        size: 9,
        font: boldFont,
        color: rgb(1, 1, 1),
      });
    }

    // Label
    page.drawText(label, {
      x: x + checkboxSize + 5,
      y: y + 2,
      size: 9,
      font: font,
      color: darkGray,
    });
  };

  drawCheckbox('For Review', projectData.status.forReview, checkboxX, currentY);
  drawCheckbox('For Approval', projectData.status.forApproval, checkboxX + checkboxSpacing, currentY);
  currentY -= 18;
  drawCheckbox('For Record', projectData.status.forRecord, checkboxX, currentY);
  drawCheckbox('For Information Only', projectData.status.forInformationOnly, checkboxX + checkboxSpacing, currentY);

  currentY -= 30;

  // Submittal Type section
  page.drawText('Submittal Type (check all that apply)', {
    x: labelX,
    y: currentY,
    size: 10,
    font: boldFont,
    color: darkGray,
  });
  currentY -= 20;

  const submittalTypes = [
    { label: 'TDS', checked: projectData.submittalType.tds },
    { label: '3-Part Specs', checked: projectData.submittalType.threePartSpecs },
    { label: 'Test Report ICC-ESR 5194', checked: projectData.submittalType.testReportIccEsr5194 },
    { label: 'Test Report ICC-ESL 1645', checked: projectData.submittalType.testReportIccEsl1645 },
    { label: 'Fire Assembly', checked: projectData.submittalType.fireAssembly },
    { label: '  Fire Assembly 01', checked: projectData.submittalType.fireAssembly01 },
    { label: '  Fire Assembly 02', checked: projectData.submittalType.fireAssembly02 },
    { label: '  Fire Assembly 03', checked: projectData.submittalType.fireAssembly03 },
    { label: 'Material Safety Data Sheet (MSDS)', checked: projectData.submittalType.msds },
    { label: 'LEED Guide', checked: projectData.submittalType.leedGuide },
    { label: 'Installation Guide', checked: projectData.submittalType.installationGuide },
    { label: 'Warranty', checked: projectData.submittalType.warranty },
    { label: 'Samples', checked: projectData.submittalType.samples },
    { label: `Other: ${projectData.submittalType.otherText || ''}`, checked: projectData.submittalType.other },
  ];

  submittalTypes.forEach((type) => {
    drawCheckbox(type.label, type.checked, valueX, currentY);
    currentY -= 16;
  });

  currentY -= 10;

  // Product section
  page.drawText('Product:', {
    x: labelX,
    y: currentY,
    size: 10,
    font: boldFont,
    color: darkGray,
  });
  page.drawText(projectData.product, {
    x: valueX,
    y: currentY,
    size: 10,
    font: font,
    color: darkGray,
  });

  // Footer section
  const footerY = 120;
  page.drawText('NEXGEN® Building Products, LLC', {
    x: labelX,
    y: footerY,
    size: 9,
    font: boldFont,
    color: darkGray,
  });
  page.drawText('1504 Manhattan Ave West, #300 Brandon, FL 34205', {
    x: labelX,
    y: footerY - 12,
    size: 8,
    font: font,
    color: mediumGray,
  });
  page.drawText('(727) 634-5534', {
    x: labelX,
    y: footerY - 24,
    size: 8,
    font: font,
    color: mediumGray,
  });
  page.drawText('Technical Support: support@nexgenbp.com', {
    x: labelX,
    y: footerY - 36,
    size: 8,
    font: font,
    color: mediumGray,
  });

  // Version footer
  const versionText = 'Version 1.0 October 2025 © 2025 NEXGEN Building Products';
  const versionWidth = font.widthOfTextAtSize(versionText, 7);
  page.drawText(versionText, {
    x: width - versionWidth - 50,
    y: 50,
    size: 7,
    font: font,
    color: mediumGray,
  });
}

async function addDividerPage(pdf: PDFDocument, documentName: string, documentType: string, pageNumber: number) {
  const page = pdf.addPage(PageSizes.Letter)
  const { width, height } = page.getSize()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)

  const nexgenCyan = rgb(0, 0.6, 0.8);

  // Section header
  page.drawText('SECTION DIVIDER', {
    x: 50,
    y: height - 100,
    size: 16,
    font: boldFont,
    color: nexgenCyan,
  })

  // Document name
  page.drawText(documentName, {
    x: 50,
    y: height - 150,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  // Document type
  page.drawText(`Type: ${documentType}`, {
    x: 50,
    y: height - 180,
    size: 12,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  })

  // Page number
  page.drawText(`Page ${pageNumber}`, {
    x: 50,
    y: height - 200,
    size: 10,
    font: font,
    color: rgb(0.6, 0.6, 0.6),
  })
}

async function addErrorPage(pdf: PDFDocument, documentName: string, errorMessage: string) {
  const page = pdf.addPage(PageSizes.Letter)
  const { width, height } = page.getSize()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)

  // Error header
  page.drawText('DOCUMENT ERROR', {
    x: 50,
    y: height - 100,
    size: 16,
    font: boldFont,
    color: rgb(0.8, 0.2, 0.2),
  })

  // Document name
  page.drawText(documentName, {
    x: 50,
    y: height - 150,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  // Error message
  page.drawText(`Error: ${errorMessage}`, {
    x: 50,
    y: height - 180,
    size: 12,
    font: font,
    color: rgb(0.6, 0.2, 0.2),
  })

  // Instructions
  page.drawText('Please contact support if this error persists.', {
    x: 50,
    y: height - 220,
    size: 10,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  })
}

async function addPageNumbers(pdf: PDFDocument) {
  const pages = pdf.getPages()
  const font = await pdf.embedFont(StandardFonts.Helvetica)

  pages.forEach((page, index) => {
    const { width } = page.getSize()
    const pageNumber = index + 1

    page.drawText(`${pageNumber}`, {
      x: width - 50,
      y: 30,
      size: 10,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    })
  })
}
