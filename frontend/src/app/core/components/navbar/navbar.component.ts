import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AutenticacaoService } from '../../../autenticacao/autenticacao.service';
import { Role } from '../../../autenticacao/autenticacao.model';
import { ContadorNotificacoesComponent } from '../../../notificacao/contador/contador-notificacoes.component';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ContadorNotificacoesComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnDestroy {
  private readonly authService = inject(AutenticacaoService);
  readonly themeService = inject(ThemeService);
  private authSub!: Subscription;

  estaAutenticado = signal<boolean>(this.authService.isAuthenticated());
  perfil = signal<Role | null>(this.authService.perfilAtual());

  constructor() {
    this.authSub = this.authService.authObservable.subscribe((auth) => {
      this.estaAutenticado.set(auth);
      this.perfil.set(this.authService.perfilAtual());
    });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  get isEstudante(): boolean {
    return this.perfil() === 'ESTUDANTE';
  }

  get isAvaliador(): boolean {
    return this.perfil() === 'AVALIADOR' || this.perfil() === 'ADMINISTRADOR';
  }

  get isAdmin(): boolean {
    return this.perfil() === 'ADMINISTRADOR';
  }
}
