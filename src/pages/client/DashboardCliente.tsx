import { useState } from "react";
import InicioCliente from "./InicioCliente";
import ProductosCliente from "./ProductosCliente";
import ComprasCliente from "./ComprasCliente";
import PerfilCliente from "./PerfilCliente";
import SoporteCliente from "./SoporteCliente";

export default function DashboardCliente() {
  const [seccionActiva, setSeccionActiva] = useState("inicio");

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">

      {/* Menú lateral */}
      <aside className="w-64 bg-gradient-to-b from-cyan-500 to-blue-600 text-white flex flex-col justify-between">
        {/* Branding */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-cyan-600 font-black text-2xl">N</span>
            </div>
            <span className="text-3xl font-bold tracking-tight">Nexora</span>
          </div>
        </div>

        {/* Items del menú */}
        <nav className="flex-1 px-6 space-y-4">
          <BotonMenu titulo="Inicio" activo={seccionActiva==="inicio"} onClick={()=>setSeccionActiva("inicio")} />
          <BotonMenu titulo="Productos" activo={seccionActiva==="productos"} onClick={()=>setSeccionActiva("productos")} />
          <BotonMenu titulo="Compras" activo={seccionActiva==="compras"} onClick={()=>setSeccionActiva("compras")} />
          <BotonMenu titulo="Perfil" activo={seccionActiva==="perfil"} onClick={()=>setSeccionActiva("perfil")} />
          <BotonMenu titulo="Soporte" activo={seccionActiva==="soporte"} onClick={()=>setSeccionActiva("soporte")} />
        </nav>

        {/* Footer / Cerrar sesión */}
        <div className="p-6 border-t border-white/20">
          <button className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/20 transition-colors text-lg font-semibold">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Área de contenido */}
      <main className="flex-1 p-16">
        {seccionActiva === "inicio" && <InicioCliente />}
        {seccionActiva === "productos" && <ProductosCliente />}
        {seccionActiva === "compras" && <ComprasCliente />}
        {seccionActiva === "perfil" && <PerfilCliente />}
        {seccionActiva === "soporte" && <SoporteCliente />}
      </main>
    </div>
  )
}

/* COMPONENTE BOTÓN MENÚ */
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
