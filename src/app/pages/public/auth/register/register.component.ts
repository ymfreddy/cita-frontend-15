import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { RegistroEmpresaOnline } from 'src/app/shared/models/usuario.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
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
    ciudades:any[];

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private empresasService: EmpresasService,
        private MensajeService: MensajeService,
    ) {
        this.ciudades = [
            { ciudad: 'LA PAZ', codigo: 'LA PAZ' },
            { ciudad: 'ORURO', codigo: 'ORURO' },
            { ciudad: 'POTOSI', codigo: 'POTOSI' },
            { ciudad: 'COCHABAMBA', codigo: 'COCHABAMBA' },
            { ciudad: 'SUCRE', codigo: 'SUCRE' },
            { ciudad: 'TARIJA', codigo: 'TARIJA' },
            { ciudad: 'PANDO', codigo: 'PANDO' },
            { ciudad: 'BENI', codigo: 'BENI' },
            { ciudad: 'SANTA CRUZ', codigo: 'SANTA CRUZ' },
        ];
    }

    ngOnInit(): void {
        this.userForm = this.fb.group({
            nombres: ['', Validators.required],
            apellidos: ['', Validators.required],
            ci: [null, Validators.required],
            email: ['', [Validators.email, Validators.required]],
            celular: [null, Validators.required],
            ciudad: ['LA PAZ', Validators.required],
            direccion: ['', Validators.required],
            password: ['', Validators.required]
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

            const password = this.userForm.controls['password'].value;

            if (password==this.userForm.controls['email'].value) {
                this.MensajeService.showWarning('El password no puede ser igual que el email');
                return;
            }

            this.submited = true;
            const user: RegistroEmpresaOnline = {
                email: this.userForm.controls['email'].value,
                password: this.userForm.controls['password'].value,
                nombres: this.userForm.controls['nombres'].value,
                apellidos: this.userForm.controls['apellidos'].value,
                ci: this.userForm.controls['ci'].value,
                celular: this.userForm.controls['celular'].value,
                ciudad: this.userForm.controls['ciudad'].value,
                direccion: this.userForm.controls['direccion'].value
            };

            console.log(user);
            this.empresasService.addOnline(user).subscribe({
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
