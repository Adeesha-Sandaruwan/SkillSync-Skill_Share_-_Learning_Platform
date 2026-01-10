import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- Import Router
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx' // <--- Import AuthProvider

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter> {/* <--- Router must be the parent */}
            <AuthProvider> {/* <--- AuthProvider inside Router */}
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)