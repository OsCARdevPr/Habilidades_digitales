"use client"
import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef } from "react"
import "./styles/products-styles.css"

import ejemploImg from '../assets/ejemplo.png'
// Datos de ejemplo para los productos
const products = [
  {
    id: 1,
    name: "Smartphone XYZ",
    category: "Electrónica",
    price: 599.99,
    stock: 15,
    image: ejemploImg,
    description: "Smartphone de última generación con cámara de alta resolución y batería de larga duración."
  },
  {
    id: 2,
    name: "Laptop Pro",
    category: "Electrónica",
    price: 1299.99,
    stock: 8,
    image: ejemploImg,
    description: "Laptop potente para profesionales con procesador de última generación."
  },
  {
    id: 3,
    name: "Auriculares Inalámbricos",
    category: "Electrónica",
    price: 129.99,
    stock: 25,
    image: ejemploImg,
    description: "Auriculares con cancelación de ruido y calidad de sonido premium."
  },
  {
    id: 4,
    name: "Zapatillas Running",
    category: "Deportes",
    price: 89.99,
    stock: 30,
    image: ejemploImg,
    description: "Zapatillas ligeras y cómodas para corredores profesionales."
  },
  {
    id: 5,
    name: "Balón de Fútbol",
    category: "Deportes",
    price: 29.99,
    stock: 50,
    image: ejemploImg,
    description: "Balón oficial de competición con excelente durabilidad."
  },
  {
    id: 6,
    name: "Camiseta Deportiva",
    category: "Ropa",
    price: 24.99,
    stock: 45,
    image: ejemploImg,
    description: "Camiseta transpirable para actividades deportivas."
  },
  {
    id: 7,
    name: "Jeans Premium",
    category: "Ropa",
    price: 59.99,
    stock: 20,
    image: ejemploImg,
    description: "Jeans de alta calidad con diseño moderno y cómodo."
  },
  {
    id: 8,
    name: "Reloj Inteligente",
    category: "Electrónica",
    price: 199.99,
    stock: 12,
    image: ejemploImg,
    description: "Reloj inteligente con múltiples funciones y monitoreo de salud."
  },
  {
    id: 9,
    name: "Libro Bestseller",
    category: "Libros",
    price: 19.99,
    stock: 35,
    image: ejemploImg,
    description: "El libro más vendido del año, una historia cautivadora."
  },
  {
    id: 10,
    name: "Set de Cocina",
    category: "Hogar",
    price: 149.99,
    stock: 10,
    image: ejemploImg,
    description: "Set completo de utensilios de cocina de acero inoxidable."
  },
  {
    id: 11,
    name: "Silla Ergonómica",
    category: "Hogar",
    price: 249.99,
    stock: 7,
    image: ejemploImg,
    description: "Silla de oficina con diseño ergonómico para mayor comodidad."
  },
  {
    id: 12,
    name: "Teclado Mecánico",
    category: "Electrónica",
    price: 89.99,
    stock: 18,
    image: ejemploImg,
    description: "Teclado mecánico para gamers con retroiluminación RGB."
  }
]

// Estado global del carrito (simulado)
let cartItems = []

const columnHelper = createColumnHelper()

// Componente de tarjeta de producto
const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image || "/placeholder.svg"} alt={product.name} />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button className="add-to-cart-btn" onClick={() => onAddToCart(product)}>
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [viewMode, setViewMode] = useState("cards") // "cards" o "table"
  const [cart, setCart] = useState([])
  
  // Obtener categorías únicas para el filtro
  const categories = useMemo(() => {
    return ["all", ...new Set(products.map(product => product.category))]
  }, [])
  
  // Filtrar productos por categoría
  const filteredProducts = useMemo(() => {
    return categoryFilter === "all" 
      ? products 
      : products.filter(product => product.category === categoryFilter)
  }, [categoryFilter])

  // Definir columnas para la tabla
  const columns = useMemo(
    () => [
      columnHelper.accessor("image", {
        header: "Imagen",
        cell: info => (
          <div className="product-image-cell">
            <img src={info.getValue() || "/placeholder.svg"} alt="Producto" />
          </div>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Producto",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor("category", {
        header: "Categoría",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor("price", {
        header: "Precio",
        cell: info => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor("stock", {
        header: "Stock",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor("id", {
        header: "Acciones",
        cell: info => (
          <button 
            className="add-to-cart-btn-small"
            onClick={() => handleAddToCart(products.find(p => p.id === info.getValue()))}
          >
            Añadir
          </button>
        ),
      }),
    ],
    []
  )

  // Configurar la tabla
  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  // Configurar el virtualizador para la tabla
  const tableContainerRef = useRef(null)
  
  const { rows } = table.getRowModel()
  
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50,
    overscan: 10,
  })

  // Función para añadir al carrito
  const handleAddToCart = (product) => {
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      // Si ya existe, incrementar la cantidad
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ))
    } else {
      // Si no existe, añadirlo con cantidad 1
      setCart([...cart, { ...product, quantity: 1 }])
    }
    
    // Actualizar el estado global (simulado)
    cartItems = [...cart]
    
    alert(`${product.name} añadido al carrito`)
  }

  return (
    <div className="products-container">
      <header className="products-header">
        <h1>Catálogo de Productos</h1>
        <div className="cart-icon">
          <a href="/carrito">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className="cart-count">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
          </a>
        </div>
      </header>
      
      <div className="products-controls">
        <div className="category-filter">
          <label htmlFor="category">Filtrar por categoría:</label>
          <select 
            id="category" 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "Todas las categorías" : category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="view-toggle">
          <button 
            className={viewMode === "cards" ? "active" : ""} 
            onClick={() => setViewMode("cards")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Tarjetas
          </button>
          <button 
            className={viewMode === "table" ? "active" : ""} 
            onClick={() => setViewMode("table")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            Tabla
          </button>
        </div>
      </div>
      
      {viewMode === "cards" ? (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={handleAddToCart} 
            />
          ))}
        </div>
      ) : (
        <div className="products-table-container" ref={tableContainerRef}>
          <table className="products-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const row = rows[virtualRow.index]
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
