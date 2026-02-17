import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter} from 'react-router'
import {RouterProvider} from 'react-router/dom'

import Calculator from './componenets/pages/calculator'
const router = createBrowserRouter([
  {
    path: '/',
    element: <Calculator/>
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)
