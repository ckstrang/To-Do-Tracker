import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { RouterProvider } from 'react-router-dom'
import { router } from "./router"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <h1 className='text-center pt-4 text-3xl'>React + Supabase Task-Tracker</h1>
    <RouterProvider router={router} />
  </StrictMode>,
)
