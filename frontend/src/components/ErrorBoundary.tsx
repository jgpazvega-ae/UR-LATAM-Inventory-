import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 ErrorBoundary capturó un error:', error)
    console.error('Stack del componente:', errorInfo.componentStack)
    this.setState({ error, errorInfo })
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    const baseUrl = (import.meta as any).env?.BASE_URL || '/'
    window.location.href = baseUrl
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Ups! Algo salió mal
              </h1>
              <p className="text-gray-600">
                La aplicación encontró un error inesperado
              </p>
            </div>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h2 className="font-semibold text-red-800 mb-2">Error:</h2>
                <p className="text-sm text-red-700 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.resetError}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
              >
                🏠 Ir al Inicio
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition"
              >
                🔄 Recargar Página
              </button>
              <button
                onClick={() => {
                  localStorage.clear()
                  const baseUrl = (import.meta as any).env?.BASE_URL || '/'
                  window.location.href = `${baseUrl}login`.replace('//', '/')
                }}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition"
              >
                🧹 Limpiar Datos
              </button>
            </div>

            <div className="mt-6 pt-6 border-t text-xs text-gray-500 text-center">
              <p>Si el problema persiste, abre la consola (F12) y comparte los errores que aparecen.</p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
