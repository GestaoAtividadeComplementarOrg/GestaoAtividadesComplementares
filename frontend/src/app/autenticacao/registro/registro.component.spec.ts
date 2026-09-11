import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegistroComponent } from './registro.component';
import { RegistroService } from './registro.service';

@Component({ template: '' })
class FakeLoginComponent {}

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;
  let registroServiceMock: { register: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    registroServiceMock = {
      register: vi.fn(),
    };
    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegistroComponent, ReactiveFormsModule],
      providers: [
        { provide: RegistroService, useValue: registroServiceMock },
        provideRouter([
          { path: 'login', component: FakeLoginComponent },
          { path: '', redirectTo: 'login', pathMatch: 'full' },
        ]),
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve validar campos obrigatórios', () => {
    component.registerForm.setValue({
      fullName: '',
      emailOrRegistration: '',
      password: '',
      confirmPassword: '',
    });
    expect(component.registerForm.invalid).toBeTruthy();
  });

  it('deve validar senha mínima de 8 caracteres', () => {
    component.registerForm.patchValue({ password: '1234567' });
    expect(component.registerForm.get('password')?.valid).toBeFalsy();
  });

  it('deve validar senha mínima de 3 caracteres para fullName', () => {
    component.registerForm.patchValue({ fullName: 'ab' });
    expect(component.registerForm.get('fullName')?.valid).toBeFalsy();
  });

  it('deve validar que as senhas coincidem', () => {
    component.registerForm.setValue({
      fullName: 'Teste',
      emailOrRegistration: 'teste@ufape.edu.br',
      password: 'password123',
      confirmPassword: 'password456',
    });
    expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();
  });

  it('deve validar que as senhas coincidem corretamente', () => {
    component.registerForm.setValue({
      fullName: 'Teste Silva',
      emailOrRegistration: 'teste@ufape.edu.br',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(component.registerForm.hasError('passwordMismatch')).toBeFalsy();
  });

  it('deve alternar visibilidade da senha', () => {
    component.togglePasswordVisibility('password');
    expect(component.showPassword()).toBeTruthy();
  });

  it('deve validar campo inválido e tocado', () => {
    const field = component.registerForm.get('fullName');
    field?.setValue('');
    field?.markAsTouched();
    expect(component.isFieldInvalid('fullName')).toBeTruthy();
  });

  it('deve submeter o formulário com sucesso', () => {
    component.registerForm.setValue({
      fullName: 'Teste Silva',
      emailOrRegistration: 'teste@ufape.edu.br',
      password: 'password123',
      confirmPassword: 'password123',
    });

    registroServiceMock.register.mockReturnValue({
      subscribe: vi.fn((cb: any) => {
        if (cb && typeof cb.next === 'function') {
          cb.next();
        } else if (cb && typeof cb === 'function') {
          cb({ next: () => {} });
        }
      }),
    } as any);
    component.onSubmit();

    expect(component.isLoading()).toBeFalsy();
  });

  it('não deve submeter se o formulário for inválido', () => {
    component.registerForm.setValue({
      fullName: '',
      emailOrRegistration: '',
      password: '',
      confirmPassword: '',
    });
    component.onSubmit();
    expect(component.registerForm.touched).toBeTruthy();
  });
});
