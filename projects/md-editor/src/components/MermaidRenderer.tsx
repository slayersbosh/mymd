import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid once
let initialized = false;

function initMermaid() {
  if (initialized) return;
  initialized = true;

  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
      primaryColor: '#FF6B00',
      primaryTextColor: '#E8E8E8',
      primaryBorderColor: '#2D2D2D',
      lineColor: '#888888',
      secondaryColor: '#1E1E1E',
      tertiaryColor: '#1A1A1A',
      background: '#0D0D0D',
      mainBkg: '#1A1A1A',
      nodeBorder: '#2D2D2D',
      clusterBkg: '#141414',
      titleColor: '#E8E8E8',
      edgeLabelBackground: '#1A1A1A',
      fontFamily: "'Noto Sans', sans-serif",
    },
  });
}

export function useMermaidRenderer(containerSelector: string = '.mermaid-render') {
  const rendered = useRef<Set<string>>(new Set());

  useEffect(() => {
    initMermaid();

    const containers = document.querySelectorAll<HTMLElement>(containerSelector);
    if (containers.length === 0) return;

    let hasUnrendered = false;

    containers.forEach((container) => {
      const id = container.id;
      const code = container.getAttribute('data-mermaid-code');

      if (!id || !code || rendered.current.has(id)) {
        return;
      }

      hasUnrendered = true;
      rendered.current.add(id);

      mermaid.render(id, code.trim())
        .then(({ svg }) => {
          container.innerHTML = svg;
        })
        .catch((error) => {
          console.error('Mermaid render error:', error);
          container.innerHTML = `<div class="text-error text-[12px]">图表渲染失败</div>`;
        });
    });

    // Re-render on content changes using MutationObserver
    if (hasUnrendered) {
      const observer = new MutationObserver(() => {
        // Re-trigger rendering for new containers
        const newContainers = document.querySelectorAll<HTMLElement>(containerSelector);
        newContainers.forEach((container) => {
          const id = container.id;
          if (!rendered.current.has(id)) {
            const code = container.getAttribute('data-mermaid-code');
            if (id && code) {
              rendered.current.add(id);
              mermaid.render(id, code.trim())
                .then(({ svg }) => {
                  container.innerHTML = svg;
                })
                .catch((error) => {
                  console.error('Mermaid render error:', error);
                });
            }
          }
        });
      });

      const editorContent = document.querySelector('.editor-content');
      if (editorContent) {
        observer.observe(editorContent, { childList: true, subtree: true });
      }
    }
  }, [containerSelector]);
}

// Component that wraps content and renders mermaid charts
export function MermaidRenderer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      const containers = containerRef.current?.querySelectorAll<HTMLElement>('.mermaid-render');
      if (!containers || containers.length === 0) return;

      initMermaid();

      containers.forEach((container) => {
        const id = container.id;
        const code = container.getAttribute('data-mermaid-code');

        if (id && code) {
          mermaid.render(id, code.trim())
            .then(({ svg }) => {
              container.innerHTML = svg;
            })
            .catch((error) => {
              console.error('Mermaid render error:', error);
            });
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [children]);

  return <div ref={containerRef}>{children}</div>;
}