import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-[#e1e3e4] border-t border-[#c0c9c3] mt-auto">
      <div
        class="w-full py-6 px-4 md:px-8 max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#404945]"
      >
        <div class="flex items-center gap-2 font-bold text-[#003629]">
          <span>SGAC</span>
        </div>
        <p class="text-center">
          © 2026 SGAC - Universidade Federal do Agreste de Pernambuco. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
