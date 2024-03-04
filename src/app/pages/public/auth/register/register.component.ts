import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { UsuarioClienteRegistro } from 'src/app/shared/models/usuario.model';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
})
export class RegisterComponent {
    valCheck: string[] = ['remember'];
    password!: string;
    userForm!: FormGroup;
    submited = false;
    cancelClicked = false;
    habilitado: Boolean = true; //false;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private usuarioService: UsuariosService,
        private MensajeService: MensajeService,
    ) {}

    ngOnInit(): void {
        this.userForm = this.fb.group({
            email: ['', [Validators.email, Validators.required]],
            password1: ['', Validators.required]
        });
    }

    public onCancel(): void {
        this.cancelClicked = true;
    }

    public onRegister(): void {
        this.cancelClicked = false;
    }

    showResponse(event: any) {
        this.habilitado = true;
    }

    public onSubmit(): void {
        if (this.cancelClicked) {
            this.router.navigate(['']);
        } else {
            if (!this.userForm.valid) {
                this.MensajeService.showWarning('Verifique los datos');
                return;
            }

            const password1 = this.userForm.controls['password1'].value;

            if (password1==this.userForm.controls['email'].value) {
                this.MensajeService.showWarning('El password no puede ser igual que el email');
                return;
            }

            this.submited = true;
            const user: UsuarioClienteRegistro = {
                email: this.userForm.controls['email'].value,
                password: this.userForm.controls['password1'].value,
            };

            this.usuarioService.addClientUser(user).subscribe({
                next: (res) => {
                    this.MensajeService.showSuccess(res.message);
                    this.router.navigate(['/auth/login']);
                },
                error: (err) => {
                    this.MensajeService.showError(err.error.message);
                    this.submited = false;
                },
            });
        }
    }

}
