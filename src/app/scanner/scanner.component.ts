// import { NgIf } from '@angular/common';
// import { Component, ElementRef, ViewChild } from '@angular/core';

// @Component({
//   selector: 'app-scanner',
//   standalone: true,
//   imports: [NgIf],
//   templateUrl: './scanner.component.html',
//   styleUrls: ['./scanner.component.css']
// })
// export class ScannerComponent {
//   @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
//   imageSrc: string | null = null;
//   isCameraActive = false;
//   isExtracting = false;
//   progress = 0;
//   extractedData: any;
//   useRearCamera = true; // Boolean flag for rear camera
//   private apiKey = 'K88875113488957'; // Use your OCR.Space API key here

//   constructor() {}

//   // Start the camera stream
//   startCamera() {
//     const videoConstraints = this.useRearCamera
//       ? { facingMode: { exact: 'environment' } }
//       : { facingMode: 'user' };

//     navigator.mediaDevices.getUserMedia({ video: videoConstraints })
//       .then(stream => {
//         this.videoElement.nativeElement.srcObject = stream;
//         this.videoElement.nativeElement.play();
//         this.isCameraActive = true;
//       })
//       .catch(err => {
//         console.error("Error accessing camera: ", err);
//         alert('Error accessing camera. Switching to the other camera.');
//         this.useRearCamera = !this.useRearCamera; 
//         this.startCamera(); 
//       });
//   }

//   // Switch camera between front and rear
//   switchCamera() {
//     if (this.isCameraActive) {
//       this.stopCamera();
//     }
//     this.useRearCamera = !this.useRearCamera;
//     this.startCamera();
//   }

//   // Capture image from video stream
//   captureImage() {
//     const canvas = document.createElement('canvas');
//     canvas.width = this.videoElement.nativeElement.videoWidth;
//     canvas.height = this.videoElement.nativeElement.videoHeight;
//     const context = canvas.getContext('2d');
//     context!.drawImage(this.videoElement.nativeElement, 0, 0);
//     this.imageSrc = canvas.toDataURL('image/jpeg');
//     this.startCountdown(5);
//   }

//   // Start countdown before extraction
//   startCountdown(seconds: number) {
//     const countdown = setInterval(() => {
//       if (seconds === 0) {
//         clearInterval(countdown);
//         this.extractText();
//       } else {
//         seconds--;
//       }
//     }, 1000);
//   }

//   // Stop the camera stream
//   stopCamera() {
//     const stream = this.videoElement.nativeElement.srcObject as MediaStream;
//     const tracks = stream.getTracks();
//     tracks.forEach(track => track.stop());
//     this.isCameraActive = false;
//     this.videoElement.nativeElement.srcObject = null;
//   }

//   // Extract text using OCR.Space API
//   extractText() {
//     if (!this.imageSrc) return;

//     this.isExtracting = true;
//     this.progress = 0;

//     const formData = new FormData();
//     const fileExtension = 'jpeg';
//     const blob = this.dataURItoBlob(this.imageSrc, fileExtension);
//     formData.append('file', blob, `captured-image.${fileExtension}`);
//     formData.append('apikey', this.apiKey);
//     formData.append('language', 'eng');

//     const interval = setInterval(() => {
//       if (this.progress >= 90) {
//         clearInterval(interval);
//       } else {
//         this.progress += 10;
//       }
//     }, 300);

//     fetch('https://api.ocr.space/parse/image', {
//       method: 'POST',
//       body: formData
//     })
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then(data => {
//         clearInterval(interval);
//         this.isExtracting = false;

//         if (data.IsErroredOnProcessing) {
//           console.error('Error Message:', data.ErrorMessage);
//           alert('Error processing image: ' + data.ErrorMessage);
//           return;
//         }

//         const text = data.ParsedResults[0].ParsedText;
//         this.extractedData = this.extractDataFromText(text);
//         const businessNames = this.extractBusinessNames(text);
//         console.log('Extracted Business Names:', businessNames); // Log or handle business names as needed
//       })
//       .catch(err => {
//         clearInterval(interval);
//         this.isExtracting = false;
//         console.error('Error during OCR:', err);
//         alert('Error during OCR: ' + err.message);
//       });
//   }

//   // Convert dataURI to Blob
//   dataURItoBlob(dataURI: string, fileExtension: string) {
//     const byteString = atob(dataURI.split(',')[1]);
//     const mimeString = `image/${fileExtension}`;
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ab], { type: mimeString });
//   }


//   // Extract business names formatted in bold and capital letters
// extractBusinessNames(text: string) {
//   // Regex to match business names in HTML, Markdown, or plain text
//   const regex = /(?:<b>([A-Z\s]+)<\/b>|\*\*([A-Z\s]+)\*\*|\b([A-Z\s]+)\b)/g;
//   const matches = [];
//   let match;

//   while ((match = regex.exec(text)) !== null) {
//     // Push the captured business name to the matches array
//     matches.push(match[1] || match[2] || match[3]);
//   }

//   // Filter out any undefined or empty matches
//   return matches.filter(name => name && name.trim().length > 0);
// }


