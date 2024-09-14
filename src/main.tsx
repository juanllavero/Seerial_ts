import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from "react-redux"
import App from '@components/desktop/App'
import { store } from "./redux/store"
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import './index.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </PrimeReactProvider>
  </React.StrictMode>,
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})