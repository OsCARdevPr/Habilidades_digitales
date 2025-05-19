"use client"
import { useState, useMemo } from "react"
import { useReactTable, getCoreRowModel, createColumnHelper, flexRender } from "@tanstack/react-table"
import "./styles/cart-styles.css"

import ejemploImg from '../assets/ejemplo.png'
// Datos de ejemplo para el carrito (normalmente vendrían de un estado global o contexto)
const initialCartItems = [
  {
    id: 1,
    name: "Smartphone XYZ",
    category: "Electrónica",
    price: 599.99,
    image: ejemploImg,
    quantity: 1,
  },
  {
    id: 4,
    name: "Zapatillas Running",
    category: "Deportes",
    price: 89.99,
    image: ejemploImg,
    quantity: 2,
  },
  {
    id: 7,
    name: "Jeans Premium",
    category: "Ropa",
    price: 59.99,
    image: ejemploImg,
    quantity: 1,
  },
]

const columnHelper = createColumnHelper()

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems)

  // Calcular el total del carrito
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cartItems])

  // Definir columnas para la tabla
  const columns = useMemo(
    () => [
      columnHelper.accessor("image", {
        header: "Imagen",
        cell: (info) => (
          <div className="cart-item-image">
            <img src={info.getValue() || "/placeholder.svg"} alt="Producto" />
          </div>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Producto",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("price", {
        header: "Precio",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor("quantity", {
        header: "Cantidad",
        cell: (info) => {
          const item = info.row.original
          return (
            <div className="quantity-control">
              <button
                className="quantity-btn"
                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="quantity-value">{info.getValue()}</span>
              <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                +
              </button>
            </div>
          )
        },
      }),
      columnHelper.accessor((row) => row.price * row.quantity, {
        id: "subtotal",
        header: "Subtotal",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor("id", {
        header: "Acciones",
        cell: (info) => (
          <button className="remove-btn" onClick={() => removeItem(info.getValue())}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        ),
      }),
    ],
    [],
  )

  // Configurar la tabla
  const table = useReactTable({
    data: cartItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Función para actualizar la cantidad
  const updateQuantity = (id, newQuantity) => {
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  // Función para eliminar un item
  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  // Función para finalizar la compra
  const handleCheckout = () => {
    alert(`Compra finalizada. Total: $${cartTotal.toFixed(2)}`)
    setCartItems([])
  }

  return (
    <div className="cart-container">
      <header className="cart-header">
        <h1>Tu Carrito de Compras</h1>
        <a href="/products" className="continue-shopping">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Continuar comprando
        </a>
      </header>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p>Tu carrito está vacío</p>
          <a href="/products" className="shop-now-btn">
            Comprar ahora
          </a>
        </div>
      ) : (
        <>
          <div className="cart-table-container">
            <table className="cart-table">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-summary">
            <div className="cart-total">
              <span>Total:</span>
              <span className="total-amount">${cartTotal.toFixed(2)}</span>
            </div>

            <div className="cart-actions">
              <button className="update-cart-btn" onClick={() => alert("Carrito actualizado")}>
                Actualizar carrito
              </button>
              <button className="checkout-btn" onClick={handleCheckout}>
                Finalizar compra
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
