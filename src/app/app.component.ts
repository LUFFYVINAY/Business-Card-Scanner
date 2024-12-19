import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ExportService } from './services/export.services';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx'; // Ensure this import is present for XLSX operations
import { ScannerComponent } from './scanner/scanner.component';
import { SharedService } from './shared.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, CommonModule, FormsModule, ScannerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ExportService, ScannerComponent]
})
export class AppComponent implements OnInit {



  @ViewChild('userTable', { static: false }) userTable!: ElementRef; // Use ViewChild to access the table

  
  originalFileName: string | null = null; // Track original file name
  newEntry = {
    name: '',
    company: '',
    phone: '',
    email: '',
    address: ''
  };
  data: any[] = [];
  editIndex: number | null = null; // Track the index for editing

  // Dynamic styles
  titleColor = '#333'; // Dynamic title color
  buttonColor = '#007bff'; // Button color for add entry
  extractedTextBack :string ='';
  extractedTextFront : string ='';
  isScanning = false;
  isImageUploaded = false;
  isTextExtracted = false;
  imagePreview: string | null = null;
  extractedText: string = '';
  isFormVisible = false;
  isTableVisible = false;
  imageSrc :string | null = null;
  isExtracting : boolean =false;
  extractedWords: string | null = null;
  
 

  // Inject both ExportService and SharedService into the constructor
  constructor(
    private exportService: ExportService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    console.log('Image Source:', this.imageSrc);
    // Subscribe to extracted text from SharedService
    this.sharedService.currentData.subscribe(data => {
      this.extractedText = data; // Update the form with the extracted text
    });
  }