//   // Extract relevant data from OCR text using annotated data format
//   extractDataFromText(text: string) {
//     const lines = text.split('\n').map(line => line.trim());
//     let name = '';
//     let phoneNumber = '';
//     let address = '';
//     let email = '';
//     let companyName = '';
//     let addressBuffer = [];
  
//     const phoneRegex = /(?:\+?\d{1,2}\s?)?(?:\(\d{3}\)|\d{3})[\s-]?\d{3}[\s-]?\d{4}/;
//     const emailRegex = /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/;
//     const companyRegex = /^[A-Z][a-zA-Z\s()]+$/;
  
//     // Indian address keywords for better accuracy
//     const addressKeywords = [
//       'Street', 'St.', 'Avenue', 'Ave', 'Boulevard', 'Blvd',
//       'Road', 'Rd', 'Lane', 'Ln', 'Drive', 'Dr', 'Shop',
//       'No', 'Floor', 'Building', 'Apartment', 'Flat', 
//       'Pincode', 'P.O.BOX', 'Sector', 'East', 'West', 
//       'North', 'South', 'Centre', 'District', 'State', 
//       'Country', 'Union', 'Para', 'P.O','Opp','Near','Next to'
//     ];
  
//     const addressRegex = new RegExp(`\\b(${addressKeywords.join('|')})\\b`, 'i');
  
//     for (const line of lines) {
//       // Name: First line with words, possibly a person's name (fallback mechanism added)
//       if (!name && /^[A-Za-z\s]+$/.test(line) && line.split(' ').length > 1) {
//         name = line;
//       }
//       // Phone Number
//       else if (!phoneNumber && phoneRegex.test(line)) {
//         phoneNumber = line.match(phoneRegex)![0];
//       }
//       // Email
//       else if (!email && emailRegex.test(line)) {
//         email = line.match(emailRegex)![0];
//       }
//       // Address: If line contains address keywords or appears to be part of an address
//       else if (addressRegex.test(line) || addressBuffer.length > 0) {
//         addressBuffer.push(line);
//         if (addressBuffer.length > 1 && !addressRegex.test(line)) {
//           address = addressBuffer.join(', ');
//           addressBuffer = [];
//         }
//       }
//       // Company Name: Use regex for company names or uppercase text
//       else if (!companyName && companyRegex.test(line)) {
//         companyName = line;
//       }
//     }
  
//     // Handle the case if the address is detected in the last lines
//     if (!address && addressBuffer.length > 0) {
//       address = addressBuffer.join(', ');
//     }
  
//     return {
//       name,
//       companyName,
//       phoneNumber,
//       email,
//       address
//     };
//   }
  
//   // Handle file input change
//   onFileChange(event: Event) {
//     const target = event.target as HTMLInputElement;
//     const file = target.files![0];
//     if (!file) {
//       alert('No file selected.');
//       return;
//     }
//     const reader = new FileReader();
//     reader.onload = (e: ProgressEvent<FileReader>) => {
//       const imageUrl = e.target?.result as string;
//       this.imageSrc = imageUrl;
//       this.extractText();
//     };
//     reader.readAsDataURL(file);
//   }
// }








// import { NgIf } from '@angular/common';
// import { Component, ElementRef, ViewChild } from '@angular/core';
// import { EventEmitter, Output } from '@angular/core';

// @Component({
//   selector: 'app-scanner',
//   standalone: true,
//   imports: [NgIf],
//   templateUrl: './scanner.component.html',
//   styleUrls: ['./scanner.component.css']
// })
// export class ScannerComponent {
//   @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
//   imageSrc: string | null = null;
//   isCameraActive = false;
//   isExtracting = false;
//   progress = 0;
//   extractedData: any;
//   useRearCamera = true;
//   private apiKey = 'K88875113488957'; // Your OCR.Space API key

//   constructor() {}

//   @Output() dataExtracted = new EventEmitter<any>();

//   /*exportExtractedData() {
//     if (this.extractedData) {
//       const data = this.extractedData;
//       const csvContent = `Name,Company,Phone,Email,Address\n${data.name},${data.companyName},${data.phoneNumber},${data.email},${data.address}`;

      
//       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      
//       const link = document.createElement('a');
//       const url = URL.createObjectURL(blob);
//       link.setAttribute('href', url);
//       link.setAttribute('download', 'extracted_data.csv');

      
//       document.body.appendChild(link);

//       // Simulate a click event to download the file
//       link.click();

      
//       document.body.removeChild(link);
//     }
//   }*/

//   startCamera() {
//     const videoConstraints = this.useRearCamera
//       ? { facingMode: { exact: 'environment' } }
//       : { facingMode: 'user' };

//     navigator.mediaDevices.getUserMedia({ video: videoConstraints })
//       .then(stream => {
//         this.videoElement.nativeElement.srcObject = stream;
//         this.videoElement.nativeElement.play();
//         this.isCameraActive = true;
//       })
//       .catch(err => {
//         console.error("Error accessing camera: ", err);
//         alert('Error accessing camera. Switching to the other camera.');
//         this.useRearCamera = !this.useRearCamera; 
//         this.startCamera(); 
//       });
//   }

//   switchCamera() {
//     if (this.isCameraActive) {
//       this.stopCamera();
//     }
//     this.useRearCamera = !this.useRearCamera;
//     this.startCamera();
//   }

