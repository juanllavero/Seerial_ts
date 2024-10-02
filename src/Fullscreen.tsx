import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from "react-redux"
import FullScreenMain from '@components/fullscreen/FullScreenMain'
import { store } from "./redux/store"
import './Fullscreen.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <FullScreenMain />
    </Provider>
  </React.StrictMode>,
)