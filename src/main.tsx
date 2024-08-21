import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from "react-redux"
import App from '@components/desktop/App'
import { store } from "./redux/store"
import './index.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})