//   captureImage() {
//     const canvas = document.createElement('canvas');
//     canvas.width = this.videoElement.nativeElement.videoWidth;
//     canvas.height = this.videoElement.nativeElement.videoHeight;
//     const context = canvas.getContext('2d');
//     context!.drawImage(this.videoElement.nativeElement, 0, 0);
//     this.imageSrc = canvas.toDataURL('image/jpeg');
//     this.startCountdown(5);
//   }

//   startCountdown(seconds: number) {
//     const countdown = setInterval(() => {
//       if (seconds === 0) {
//         clearInterval(countdown);
//         this.extractText();
//       } else {
//         seconds--;
//       }
//     }, 1000);
//   }

//   stopCamera() {
//     const stream = this.videoElement.nativeElement.srcObject as MediaStream;
//     const tracks = stream.getTracks();
//     tracks.forEach(track => track.stop());
//     this.isCameraActive = false;
//     this.videoElement.nativeElement.srcObject = null;
//   }

//   extractText() {
//     if (!this.imageSrc) return;

//     this.isExtracting = true;
//     this.progress = 0;

//     const formData = new FormData();
//     const fileExtension = 'jpeg';
//     const blob = this.dataURItoBlob(this.imageSrc, fileExtension);
//     formData.append('file', blob, `captured-image.${fileExtension}`);
//     formData.append('apikey', this.apiKey);
//     formData.append('language', 'eng');

//     const interval = setInterval(() => {
//       if (this.progress >= 90) {
//         clearInterval(interval);
//       } else {
//         this.progress += 10;
//       }
//     }, 300);

//     fetch('https://api.ocr.space/parse/image', {
//       method: 'POST',
//       body: formData
//     })
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then(data => {
//         clearInterval(interval);
//         this.isExtracting = false;

//         if (data.IsErroredOnProcessing) {
//           console.error('Error Message:', data.ErrorMessage);
//           alert('Error processing image: ' + data.ErrorMessage);
//           return;
//         }

//         const text = data.ParsedResults[0].ParsedText;
//         this.extractedData = this.extractDataFromText(text);

//         // Emit the extracted data to the parent component
//         this.dataExtracted.emit(this.extractedData);
//       })
//       .catch(err => {
//         clearInterval(interval);
//         this.isExtracting = false;
//         console.error('Error during OCR:', err);
//         alert('Error during OCR: ' + err.message);
//       });
//   }

//   dataURItoBlob(dataURI: string, fileExtension: string) {
//     const byteString = atob(dataURI.split(',')[1]);
//     const mimeString = `image/${fileExtension}`;
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ab], { type: mimeString });
//   }

//   extractBusinessNames(text: string) {
//     const regex = /(?:<b>([A-Z\s]+)<\/b>|\*\*([A-Z\s]+)\*\*|\b([A-Z\s]+)\b)/g;
//     const matches = [];
//     let match;

//     while ((match = regex.exec(text)) !== null) {
//       matches.push(match[1] || match[2] || match[3]);
//     }

//     return matches.filter(name => name && name.trim().length > 0);
//   }

//   extractDataFromText(text: string) {
//     const lines = text.split('\n').map(line => line.trim());
//     let name = '';
//     let phoneNumber = '';
//     let address = '';
//     let email = '';
//     let companyName = '';
//     let addressBuffer = [];
  
//     const phoneRegex = /(?:\+?\d{1,2}\s?)?(?:\(\d{3}\)|\d{3})[\s-]?\d{3}[\s-]?\d{4}/;
//     const emailRegex = /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/;
//     const companyRegex = /^[A-Z][a-zA-Z\s()]+$/;
  
//     const addressKeywords = [
//       'Street', 'St.', 'Avenue', 'Ave', 'Boulevard', 'Blvd',
//       'Road', 'Rd', 'Lane', 'Ln', 'Drive', 'Dr', 'Shop',
//       'No', 'Floor', 'Building', 'Apartment', 'Flat', 
//       'Pincode', 'P.O.BOX', 'Sector', 'East', 'West', 
//       'North', 'South', 'Centre', 'District', 'State', 
//       'Country', 'Union', 'Para', 'P.O','Opp','Near','Next to'
//     ];
  
//     const addressRegex = new RegExp(`\\b(${addressKeywords.join('|')})\\b`, 'i');
  
//     for (const line of lines) {
//       if (!name && /^[A-Za-z\s]+$/.test(line) && line.split(' ').length > 1) {
//         name = line;
//       } else if (!phoneNumber && phoneRegex.test(line)) {
//         phoneNumber = line.match(phoneRegex)![0];
//       } else if (!email && emailRegex.test(line)) {
//         email = line.match(emailRegex)![0];
//       } else if (addressRegex.test(line) || addressBuffer.length > 0) {
//         addressBuffer.push(line);
//         if (addressBuffer.length > 1 && !addressRegex.test(line)) {
//           address = addressBuffer.join(', ');
//           addressBuffer = [];
//         }
//       } else if (!companyName && companyRegex.test(line)) {
//         companyName = line;
//       }
//     }
  
//     if (!address && addressBuffer.length > 0) {
//       address = addressBuffer.join(', ');
//     }
  
