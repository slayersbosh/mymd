import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with configuration
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
  },
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
  sequence: {
    useMaxWidth: true,
    diagramMarginX: 20,
    diagramMarginY: 20,
  },
});

interface MermaidChartProps {
  code: string;
  className?: string;
}

export function MermaidChart({ code, className = '' }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [id] = useState(() => `mermaid-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    let mounted = true;

    const render = async () => {
      try {
        const { svg: renderedSvg } = await mermaid.render(id, code.trim());
        if (mounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : 'Failed to render diagram');
          setSvg('');
        }
      }
    };

    render();

    return () => {
      mounted = false;
    };
  }, [code, id]);

  if (error) {
    return (
      <div className={`mermaid-error p-4 rounded bg-code-bg ${className}`}>
        <div className="text-error text-[13px] font-semibold mb-2">图表渲染错误</div>
        <div className="text-text-secondary text-[12px]">{error}</div>
        <pre className="mt-2 text-[11px] text-text-disabled overflow-x-auto">{code}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-chart flex items-center justify-center p-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Detect if code is mermaid diagram
export function isMermaidCode(code: string): boolean {
  const trimmed = code.trim();

  // Flowchart
  if (trimmed.startsWith('graph ') || trimmed.startsWith('flowchart')) {
    return true;
  }

  // Sequence diagram
  if (trimmed.startsWith('sequenceDiagram')) {
    return true;
  }

  // Class diagram
  if (trimmed.startsWith('classDiagram')) {
    return true;
  }

  // State diagram
  if (trimmed.startsWith('stateDiagram')) {
    return true;
  }

  // Entity relationship
  if (trimmed.startsWith('erDiagram')) {
    return true;
  }

  // Gantt chart
  if (trimmed.startsWith('gantt')) {
    return true;
  }

  // Pie chart
  if (trimmed.startsWith('pie')) {
    return true;
  }

  // Git graph
  if (trimmed.startsWith('gitGraph')) {
    return true;
  }

  return false;
}