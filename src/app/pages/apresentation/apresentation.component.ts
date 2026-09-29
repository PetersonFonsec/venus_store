import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LyraStageComponent } from '../../shared/components/lyra-stage/lyra-stage.component';

interface Chapter {
  index: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  text: string;
}

interface Category {
  name: string;
  caption: string;
  hue: string;
}

@Component({
  selector: 'app-apresentation',
  standalone: true,
  imports: [RouterLink, LyraStageComponent],
  templateUrl: './apresentation.component.html',
  styleUrl: './apresentation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApresentationComponent {
  readonly chapters: Chapter[] = [
    {
      index: '01',
      eyebrow: 'Lapidação',
      title: 'Lapidado como',
      titleAccent: 'uma joia',
      text: 'Oito faces de vidro espesso capturam a luz e revelam o rosa da fragrância a cada movimento.',
    },
    {
      index: '02',
      eyebrow: 'Detalhe',
      title: 'Metal que se sente',
      titleAccent: 'na ponta dos dedos',
      text: 'O colar prateado, serrilhado ponto a ponto, emoldura o gesto de borrifar.',
    },
    {
      index: '03',
      eyebrow: 'Essência',
      title: 'Abra e',
      titleAccent: 'descubra',
      text: 'A tampa em cristal facetado se ergue e revela o spray — o começo de um ritual.',
    },
  ];

  readonly categories: Category[] = [
    { name: 'Perfumaria', caption: 'Fragrâncias que ficam na memória', hue: '#e9b3c2' },
    { name: 'Maquiagem', caption: 'Cor, textura e acabamento', hue: '#d9b8a0' },
    { name: 'Cuidados', caption: 'Rituais para pele e corpo', hue: '#c7c9d9' },
    { name: 'Presentes', caption: 'Para surpreender quem você ama', hue: '#e3c9a8' },
  ];

  readonly marquee = ['Fragrâncias', 'Maquiagem', 'Cuidados', 'Presentes', 'Autocuidado', 'Beleza'];

  /** Scroll progress through the story section, 0..1. */
  readonly progress = signal(0);
  readonly activeChapter = computed(() => Math.min(4, Math.max(0, Math.round(this.progress() * 4))));
  readonly progressLabel = computed(() => String(Math.max(1, this.activeChapter())).padStart(2, '0'));

  private readonly story = viewChild.required<ElementRef<HTMLElement>>('story');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      let frame = 0;
      const measure = () => {
        frame = 0;
        // Resolve the element on every measure: it is replaced if the view is re-created (e.g. dev HMR).
        const element = this.story().nativeElement;
        const rect = element.getBoundingClientRect();
        const travel = Math.max(1, element.offsetHeight - window.innerHeight);
        this.progress.set(Math.min(1, Math.max(0, -rect.top / travel)));
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(measure);
      };
      measure();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      });
    });
  }

  /** Subtle 3D tilt that follows the pointer on category cards. */
  tilt(event: PointerEvent): void {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
    card.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`);
    card.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
  }

  resetTilt(event: PointerEvent): void {
    const card = event.currentTarget as HTMLElement;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  }
}