//     return {
//       name,
//       companyName,
//       phoneNumber,
//       email,
//       address
//     };
//   }

//   onFileChange(event: Event) {
//     const target = event.target as HTMLInputElement;
//     const file = target.files![0];
//     if (!file) {
//       alert('No file selected.');
//       return;
//     }
//     const reader = new FileReader();
//     reader.onload = (e: ProgressEvent<FileReader>) => {
//       const imageUrl = e.target?.result as string;
//       this.imageSrc = imageUrl;
//       this.extractText();
//     };
//     reader.readAsDataURL(file);
//   }
// }



// import { Component, ElementRef, EventEmitter, Output, ViewChild, Input } from '@angular/core';
// import { NgIf } from '@angular/common';

// @Component({
//   selector: 'app-scanner',
//   standalone: true,
//   imports: [NgIf],
//   templateUrl: './scanner.component.html',
//   styleUrls: ['./scanner.component.css']
// })
// export class ScannerComponent {
//   @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

//   frontImageSrc: string | null = null;
//   backImageSrc: string | null = null;
//   isCameraActive = false;
//   isExtracting = false;
//   progress = 0;
//   extractedDataFront: any = null;
//   extractedDataBack: any = null;
//   showUploadPrompt: boolean = false;
//   useRearCamera = true;
//   isDoubleSided = false; // Toggle for single/double-sided card scanning
//   captureSide: 'front' | 'back' = 'front'; // Track capture side
//   private apiKey = 'K88875113488957'; // Your OCR.Space API key

//   @Output() dataExtracted = new EventEmitter<any>();
//   @Input() scan: 'front' | 'back' = 'front'; // Default scan side
//   @Input() scanOption: any;

//   // Method to handle card type change
//   onCardTypeChange(isDoubleSided: boolean) {
//     this.isDoubleSided = isDoubleSided;
//     this.frontImageSrc = null; // Clear previous front image
//     this.backImageSrc = null;  // Clear previous back image
//     this.captureSide = 'front'; // Reset capture side to front
//     this.showUploadPrompt = true;
//   }

//   uploadFrontImage() {
//     const input: HTMLElement | null = document.getElementById('file-upload-front');
//     input?.click(); // Trigger the hidden file input
//   }

//   // Prompt to upload back image
//   uploadBackImage() {
//     const input: HTMLElement | null = document.getElementById('file-upload-back');
//     input?.click(); // Trigger the hidden file input
//   }

//   onFileChange(event: Event, side: 'front' | 'back'): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files[0]) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         if (side === 'front') {
//           this.frontImageSrc = e.target?.result as string | null;
//         } else if (side === 'back') {
//           this.backImageSrc = e.target?.result as string | null;
//         }
//       };
//       reader.readAsDataURL(input.files[0]);
//     }
//   }

//   startCamera() {
//     const videoConstraints = this.useRearCamera
//       ? { facingMode: { exact: 'environment' } }
//       : { facingMode: 'user' };

//     navigator.mediaDevices.getUserMedia({ video: videoConstraints })
//       .then(stream => {
//         this.videoElement.nativeElement.srcObject = stream;
//         this.videoElement.nativeElement.play();
//         this.isCameraActive = true;
//       })
//       .catch(err => {
//         console.error("Error accessing camera: ", err);
//         alert('Error accessing camera. Switching to the other camera.');
//         this.useRearCamera = !this.useRearCamera; 
//         this.startCamera(); 
//       });
//   }

//   switchCamera() {
//     if (this.isCameraActive) {
//       this.stopCamera();
//     }
//     this.useRearCamera = !this.useRearCamera;
//     this.startCamera();
//   }

//   captureImage() {
//     const canvas = document.createElement('canvas');
//     canvas.width = this.videoElement.nativeElement.videoWidth;
//     canvas.height = this.videoElement.nativeElement.videoHeight;
//     const context = canvas.getContext('2d');
//     context!.drawImage(this.videoElement.nativeElement, 0, 0);
//     const imageData = canvas.toDataURL('image/jpeg');
    
//     if (this.captureSide === 'front') {
//       this.frontImageSrc = imageData;
//       if (this.isDoubleSided) {
//         // If double-sided, switch to capture the back side
//         this.captureSide = 'back';
//         alert('Please capture the back side of the card.');
//       } else {
//         this.startCountdown(5);
//       }
//     } else {
//       this.backImageSrc = imageData;
//       this.startCountdown(5);
//     }
//   }

//   startCountdown(seconds: number) {
//     const countdown = setInterval(() => {
//       if (seconds === 0) {
//         clearInterval(countdown);
//         this.extractText();
//       } else {
//         seconds--;
//       }
//     }, 1000);
//   }

//   stopCamera() {
//     const stream = this.videoElement.nativeElement.srcObject as MediaStream;
//     const tracks = stream.getTracks();
//     tracks.forEach(track => track.stop());
//     this.isCameraActive = false;
//     this.videoElement.nativeElement.srcObject = null;
//   }

//   extractText() {
//     if (!this.frontImageSrc) return;

//     this.isExtracting = true;
//     this.progress = 0;

