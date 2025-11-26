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
            <pre key={`code-${index}`} className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto mb-4 text-sm">
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
          <h2 key={index} className="text-xl font-bold text-slate-900 mt-6 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
            {line.replace('## ', '')}
          </h2>
        );
        return;
      }

      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-slate-800 mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }

      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-slate-900 mt-4 mb-4">
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
            return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
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
            return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
        elements.push(
          <div key={index} className="flex gap-2 mb-2 ml-4">
            <span className="text-purple-600 font-semibold">{line.match(/^\d+/)[0]}.</span>
            <span className="text-slate-700">{processedContent}</span>
          </div>
        );
        return;
      }

      // Separador horizontal
      if (line === '---') {
        flushList();
        elements.push(<hr key={index} className="my-6 border-slate-200" />);
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
          return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        // Procesar código inline
        return part.split(/(`[^`]+`)/g).map((subPart, j) => {
          if (subPart.startsWith('`') && subPart.endsWith('`')) {
            return <code key={j} className="bg-slate-100 px-1.5 py-0.5 rounded text-purple-700 text-sm">{subPart.slice(1, -1)}</code>;
          }
          return subPart;
        });
      });

      elements.push(
        <p key={index} className="text-slate-700 mb-3 leading-relaxed">
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] m-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Análisis con IA
                <Sparkles className="w-5 h-5 text-purple-500" />
              </h2>
              <p className="text-sm text-slate-600">Powered by Google Gemini</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {analisis && (
              <>
                <button
                  onClick={copiarAnalisis}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                  title="Copiar análisis"
                >
                  {copiado ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">Copiado</span>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                  title="Descargar como Markdown"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {cargando ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin relative" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900">Analizando resultados...</p>
                <p className="text-sm text-slate-600 mt-1">
                  Gemini AI está procesando los datos de optimización
                </p>
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : analisis ? (
            <div className="prose prose-slate max-w-none">
              {renderMarkdown(analisis)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Brain className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500">No hay análisis disponible</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Análisis generado con Google Gemini AI</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
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
