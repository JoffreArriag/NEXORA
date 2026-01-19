import { useState } from "react";
import { Plus, Edit, Trash2, Layers, Eye, FileText, CheckCircle, CreditCard, User, Key, History } from "lucide-react";
import AgregarProducto from "./Producto/AgregarProducto";
import EditarProducto from "./Producto/EditarProducto";
import EliminarProducto from "./Producto/EliminarProducto";
import AdministrarStock from "./Producto/AdministrarStock";
import VisibilidadProducto from "./Producto/VisibilidadProducto";
import AgregarCategoria from "./Categoria/AgregarCategoria";
import EditarCategoria from "./Categoria/EditarCategoria";
import EliminarCategoria from "./Categoria/EliminarCategoria";
import VisibilidadCategoria from "./Categoria/VisibilidadCategoria";
import ListadoPedidos from "./Pedido/ListadoPedidos";
import EstadoPedidos from "./Pedido/EstadoPedidos";
import FacturacionPedidos from "./Pedido/FacturacionPedidos";
import AgregarUsuario from "./Usuarios/AgregarUsuario";
import EditarUsuario from "./Usuarios/EditarUsuario";
import EliminarUsuario from "./Usuarios/EliminarUsuario";
import RolesYPermisos from "./Usuarios/RolesYPermisos";
import HistorialUsuario from "./Usuarios/HistorialUsuario";
import InformacionNegocio from "./Negocio/InformacionNegocio";
import CrearFactura from "./Factura/CrearFactura";
import EditarFactura from "./Factura/EditarFactura";
import EliminarFactura from "./Factura/EliminarFactura";
import InicioAdmin from "./InicioAdmin";

