import React, { useState } from 'react';
import { X, Sparkles, Loader2, Brain, Copy, Check, Download } from 'lucide-react';

const AIAnalysisModal = ({ isOpen, onClose, analisis, cargando }) => {
  const [copiado, setCopiado] = useState(false);

  if (!isOpen) return null;

  const copiarAnalisis = () => {
    if (analisis) {
      navigator.clipboard.writeText(analisis);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const descargarAnalisis = () => {
    if (analisis) {
      const blob = new Blob([analisis], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analisis-ruta-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Función para renderizar Markdown básico
  const renderMarkdown = (text) => {
    if (!text) return null;

    // Dividir por líneas y procesar
    const lines = text.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeContent = [];
    let listItems = [];
    let inList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-slate-700">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    lines.forEach((line, index) => {
      // Bloques de código
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="bg-secondary text-primary p-4 rounded-xl border border-border/50 overflow-x-auto mb-4 text-sm font-mono shadow-inner">
              <code>{codeContent.join('\n')}</code>
            </pre>
          );
          codeContent = [];
        }
        inCodeBlock = !inCodeBlock;
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // Encabezados
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-xl font-black text-foreground mt-6 mb-3 flex items-center gap-2 border-b border-border/50 pb-2">
            {line.replace('## ', '')}
          </h2>
        );
        return;
      }

      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-bold text-foreground mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }

      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={index} className="text-2xl font-black text-foreground mt-4 mb-4 tracking-tight">
            {line.replace('# ', '')}
          </h1>
        );
        return;
      }

      // Listas
      if (line.match(/^[-*] /)) {
        inList = true;
        const content = line.replace(/^[-*] /, '');
        // Procesar negritas en el contenido
        const processedContent = content.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
        listItems.push(processedContent);
        return;
      }

      // Listas numeradas
      if (line.match(/^\d+\. /)) {
        flushList();
        const content = line.replace(/^\d+\. /, '');
        const processedContent = content.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
        elements.push(
          <div key={index} className="flex gap-2 mb-2 ml-4">
            <span className="text-primary font-black shadow-sm">{line.match(/^\d+/)[0]}.</span>
            <span className="text-muted-foreground">{processedContent}</span>
          </div>
        );
        return;
      }

      // Separador horizontal
      if (line === '---') {
        flushList();
        elements.push(<hr key={index} className="my-6 border-border/50" />);
        return;
      }

      // Líneas vacías
      if (line.trim() === '') {
        flushList();
        return;
      }

      // Párrafos normales con negritas
      flushList();
      const processedLine = line.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
        }
        // Procesar código inline
        return part.split(/(`[^`]+`)/g).map((subPart, j) => {
          if (subPart.startsWith('`') && subPart.endsWith('`')) {
            return <code key={j} className="bg-secondary px-1.5 py-0.5 rounded-md text-primary font-bold text-sm border border-border/50">{subPart.slice(1, -1)}</code>;
          }
          return subPart;
        });
      });

      elements.push(
        <p key={index} className="text-muted-foreground mb-3 leading-relaxed">
          {processedLine}
        </p>
      );
    });

    flushList();
    return elements;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] m-4 flex flex-col overflow-hidden border border-border/50 ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-secondary/40 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-[0_4px_14px_0_rgba(168,85,247,0.39)]">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                Análisis con IA
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </h2>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">Powered by Google Gemini</p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            {analisis && (
              <>
                <button
                  onClick={copiarAnalisis}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
                  title="Copiar análisis"
                >
                  {copiado ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
                <button
                  onClick={descargarAnalisis}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
                  title="Descargar como Markdown"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 styled-scrollbar">
          {cargando ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="w-12 h-12 text-primary animate-spin relative" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">Analizando resultados...</p>
                <p className="text-sm font-medium text-muted-foreground mt-2">
                  Gemini AI está procesando los datos de optimización
                </p>
              </div>
              <div className="flex gap-2">
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce shadow-[0_0_10px_rgba(235,86,101,0.5)]" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce shadow-[0_0_10px_rgba(235,86,101,0.5)]" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce shadow-[0_0_10px_rgba(235,86,101,0.5)]" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : analisis ? (
            <div className="prose prose-slate max-w-none dark:prose-invert">
              {renderMarkdown(analisis)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="bg-secondary/50 p-6 rounded-3xl border border-border/50 mb-4 inline-block">
                <Brain className="w-16 h-16 text-muted-foreground opacity-50 block mx-auto" />
              </div>
              <p className="text-muted-foreground font-medium text-lg">No hay análisis disponible</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-secondary/30 backdrop-blur-sm relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Análisis generado con Google Gemini AI</span>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(235,86,101,0.39)] hover:shadow-[0_6px_20px_rgba(235,86,101,0.23)] hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;
