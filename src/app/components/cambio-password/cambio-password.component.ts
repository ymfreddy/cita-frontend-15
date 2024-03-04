import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { SessionService } from '../../shared/security/session.service';

@Component({
    selector: 'app-cambio-password',
    templateUrl: './cambio-password.component.html',
    styleUrls: ['./cambio-password.component.scss'],
})
export class CambioPasswordComponent implements OnInit {
    itemForm!: FormGroup;
    constructor(private fb: FormBuilder,
        private dialogRef: DynamicDialogRef,
        private MensajeService: MensajeService,
        private usuarioService: UsuariosService,
        private sessionService: SessionService
        ) {}

    ngOnInit(): void {
        this.itemForm = this.fb.group({
            password1: ['', [Validators.required, Validators.minLength(8)]],
            password2: ['', Validators.required],
        });
    }

    public onSubmit(): void {
        if (!this.itemForm.valid) {
            this.MensajeService.showWarning('Verifique los datos');
            return;
        }
        const password1 = this.itemForm.controls['password1'].value;
        const password2 = this.itemForm.controls['password2'].value;

        if (password1==this.sessionService.getSessionUserData().username) {
            this.MensajeService.showWarning('El password no puede ser igual que el username');
            return;
        }

        if(password1!=password2){
            this.MensajeService.showWarning('Los password no coinciden');
            return;
        }

        const solicitud = {
            username:this.sessionService.getSessionUserData().username,
            password:password1
        }
        this.usuarioService.changePassword(solicitud).subscribe({
            next: (res) => {
                    this.MensajeService.showSuccess(res.message);
                    const usuario = this.sessionService.getSessionUserData();
                    usuario.cambiarClave=false;
                    this.sessionService.setSessionUserData(usuario);
                    this.dialogRef.close(null);
            },
            error: (err) => {
                this.MensajeService.showError(err.error.message);
            },
        });
    }


}
