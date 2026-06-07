import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Глобальный перехватчик ошибок рендера: вместо «белого экрана»
 * показывает сообщение и кнопку перезагрузки приложения.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 24 }}>
          <div className="card" style={{ maxWidth: 480, textAlign: "center" }}>
            <h1 style={{ marginBottom: 8 }}>Что-то пошло не так</h1>
            <div className="sub" style={{ marginBottom: 16 }}>{this.state.error.message}</div>
            <button className="btn" onClick={this.reload}>Перезагрузить страницу</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