//     // Start extraction for the front side first
//     this.extractTextFromImage(this.frontImageSrc, (data) => {
//       this.extractedDataFront = data;

//       if (this.isDoubleSided && this.backImageSrc) {
//         // If it's a double-sided card, extract text from the back side too
//         this.extractTextFromImage(this.backImageSrc, (data) => {
//           this.extractedDataBack = data;
//           this.isExtracting = false;
//           this.dataExtracted.emit({
//             front: this.extractedDataFront,
//             back: this.extractedDataBack
//           });
//         });
//       } else {
//         this.isExtracting = false;
//         this.dataExtracted.emit({ front: this.extractedDataFront });
//       }
//     });
//   }

//   extractTextFromImage(imageSrc: string, callback: (data: any) => void) {
//     const formData = new FormData();
//     const fileExtension = 'jpeg';
//     const blob = this.dataURItoBlob(imageSrc, fileExtension);
//     formData.append('file', blob, `captured-image.${fileExtension}`);
//     formData.append('apikey', this.apiKey);
//     formData.append('language', 'eng');

//     const interval = setInterval(() => {
//       if (this.progress >= 90) {
//         clearInterval(interval);
//       } else {
//         this.progress += 10;
//       }
//     }, 300);

//     fetch('https://api.ocr.space/parse/image', {
//       method: 'POST',
//       body: formData
//     })
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then(data => {
//         clearInterval(interval);
//         if (data.IsErroredOnProcessing) {
//           console.error('Error Message:', data.ErrorMessage);
//           alert('Error processing image: ' + data.ErrorMessage);
//           return;
//         }

//         const text = data.ParsedResults[0].ParsedText;
//         const extractedData = this.extractDataFromText(text);
//         callback(extractedData);
//       })
//       .catch(err => {
//         clearInterval(interval);
//         this.isExtracting = false;
//         console.error('Error during OCR:', err);
//         alert('Error during OCR: ' + err.message);
//       });
//   }

//   dataURItoBlob(dataURI: string, fileExtension: string) {
//     const byteString = atob(dataURI.split(',')[1]);
//     const mimeString = `image/${fileExtension}`;
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ab], { type: mimeString });
//   }

//   extractDataFromText(text: string) {
//     const lines = text.split('\n').map(line => line.trim());
//     let name = '';
//     let phoneNumber = '';
//     let address = '';
//     let email = '';
//     let companyName = '';
//     let addressBuffer: string[] = [];
  
//     const phoneRegex = /(?:\+?\d{1,2}\s?)?(?:\(\d{3}\)|\d{3})[\s-]?\d{3}[\s-]?\d{4}/;
//     const emailRegex = /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/;
//     const companyRegex = /^[A-Z][a-zA-Z\s()]+$/;
  
//     const addressKeywords = [
//       'Street', 'St.', 'Avenue', 'Ave', 'Boulevard', 'Blvd',
//       'Road', 'Rd', 'Lane', 'Ln', 'Drive', 'Dr', 'Shop',
//       'No', 'Floor', 'Building', 'Apartment', 'Flat', 
//       'Pincode', 'P.O.BOX', 'Sector', 'East', 'West', 
//       'North', 'South', 'Centre', 'District', 'State', 
//       'Country', 'Union', 'Para', 'P.O', 'Opp', 'Near', 'Next to'
//     ];
  
//     const addressRegex = new RegExp(`\\b(${addressKeywords.join('|')})\\b`, 'i');
  
//     for (const line of lines) {
//       if (!name && /^[A-Z][a-z]+,?\s[A-Z][a-z]+$/.test(line)) {
//         name = line; // Assuming the first valid line is the name
//       } else if (!phoneNumber && phoneRegex.test(line)) {
//         const match = line.match(phoneRegex);
//         if (match) {
//           phoneNumber = match[0];
//         }
//       } else if (!email && emailRegex.test(line)) {
//         const match = line.match(emailRegex);
//         if (match) {
//           email = match[0];
//         }
//       } else if (companyRegex.test(line)) {
//         companyName = line; // Assuming the line matches company format
//       } else if (addressRegex.test(line)) {
//         addressBuffer.push(line);
//       }
//     }
  
//     address = addressBuffer.join(', ');
  
//     return {
//       name,
//       phoneNumber,
//       address,
//       email,
//       companyName
//     };
//   }
//   rescan() {
//     this.frontImageSrc = null;
//     this.backImageSrc = null;
//     this.extractedDataFront = null;
//     this.extractedDataBack = null;
//     this.captureSide = 'front'; // Reset the capture side to 'front'
//     this.isExtracting = false;
//     this.progress = 0;
//     alert('You can now start scanning again.');
//   }
// }
// import { NgIf } from '@angular/common';
// import { Component, ElementRef, ViewChild } from '@angular/core';
// import { EventEmitter, Output } from '@angular/core';

// @Component({
//   selector: 'app-scanner',
//   standalone: true,
//   imports: [NgIf],
//   templateUrl: './scanner.component.html',
//   styleUrls: ['./scanner.component.css']
// })
// export class ScannerComponent {
//   @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
//   imageSrc: string | null = null;
//   isCameraActive = false;
//   isExtracting = false;
//   progress = 0;
//   extractedData: any;
//   useRearCamera = true;
//   private apiKey = 'K88875113488957'; // Your OCR.Space API key