  // Handle the file input change
  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }

    const file = target.files[0];
    this.originalFileName = file.name; // Capture the original file name
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const data: Uint8Array = new Uint8Array(e.target.result);
      const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      // Convert the sheet to JSON while skipping the header row
      const jsonData: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Filter out empty rows and skip the header
      this.data = jsonData
        .slice(1)
        .filter((row: any[]) => row.some(cell => cell !== null && cell !== ''))
        .map((row: any[]) => ({
          srNo: row[0], // We'll keep this for reference
          name: row[1],
          company: row[2],
          phone: row[3],
          email: row[4],
          address: row[5],
        }));

      // Ensure the first column is the Serial Number column
      this.updateSerialNumbers();
    };

    reader.readAsArrayBuffer(file);
  }
  onDataExtractedFront(extractedData: any) {
    this.extractedTextFront = extractedData; // Store the front data
    this.newEntry.name = extractedData.name || '';
  
    this.newEntry.phone = extractedData.phoneNumber || '';
    this.newEntry.email = extractedData.email || '';
    this.newEntry.address = extractedData.address || '';
  }
  onDataExtractedBack(extractedData: any) {
    this.extractedTextBack = extractedData; // Store the back data
    this.newEntry.company = extractedData.companyName || '';
    // You can choose to populate more fields if needed for the back side
    // For now, you could display it in a textarea or label in the template
  }

  
  // Update onSubmit method (without Serial Number)
  /*onSubmit() {
    if (this.editIndex !== null) {
     
      this.data[this.editIndex] = { ...this.newEntry };
      this.editIndex = null;
    } else {
      // Add a new entry
      this.data.push({ ...this.newEntry });
    }
    
    this.newEntry = {
      name: '',
      company: '',
      phone: '',
      email: '',
      address: ''
    };
  }*/




    onImageCaptured(image: string) {
      this.imageSrc = image;
    }
    
    onSubmit() {
      if (this.editIndex !== null) {
        // Update existing entry
        this.data[this.editIndex] = { ...this.newEntry }; // Update with newEntry data
        this.editIndex = null; // Reset editIndex after updating
      } else {
        // Add new entry
        this.data.push({ ...this.newEntry });
      }
      this.newEntry = { name: '', company: '', phone: '', email: '', address: '' }; // Reset the form
      this.hideForm(); // Hide form after submission
      this.showTable(); // Show the table again
    }
  

  showForm() {
    this.isFormVisible = true;
    this.isTableVisible = false; // Hide table when showing form
  }

  hideForm() {
    this.isFormVisible = false;
  }

  showTable() {
    this.isTableVisible = true;
  }
  // Set entry for editing
  // editEntry(index: number) {
  //   this.editIndex = index;
  //   const row = this.data[index];
  //   this.newEntry = {
  //     name: row.name,
  //     company: row.company,
  //     phone: row.phone,
  //     email: row.email,
  //     address: row.address,
  //   };
  // }

  // Delete entry
  // deleteEntry(index: number) {
  //   this.data.splice(index, 1);
  //   this.updateSerialNumbers(); // Update Serial Numbers after deletion
  //   this.saveExcel(); // Update the Excel file
  // }

  // Update Serial Numbers
  updateSerialNumbers() {
    this.data.forEach((row: any, idx: number) => {
      row.srNo = idx + 1; // Automatically assign the serial number based on the row index
    });
  }

  // Save Excel file
  saveExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Save the file using the original file name
    if (this.originalFileName) {
      XLSX.writeFile(wb, this.originalFileName); // Save using the same file name
    } else {
      alert('Original file not found. Please upload a file to save changes.');
    }
  }

  // Export table to Excel
  exportElmToExcel() {
    this.exportService.exportTableElmToExcel(this.userTable, this.originalFileName || 'exported_data');
  }

  updateFormWithExtractedData(data: any) {
    const newRow = {
      srNo: null, // Serial Number will be generated automatically
      name: this.newEntry.name,
      company: this.newEntry.company,
      phone: this.newEntry.phone,
      email: this.newEntry.email,
      address: this.newEntry.address,
    };

    this.newEntry.name = data.name || '';
    this.newEntry.company = data.companyName || '';
    this.newEntry.phone = data.phoneNumber || '';
    this.newEntry.email = data.email || '';
    this.newEntry.address = data.address || '';
    this.extractedWords =JSON.stringify(data);
  }

  // Edit and delete methods remain the same
  editEntry(index: number) {
    this.editIndex = index; // Set the index of the entry to be edited
    this.newEntry = { ...this.data[index] }; // Populate form with the entry data
    this.showForm(); // Show the form for editing
  }

  deleteEntry(index: number) {
    this.data.splice(index, 1);
  }
  goBack() {
    if (this.isTableVisible) {
      this.isTableVisible = false; // Hide the table
      this.isFormVisible = true;   // Show the form
      this.imageSrc = null;
      this.extractedWords = null;
    } else if (this.isFormVisible) {
      this.isFormVisible = false; // Hide the form
      this.extractedWords = null;
      this.showScanner(); // Show scanner section
    }
  }
  showScanner() {
    // Set the necessary flags to display the scanner section again
    this.isFormVisible = false;
    this.isTableVisible = false;
    // You can add any other initialization code needed for the scanner
  }
  importData() {
    // Logic to import data goes here
  }
  triggerFileUpload() {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click(); // Programmatically trigger the file input
    }
  }
}

// import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import { ExportService } from './services/export.services';
// import { NgIf } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import * as XLSX from 'xlsx'; // Ensure this import is present for XLSX operations
// import { ScannerComponent } from './scanner/scanner.component';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [NgIf, CommonModule, FormsModule, ScannerComponent],
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.scss'],
//   providers: [ExportService]
// })
// export class AppComponent implements OnInit {
//   @ViewChild('userTable', { static: false }) userTable!: ElementRef;

//   originalFileName: string | null = null;
//   newEntry = {
//     name: '',
//     company: '',
//     phone: '',
//     email: '',
//     address: ''
//   };
//   data: any[] = [];
//   editIndex: number | null = null;

//   titleColor = '#333';
//   buttonColor = '#007bff';
//   extractedTextFront: string = ''; // Store extracted text for the front
//   extractedTextBack: string = '';  // Store extracted text for the back

//   scanOption: 'one' | 'both' = 'both'; // Store the user's scanning option

