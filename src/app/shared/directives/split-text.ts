/**
 * Quebra o texto de um elemento em palavras mascaradas:
 * <span class="w"><span class="w__i">palavra</span></span>
 * Mantém elementos filhos (<em>, <br>, <strong>) e aplica a quebra dentro deles.
 */
export function splitWords(root: HTMLElement): HTMLElement[] {
  const inners: HTMLElement[] = [];

  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? '';
        if (!text.trim()) continue;
        const frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const outer = document.createElement('span');
          outer.className = 'w';
          const inner = document.createElement('span');
          inner.className = 'w__i';
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
          inners.push(inner);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName !== 'BR') {
        walk(child);
      }
    }
  };

  walk(root);
  root.setAttribute('aria-label', root.textContent?.replace(/\s+/g, ' ').trim() ?? '');
  return inners;
}
