// shared.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private extractedDataSource = new BehaviorSubject<string>('');
  currentData = this.extractedDataSource.asObservable();

  updateData(data: string) {
    this.extractedDataSource.next(data);
  }
}