//   constructor() {}

//   @Output() dataExtracted = new EventEmitter<any>();
//   @Output() dataExtractedFront = new EventEmitter<any>();
//   @Output() dataExtractedBack = new EventEmitter<any>();
//   @Output() imageCaptured = new EventEmitter<string>();
//   @Output() imageUploaded = new EventEmitter<string>();


//   /*exportExtractedData() {
//     if (this.extractedData) {
//       const data = this.extractedData;
//       const csvContent = `Name,Company,Phone,Email,Address\n${data.name},${data.companyName},${data.phoneNumber},${data.email},${data.address}`;

      
//       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      
//       const link = document.createElement('a');
//       const url = URL.createObjectURL(blob);
//       link.setAttribute('href', url);
//       link.setAttribute('download', 'extracted_data.csv');

      
//       document.body.appendChild(link);

//       // Simulate a click event to download the file
//       link.click();

      
//       document.body.removeChild(link);
//     }
//   }*/

//   startCamera() {
//     const videoConstraints = this.useRearCamera
//       ? { facingMode: { exact: 'environment' } }
//       : { facingMode: 'user' };

//     navigator.mediaDevices.getUserMedia({ video: videoConstraints })
//       .then(stream => {
//         this.videoElement.nativeElement.srcObject = stream;
//         this.videoElement.nativeElement.play();
//         this.isCameraActive = true;
//       })
//       .catch(err => {
//         console.error("Error accessing camera: ", err);
//         alert('Error accessing camera. Switching to the other camera.');
//         this.useRearCamera = !this.useRearCamera; 
//         this.startCamera(); 
//       });
//   }

//   switchCamera() {
//     if (this.isCameraActive) {
//       this.stopCamera();
//     }
//     this.useRearCamera = !this.useRearCamera;
//     this.startCamera();
//   }

//   captureImage() {
//     const canvas = document.createElement('canvas');
//     canvas.width = this.videoElement.nativeElement.videoWidth;
//     canvas.height = this.videoElement.nativeElement.videoHeight;
//     const context = canvas.getContext('2d');
//     context!.drawImage(this.videoElement.nativeElement, 0, 0);
//     this.imageSrc = canvas.toDataURL('image/jpeg');
//     this.imageCaptured.emit(capturedImage);
//     this.startCountdown(5);
//   }

//   startCountdown(seconds: number) {
//     const countdown = setInterval(() => {
//       if (seconds === 0) {
//         clearInterval(countdown);
//         this.extractText();
//       } else {
//         seconds--;
//       }
//     }, 1000);
//   }

//   stopCamera() {
//     const stream = this.videoElement.nativeElement.srcObject as MediaStream;
//     const tracks = stream.getTracks();
//     tracks.forEach(track => track.stop());
//     this.isCameraActive = false;
//     this.videoElement.nativeElement.srcObject = null;
//   }

//   extractText() {
//     if (!this.imageSrc) return;

//     this.isExtracting = true;
//     this.progress = 0;

//     const formData = new FormData();
//     const fileExtension = 'jpeg';
//     const blob = this.dataURItoBlob(this.imageSrc, fileExtension);
//     formData.append('file', blob, `captured-image.${fileExtension}`);
//     formData.append('apikey', this.apiKey);
//     formData.append('language', 'eng');

//     const interval = setInterval(() => {
//       if (this.progress >= 90) {
//         clearInterval(interval);
//       } else {
//         this.progress += 10;
//       }
//     }, 300);

//     fetch('https://api.ocr.space/parse/image', {
//       method: 'POST',
//       body: formData
//     })
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then(data => {
//         clearInterval(interval);
//         this.isExtracting = false;

//         if (data.IsErroredOnProcessing) {
//           console.error('Error Message:', data.ErrorMessage);
//           alert('Error processing image: ' + data.ErrorMessage);
//           return;
//         }

//         const text = data.ParsedResults[0].ParsedText;
//         this.extractedData = this.extractDataFromText(text);

//         // Emit the extracted data to the parent component
//         this.dataExtracted.emit(this.extractedData);
//       })
//       .catch(err => {
//         clearInterval(interval);
//         this.isExtracting = false;
//         console.error('Error during OCR:', err);
//         alert('Error during OCR: ' + err.message);
//       });
//   }

//   dataURItoBlob(dataURI: string, fileExtension: string) {
//     const byteString = atob(dataURI.split(',')[1]);
//     const mimeString = `image/${fileExtension}`;
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ab], { type: mimeString });
//   }

//   extractBusinessNames(text: string) {
//     const regex = /(?:<b>([A-Z\s]+)<\/b>|\*\*([A-Z\s]+)\*\*|\b([A-Z\s]+)\b)/g;
//     const matches = [];
//     let match;

//     while ((match = regex.exec(text)) !== null) {
//       matches.push(match[1] || match[2] || match[3]);
//     }

//     return matches.filter(name => name && name.trim().length > 0);
//   }

//   extractDataFromText(text: string) {
//     const lines = text.split('\n').map(line => line.trim());
//     let name = '';
//     let phoneNumber = '';
//     let address = '';
//     let email = '';
//     let companyName = '';
//     let addressBuffer = [];
  
