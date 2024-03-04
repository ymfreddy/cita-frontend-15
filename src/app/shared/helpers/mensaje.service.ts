import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {

  constructor(private messageService: MessageService) { }

  showError(message?: string, duration?: number): void {
    const durationError: number = duration?? 45000;
    this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
      });
  }

  showSuccess(message: string): void {
    this.messageService.add({
        severity: 'success',
        summary: 'Correcto',
        detail: message,
      });
  }

  showWarning(message: string): void {
    this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: message,
      });
  }

  showInfo(message: string): void {
    this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: message,
      });
  }
}
