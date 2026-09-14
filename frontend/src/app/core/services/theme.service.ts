import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'sgac-theme';
  readonly isDark = signal<boolean>(false);

  constructor() {
    // Sempre inicia no modo claro; dark só ativa via toggle()
    this.isDark.set(false);
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('dark-mode');
    }
    effect(() => {
      if (typeof document !== 'undefined' && document.body) {
        if (this.isDark()) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      }
    });
  }

  toggle(): void {
    this.isDark.update((v) => !v);
  }
}