//     const phoneRegex = /(?:\+?\d{1,2}\s?)?(?:\(\d{3}\)|\d{3})[\s-]?\d{3}[\s-]?\d{4}/;
//     const emailRegex = /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/;
//     const companyRegex = /^[A-Z][a-zA-Z\s()]+$/;
  
//     const addressKeywords = [
//       'Street', 'St.', 'Avenue', 'Ave', 'Boulevard', 'Blvd',
//       'Road', 'Rd', 'Lane', 'Ln', 'Drive', 'Dr', 'Shop',
//       'No', 'Floor', 'Building', 'Apartment', 'Flat', 
//       'Pincode', 'P.O.BOX', 'Sector', 'East', 'West', 
//       'North', 'South', 'Centre', 'District', 'State', 
//       'Country', 'Union', 'Para', 'P.O','Opp','Near','Next to'
//     ];
  
//     const addressRegex = new RegExp(`\\b(${addressKeywords.join('|')})\\b`, 'i');
  
//     for (const line of lines) {
//       if (!name && /^[A-Za-z\s]+$/.test(line) && line.split(' ').length > 1) {
//         name = line;
//       } else if (!phoneNumber && phoneRegex.test(line)) {
//         phoneNumber = line.match(phoneRegex)![0];
//       } else if (!email && emailRegex.test(line)) {
//         email = line.match(emailRegex)![0];
//       } else if (addressRegex.test(line) || addressBuffer.length > 0) {
//         addressBuffer.push(line);
//         if (addressBuffer.length > 1 && !addressRegex.test(line)) {
//           address = addressBuffer.join(', ');
//           addressBuffer = [];
//         }
//       } else if (!companyName && companyRegex.test(line)) {
//         companyName = line;
//       }
//     }
  
//     if (!address && addressBuffer.length > 0) {
//       address = addressBuffer.join(', ');
//     }
  
//     return {
//       name,
//       companyName,
//       phoneNumber,
//       email,
//       address
//     };
//   }

//   onFileChange(event: Event) {
//     const target = event.target as HTMLInputElement;
//     const file = target.files![0];
//     if (!file) {
//       alert('No file selected.');
//       return;
//     }
//     const reader = new FileReader();
//     reader.onload = (e: ProgressEvent<FileReader>) => {
//       const imageUrl = e.target?.result as string;
//       this.imageSrc = imageUrl;
//       this.extractText();
//       this.imageUploaded.emit(image);
//     };
//     reader.readAsDataURL(file);
//   }
// }


/* form here the original code is there */

import { NgIf } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { EventEmitter, Output,Input } from '@angular/core';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [NgIf],
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})
export class ScannerComponent {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @Input() imageSrc: string | null = null;

  isCameraActive :boolean = false;
  @Output() isExtracting: boolean = false;
  progress = 0;
  extractedData: any;
  useRearCamera : boolean= true;
  private apiKey = 'K88875113488957'; // Your OCR.Space API key
  isCardSelected=false;
  areButtonsVisible :boolean =false;
  imageCaptured :boolean = false;
  isUploadActive :boolean = false;
  
  //showIcons = true;
  @Output() dataExtracted = new EventEmitter<any>();
  @Output() imageCapturedEvent = new EventEmitter<string>();
  

  constructor() {}

  

    setCardType(type: string) {
      this.isCardSelected = true;
      this.areButtonsVisible=false;
      // Logic to handle one-side or two-side based on 'type'
      if (type === 'two-side') {
        // You can add more specific logic for two-sided scanning if needed





      }
    }
  startCamera() {
    const videoConstraints = this.useRearCamera
      ? { facingMode: { exact: 'environment' } }
      : { facingMode: 'user' };

    navigator.mediaDevices.getUserMedia({ video: videoConstraints })

      .then(stream => {
        this.videoElement.nativeElement.srcObject = stream;
        this.videoElement.nativeElement.play();
        this.isCameraActive = true;
        this.imageCaptured = false;
      })
      .catch(err => {
        console.error("Error accessing camera: ", err);
        alert('Error accessing camera. Switching to the other camera.');
        this.useRearCamera = !this.useRearCamera; 
        this.areButtonsVisible=true;
        this.startCamera(); 
      });
  }

  switchCamera() {
    
    if (this.isCameraActive) {
      this.stopCamera();
    }
    this.useRearCamera = !this.useRearCamera;
    this.areButtonsVisible=false;
    this.startCamera();
  }

  captureImage() {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.nativeElement.videoWidth;
    canvas.height = this.videoElement.nativeElement.videoHeight;
    const context = canvas.getContext('2d');
    context!.drawImage(this.videoElement.nativeElement, 0, 0);
    this.imageSrc = canvas.toDataURL('image/jpeg');
    this.imageCaptured = true;
    this.stopCamera();
    this.imageCapturedEvent.emit(this.imageSrc);
    this.startCountdown(5);
  }

  startCountdown(seconds: number) {
    const countdown = setInterval(() => {
      if (seconds === 0) {
        clearInterval(countdown);
        this.extractText();
      } else {
        seconds--;
      }
    }, 1000);
  }