//   constructor(private exportService: ExportService) {}

//   ngOnInit() {}

//   // Handle file input
//   onFileChange(event: any) {
//     const target: DataTransfer = <DataTransfer>(event.target);
//     if (target.files.length !== 1) {
//       throw new Error('Cannot use multiple files');
//     }

//     const file = target.files[0];
//     this.originalFileName = file.name;
//     const reader: FileReader = new FileReader();

//     reader.onload = (e: any) => {
//       const data: Uint8Array = new Uint8Array(e.target.result);
//       const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
//       const wsname: string = wb.SheetNames[0];
//       const ws: XLSX.WorkSheet = wb.Sheets[wsname];

//       const jsonData: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

//       this.data = jsonData
//         .slice(1)
//         .filter((row: any[]) => row.some(cell => cell !== null && cell !== ''))
//         .map((row: any[]) => ({
//           srNo: row[0],
//           name: row[1],
//           company: row[2],
//           phone: row[3],
//           email: row[4],
//           address: row[5],
//         }));

//       this.updateSerialNumbers();
//     };

//     reader.readAsArrayBuffer(file);
//   }

//   // Handle extracted data from the scanner
//   onDataExtracted(extractedData: any) {
//     console.log('Extracted Data:', extractedData); // Debugging line
//     if (this.scanOption === 'both') {
//       // Merge data from both scanners
//       this.newEntry.name = extractedData.name || this.newEntry.name;
//       this.newEntry.company = extractedData.companyName || this.newEntry.company;
//       this.newEntry.phone = extractedData.phoneNumber || this.newEntry.phone;
//       this.newEntry.email = extractedData.email || this.newEntry.email;
//       this.newEntry.address = extractedData.address || this.newEntry.address;
      
//       this.extractedTextFront = JSON.stringify(extractedData, null, 2); // Store extracted data for the front side
//     } else if (this.scanOption === 'one') {
//       // Handle data extraction for one side only
//       this.newEntry.name = extractedData.name || '';
//       this.newEntry.company = extractedData.companyName || '';
//       this.newEntry.phone = extractedData.phoneNumber || '';
//       this.newEntry.email = extractedData.email || '';
//       this.newEntry.address = extractedData.address || '';
      
//       // Store extracted data depending on the scanner being used
//       if (this.extractedTextFront) {
//         this.extractedTextBack = JSON.stringify(extractedData, null, 2); // Store extracted data for the back side
//       } else {
//         this.extractedTextFront = JSON.stringify(extractedData, null, 2); // Store extracted data for the front side
//       }
//     }
//   }

//   // Handle form submission
//   onSubmit() {
//     if (this.editIndex !== null) {
//       this.data[this.editIndex] = { ...this.newEntry };
//       this.editIndex = null;
//     } else {
//       this.data.push({ ...this.newEntry });
//     }
//     this.resetForm();
//     this.updateSerialNumbers();
//   }

//   resetForm() {
//     this.newEntry = {
//       name: '',
//       company: '',
//       phone: '',
//       email: '',
//       address: ''
//     };
//   }

//   // Edit entry
//   editEntry(index: number) {
//     this.newEntry = { ...this.data[index] };
//     this.editIndex = index;
//   }

//   // Delete entry
//   deleteEntry(index: number) {
//     this.data.splice(index, 1);
//     this.updateSerialNumbers();
//   }

//   // Update serial numbers
//   updateSerialNumbers() {
//     this.data.forEach((row: any, idx: number) => {
//       row.srNo = idx + 1;
//     });
//   }

//   // Export data to Excel
//   saveExcel() {
//     const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
//     const wb: XLSX.WorkBook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

//     if (this.originalFileName) {
//       XLSX.writeFile(wb, this.originalFileName);
//     } else {
//       alert('Original file not found. Please upload a file to save changes.');
//     }
//   }

//   exportElmToExcel() {
//     this.exportService.exportTableElmToExcel(this.userTable, this.originalFileName || 'exported_data');
//   }
// }


