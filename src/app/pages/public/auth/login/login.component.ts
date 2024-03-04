import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { adm } from 'src/app/shared/constants/adm';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { MenuOpcion } from 'src/app/shared/models/menu-opcion';
import { Asociacion, SessionUsuario, UsuarioAuth } from 'src/app/shared/models/usuario.model';
import { AuthService } from 'src/app/shared/security/auth.service';
import { SessionService } from 'src/app/shared/security/session.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [
        `
            :host ::ng-deep .p-password input {
                width: 100%;
                padding: 1rem;
            }

            :host ::ng-deep .pi-eye {
                transform: scale(1.6);
                margin-right: 1rem;
                color: var(--primary-color) !important;
            }

            :host ::ng-deep .pi-eye-slash {
                transform: scale(1.6);
                margin-right: 1rem;
                color: var(--primary-color) !important;
            }
        `,
    ],
})
export class LoginComponent {
    valCheck: string[] = ['remember'];
    password!: string;
    userForm!: FormGroup;
    user!: UsuarioAuth;
    habilitado: Boolean = true;
    submited = false;
    cancelClicked = false;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private authService: AuthService,
        private MensajeService: MensajeService,
        private sessionService: SessionService
    ) {}

    ngOnInit(): void {
        this.userForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    showResponse(event: any) {
        this.habilitado = true;
    }

    public onCancel(): void {
        this.cancelClicked = true;
    }

    public onLogin(): void {
        this.cancelClicked = false;
    }

    public onSubmit(): void {
        if (this.cancelClicked) {
            this.router.navigate(['/']);
        } else {
            if (!this.userForm.valid) {
                this.MensajeService.showWarning('Verifique los datos');
                this.submited = false;
                return;
            }
            this.submited = true;
            const user: any = {
                username: this.userForm.controls['username'].value,
                password: this.userForm.controls['password'].value,
            };

            this.authService.login(user).subscribe({
                next: (res) => {
                    console.log(res);
                    //this.authService.loggedIn$.next(true); // {3}
                    this.authService.user = user;
                    this.authService.setSessionData(res);
                    this.authService.getSession().subscribe({
                        next: (resSession) => {
                            if (resSession.success) {
                                const asociaciones:Asociacion[] = resSession.content.asociaciones
                                // se coloca los datos de session
                                let usuarioSession: SessionUsuario = {
                                    id: resSession.content.usuario.id,
                                    username: resSession.content.usuario.username,
                                    tipoUsuario: resSession.content.usuario.tipoUsuario,
                                    codigoTipoUsuario: resSession.content.usuario.codigoTipoUsuario,
                                    nombreCompleto: resSession.content.usuario
                                        .nombreCompleto,
                                    idEmpresa: resSession.content.usuario.idEmpresa,
                                    idSucursal: resSession.content.usuario.idSucursal ??
                                        0,
                                    idPuntoVenta: 0,
                                    empresaNombre: resSession.content.usuario
                                        .empresaNombre,
                                    empresaSfeNit: resSession.content.usuario.empresaSfeNit,
                                    numeroSucursal: 0,
                                    numeroPuntoVenta: 0,
                                    cambiarClave: resSession.content.usuario.cambiarClave,
                                    idTurno: 0,
                                    numeroDocumento: resSession.content.usuario.numeroDocumento,
                                    categorias: resSession.content.usuario.categorias,
                                    email: resSession.content.usuario.email,
                                    telefono: resSession.content.usuario.telefono,
                                    codigoGenero: resSession.content.usuario.codigoGenero,
                                    codigoCiudad: resSession.content.usuario.codigoCiudad
                                };

                                this.sessionService.setSessionUserData(
                                    usuarioSession
                                );

                                console.log(resSession.content);
                                if(resSession.content.usuario.idTipoUsuario!=adm.TIPO_USUARIO_EXTERNO){
                                    // adicionarl el menu principal
                                       const  menu : MenuOpcion ={
                                            id:-1,
                                            titulo :"Menu Principal",
                                            ruta:"/adm/menu-principal",
                                            icono:"pi pi-fw pi-table",
                                            grupo:"*.MENU",
                                            orden:1,
                                            descripcion:""
                                        }
                                        let opciones: MenuOpcion[] =resSession.content.opciones;
                                        opciones.unshift(menu);
                                        this.sessionService.setSessionMenu(opciones);
                                    }
                                    else{
                                        let opciones: MenuOpcion[] =resSession.content.opciones;
                                        this.sessionService.setSessionMenu(opciones);
                                    }

                                this.router.navigate([resSession.content.opciones[0].ruta,]);
                            } else {
                                this.MensajeService.showError(
                                    resSession.message
                                );
                            }
                            this.submited = false;
                        },
                        error: (err2) => {
                            this.MensajeService.showError(
                                err2.error.message
                            );
                            this.habilitado = false;
                            this.submited = false;
                        },
                    });
                },
                error: (err) => {
                    this.MensajeService.showError(err.error.message);
                    this.habilitado = false;
                    this.submited = false;
                },
            });
        }
    }
}
