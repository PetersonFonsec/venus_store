import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatBRL = (value: number): string => formatter.format(value);

@Pipe({ name: 'brl', standalone: true })
export class BrlPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value == null ? '' : formatBRL(value);
  }
}
