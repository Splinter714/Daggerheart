import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/panels.css'
import './styles/cards.css'
import './styles/editor.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App mode="control" />
  </React.StrictMode>,
)
