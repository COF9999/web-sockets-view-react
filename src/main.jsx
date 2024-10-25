import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom"
import {App} from './routes/App.jsx'
import { ErrorPage } from './routes/Error-page.jsx'


const router = createBrowserRouter([
  {
    path:"/",
    element:<div>Hello world!</div>,
    errorElement:<ErrorPage/>
  },
  {
    path:"/chat/:roomId/:idPerson",
    element:<App/>
  },
  
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider
      router={router}
    />
  </StrictMode>,
)