export default function DashboardAdmin() {
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [accion, setAccion] = useState("Agregar");
  const cambiarSeccion = (seccion: string) => {
    setSeccionActiva(seccion);
    if (seccion === "productos" || seccion === "categoria") {
      setAccion("Agregar");
    } else if (seccion === "pedidos") {
      setAccion("Listado");
    } else if (seccion === "usuarios" || seccion === "factura") {
      setAccion("Crear");
    } else {
      setAccion("");
    }
  };

  // Menús por sección
  const menuProductos = [
    { nombre: "Agregar", icon: <Plus className="w-5 h-5" /> },
    { nombre: "Editar", icon: <Edit className="w-5 h-5" /> },
    { nombre: "Eliminar", icon: <Trash2 className="w-5 h-5" /> },
    { nombre: "Stock", icon: <Layers className="w-5 h-5" /> },
    { nombre: "Visibilidad", icon: <Eye className="w-5 h-5" /> },
  ];

  const menuCategoria = [
    { nombre: "Agregar", icon: <Plus className="w-5 h-5" /> },
    { nombre: "Editar", icon: <Edit className="w-5 h-5" /> },
    { nombre: "Eliminar", icon: <Trash2 className="w-5 h-5" /> },
    { nombre: "Visibilidad", icon: <Eye className="w-5 h-5" /> },
  ];

  const menuPedidos = [
    { nombre: "Listado", icon: <FileText className="w-5 h-5" /> },
    { nombre: "Estado", icon: <CheckCircle className="w-5 h-5" /> },
    { nombre: "Facturación", icon: <CreditCard className="w-5 h-5" /> },
  ];

  const menuUsuarios = [
    { nombre: "Crear", icon: <User className="w-5 h-5" /> },
    { nombre: "Editar", icon: <Edit className="w-5 h-5" /> },
    { nombre: "Eliminar", icon: <Trash2 className="w-5 h-5" /> },
    { nombre: "Roles y Permiso", icon: <Key className="w-5 h-5" /> },
    { nombre: "Historial", icon: <History className="w-5 h-5" /> },
  ];

  const menuFactura = [
    { nombre: "Crear", icon: <User className="w-5 h-5" /> },
    { nombre: "Editar", icon: <Edit className="w-5 h-5" /> },
    { nombre: "Eliminar", icon: <Trash2 className="w-5 h-5" /> },
  ];

  const getMenu = () => {
    switch (seccionActiva) {
      case "productos": return menuProductos;
      case "categoria": return menuCategoria;
      case "pedidos": return menuPedidos;
      case "usuarios": return menuUsuarios;
      case "factura": return menuFactura;
      default: return [];
    }
  };

  return (
    <div className="h-screen flex bg-[#f8fafc] overflow-hidden">
      {/* Menú lateral */}
      <aside className="w-64 bg-gradient-to-b from-red-500 to-red-700 text-white flex flex-col relative">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-red-600 font-black text-2xl">N</span>
            </div>
            <span className="text-3xl font-bold tracking-tight">Nexora</span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-4">
          <BotonMenu titulo="Inicio" activo={seccionActiva === "inicio"} onClick={() => cambiarSeccion("inicio")} />
          <BotonMenu titulo="Gestión de Productos" activo={seccionActiva === "productos"} onClick={() => cambiarSeccion("productos")} />
          <BotonMenu titulo="Gestión de Categoria" activo={seccionActiva === "categoria"} onClick={() => cambiarSeccion("categoria")} />
          <BotonMenu titulo="Gestión de Pedidos" activo={seccionActiva === "pedidos"} onClick={() => cambiarSeccion("pedidos")} />
          <BotonMenu titulo="Gestión de Usuarios" activo={seccionActiva === "usuarios"} onClick={() => cambiarSeccion("usuarios")} />
          <BotonMenu titulo="Gestión de Facturas" activo={seccionActiva === "factura"} onClick={() => cambiarSeccion("factura")} />
          <BotonMenu titulo="Información del Negocio" activo={seccionActiva === "negocio"} onClick={() => cambiarSeccion("negocio")} />
        </nav>

        <div className="p-6 border-t border-white/20 absolute bottom-0 w-full">
          <button className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/20 transition-colors text-lg font-semibold">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Área de contenido */}
      <main className="flex-1 p-16 overflow-y-auto">
        {seccionActiva === "inicio" ? (
          <InicioAdmin onNavigate={(seccion) => setSeccionActiva(seccion)} />
        ) : (
          <>
            <h1 className="text-5xl font-black text-neutral-950 mb-6">
              {seccionActiva === "productos" && "Gestión de Productos"}
              {seccionActiva === "categoria" && "Gestión de Categorías"}
              {seccionActiva === "pedidos" && "Gestión de Pedidos"}
              {seccionActiva === "usuarios" && "Gestión de Usuarios"}
              {seccionActiva === "factura" && "Gestión de Facturas"}
              {seccionActiva === "negocio" && "Información del Negocio"}
            </h1>

            <p className="text-lg text-neutral-950 mb-6">
              {seccionActiva === "productos" && "Aquí puedes crear, editar y eliminar productos."}
              {seccionActiva === "categoria" && "Aquí puedes crear, editar y eliminar categorías."}
              {seccionActiva === "pedidos" && "Revisa y gestiona todos los pedidos realizados por los clientes."}
              {seccionActiva === "usuarios" && "Gestiona los usuarios registrados y sus roles."}
              {seccionActiva === "factura" && "Gestiona las facturas emitidas a los clientes."}
              {seccionActiva === "negocio" && "Visualiza y edita la información del negocio, como nombre, dirección y contacto."}
            </p>

            {/* Barra horizontal dinámica */}
            {seccionActiva !== "negocio" && (
              <div className="flex gap-4 mb-8 flex-wrap">
                {getMenu().map((item) => (
                  <button
                    key={item.nombre}
                    className={`flex items-center gap-2 py-2 px-4 rounded-xl font-semibold transition-colors
                      ${accion === item.nombre
                        ? "bg-red-600 text-white"
                        : "bg-white/10 text-neutral-950 hover:bg-white/20 hover:text-neutral-800"}`}
                    onClick={() => setAccion(item.nombre)}
                  >
                    {item.icon} {item.nombre}
                  </button>
                ))}
              </div>
            )}

            {/* Contenido dinámico */}
            <div className="bg-transparent p-8 rounded-3xl min-h-[400px] text-neutral-950 flex items-start justify-center">
              {seccionActiva === "productos" && accion === "Agregar" && <AgregarProducto />}
              {seccionActiva === "productos" && accion === "Editar" && <EditarProducto />}
              {seccionActiva === "productos" && accion === "Eliminar" && <EliminarProducto />}
              {seccionActiva === "productos" && accion === "Stock" && <AdministrarStock />}
              {seccionActiva === "productos" && accion === "Visibilidad" && <VisibilidadProducto />}

              {seccionActiva === "categoria" && accion === "Agregar" && <AgregarCategoria />}
              {seccionActiva === "categoria" && accion === "Editar" && <EditarCategoria />}
              {seccionActiva === "categoria" && accion === "Eliminar" && <EliminarCategoria />}
              {seccionActiva === "categoria" && accion === "Visibilidad" && <VisibilidadCategoria />}

              {seccionActiva === "pedidos" && accion === "Listado" && <ListadoPedidos />}
              {seccionActiva === "pedidos" && accion === "Estado" && <EstadoPedidos />}
              {seccionActiva === "pedidos" && accion === "Facturación" && <FacturacionPedidos />}

              {seccionActiva === "usuarios" && accion === "Crear" && <AgregarUsuario />}
              {seccionActiva === "usuarios" && accion === "Editar" && <EditarUsuario />}
              {seccionActiva === "usuarios" && accion === "Eliminar" && <EliminarUsuario />}
              {seccionActiva === "usuarios" && accion === "Roles y Permiso" && <RolesYPermisos />}
              {seccionActiva === "usuarios" && accion === "Historial" && <HistorialUsuario />}

              {seccionActiva === "negocio" && <InformacionNegocio />}

              {seccionActiva === "factura" && accion === "Crear" && <CrearFactura />}
              {seccionActiva === "factura" && accion === "Editar" && <EditarFactura />}
              {seccionActiva === "factura" && accion === "Eliminar" && <EliminarFactura />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// Botón lateral
interface BotonMenuProps { titulo:string; activo:boolean; onClick:()=>void }
function BotonMenu({ titulo, activo, onClick }: BotonMenuProps) {
  return (
    <button
      className={`w-full text-left py-3 px-4 rounded-xl text-lg font-semibold transition-colors
        ${activo ? "bg-white/20" : "hover:bg-white/10"}`}
      onClick={onClick}
    >
      {titulo}
    </button>
  )
}
