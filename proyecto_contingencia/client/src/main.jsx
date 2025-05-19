import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  Link,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import HomePage from './pages/home.jsx'
import LoginPage from './pages/login.jsx'
import CarritoPage from './pages/orders.jsx'
import './index.css'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <nav className="p-4 bg-gray-100 flex gap-4">
        <Link to="/home" className="[&.active]:font-bold">Home</Link>
        <Link to="/" className="[&.active]:font-bold">Login</Link>
        <Link to="/carrito" className="[&.active]:font-bold">Carrito</Link>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </>
  ),
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: HomePage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
})

const carritoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/carrito',
  component: CarritoPage,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  carritoRoute,
])

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
