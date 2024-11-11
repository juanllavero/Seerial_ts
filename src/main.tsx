import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from "react-redux"
import MainDesktop from './windows/desktop/MainDesktop'
import { store } from "./redux/store"
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import './index.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <Provider store={store}>
        <MainDesktop />
      </Provider>
    </PrimeReactProvider>
  </React.StrictMode>,
)