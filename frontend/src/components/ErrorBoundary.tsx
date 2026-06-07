import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorCount: 0,
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 ErrorBoundary capturó un error:', error)
    console.error('Stack del componente:', errorInfo.componentStack)
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    const baseUrl = (import.meta as any).env?.BASE_URL || '/'
    window.location.href = baseUrl
  }

  public render() {
    if (this.state.hasError) {
      const isCritical = this.state.errorCount > 3

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 flex items-center justify-center p-4">
          <div className="card-premium max-w-2xl w-full p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="text-7xl mb-4 animate-bounce">❌</div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text-primary mb-2">
                Algo salió mal
              </h1>
              <p className="text-gray-600 text-lg">
                La aplicación encontró un {isCritical ? 'error crítico' : 'error inesperado'}
              </p>
            </div>

            {this.state.error && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 mb-6">
                <h2 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                  <span>🔍</span> Detalles del Error
                </h2>
                <p className="text-sm text-red-800 font-mono bg-white rounded-lg p-3 mb-3">
                  {this.state.error.message}
                </p>
                {isCritical && (
                  <p className="text-xs text-red-700 font-semibold">
                    ⚠️ Error crítico detectado. Se recomienda limpiar datos y reintentar.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <button
                onClick={this.resetError}
                className="btn-primary"
              >
                🏠 Ir al Inicio
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                🔄 Recargar
              </button>
              <button
                onClick={() => {
                  localStorage.clear()
                  const baseUrl = (import.meta as any).env?.BASE_URL || '/'
                  window.location.href = `${baseUrl}login`.replace('//', '/')
                }}
                className="btn-danger"
              >
                🧹 Limpiar y Reiniciar
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-bold">💡 Tip:</span> Si el problema persiste, abre la consola (F12), verifica los errores y contacta con soporte.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