  stopCamera() {
    const stream = this.videoElement.nativeElement.srcObject as MediaStream;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    this.isCameraActive = false;
    this.videoElement.nativeElement.srcObject = null;
  }

  extractText() {
    if (!this.imageSrc) return;

    this.isExtracting = true;
    this.progress = 0;

    const formData = new FormData();
    const fileExtension = 'jpeg';
    const blob = this.dataURItoBlob(this.imageSrc, fileExtension);
    formData.append('file', blob, `captured-image.${fileExtension}`);
    formData.append('apikey', this.apiKey);
    formData.append('language', 'eng');

    const interval = setInterval(() => {
      if (this.progress >= 90) {
        clearInterval(interval);
      } else {
        this.progress += 10;
      }
    }, 300);

    fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        clearInterval(interval);
        this.isExtracting = false;

        if (data.IsErroredOnProcessing) {
          console.error('Error Message:', data.ErrorMessage);
          alert('Error processing image: ' + data.ErrorMessage);
          return;
        }

        const text = data.ParsedResults[0].ParsedText;
        this.extractedData = this.extractDataFromText(text);

        // Emit the extracted data to the parent component
        this.dataExtracted.emit(this.extractedData);
      })
      .catch(err => {
        clearInterval(interval);
        this.isExtracting = false;
        console.error('Error during OCR:', err);
        alert('Error during OCR: ' + err.message);
      });
  }

  dataURItoBlob(dataURI: string, fileExtension: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = `image/${fileExtension}`;
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  extractBusinessNames(text: string) {
    const regex = /(?:<b>([A-Z\s]+)<\/b>|\*\*([A-Z\s]+)\*\*|\b([A-Z\s]+)\b)/g;
    const matches = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1] || match[2] || match[3]);
    }

    return matches.filter(name => name && name.trim().length > 0);
  }

  extractDataFromText(text: string) {
    const lines = text.split('\n').map(line => line.trim());
    let name = '';
    let phoneNumber = '';
    let address = '';
    let email = '';
    let companyName = '';
    let addressBuffer = [];
  
    const phoneRegex = /(?:\+?\d{1,2}\s?)?(?:\(\d{3}\)|\d{3})[\s-]?\d{3}[\s-]?\d{4}/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/;
    const companyRegex = /^[A-Z][a-zA-Z\s()]+$/;
  
    const addressKeywords = [
      'Street', 'St.', 'Avenue', 'Ave', 'Boulevard', 'Blvd',
      'Road', 'Rd', 'Lane', 'Ln', 'Drive', 'Dr', 'Shop',
      'No', 'Floor', 'Building', 'Apartment', 'Flat', 
      'Pincode', 'P.O.BOX', 'Sector', 'East', 'West', 
      'North', 'South', 'Centre', 'District', 'State', 
      'Country', 'Union', 'Para', 'P.O','Opp','Near','Next to'
    ];
  
    const addressRegex = new RegExp(`\\b(${addressKeywords.join('|')})\\b`, 'i');
  
    for (const line of lines) {
      if (!name && /^[A-Za-z\s]+$/.test(line) && line.split(' ').length > 1) {
        name = line;
      } else if (!phoneNumber && phoneRegex.test(line)) {
        phoneNumber = line.match(phoneRegex)![0];
      } else if (!email && emailRegex.test(line)) {
        email = line.match(emailRegex)![0];
      } else if (addressRegex.test(line) || addressBuffer.length > 0) {
        addressBuffer.push(line);
        if (addressBuffer.length > 1 && !addressRegex.test(line)) {
          address = addressBuffer.join(', ');
          addressBuffer = [];
        }
      } else if (!companyName && companyRegex.test(line)) {
        companyName = line;
      }
    }
  
    if (!address && addressBuffer.length > 0) {
      address = addressBuffer.join(', ');
    }
  
    return {
      name,
      companyName,
      phoneNumber,
      email,
      address
    };
  }

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files![0];
    if (!file) {
      alert('No file selected.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const imageUrl = e.target?.result as string;
      this.imageSrc = imageUrl;
      this.imageCaptured = true;
      this.extractText();
    };
    reader.readAsDataURL(file);
  }
  rescan() {
    this.imageSrc = null;          // Clear the captured image
    this.extractedData = null;     // Clear extracted data
    this.progress = 0;             // Reset progress bar
    this.isExtracting = false;     // Reset extracting flag
    this.imageCaptured = false;
  
    const userChoice = confirm('Would you like to upload a new image or scan with the camera? Press "OK" for Scan and "Cancel" for Upload.');
  
    if (userChoice) {
      this.startCamera();          // Start camera for scanning
    } else {
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();          // Trigger file input click to upload a new image
      }
    }
  }
  goBack() {
    this.isCardSelected = false;
    this.imageSrc = null; // Optionally clear the captured image
    this.extractedData = null; // Optionally clear extracted data
    this.isCameraActive = false; // Stop the camera if active
    this.imageCaptured = false;
}
triggerFileUpload() {
  const fileInput = document.getElementById('file-upload') as HTMLInputElement;
  if (fileInput) {
    fileInput.click(); // Programmatically trigger the file input
  }
}

  
}






