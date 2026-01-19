import { useState } from "react";

interface Pedido {
  id: number;
  cliente: string;
  fecha: string;
  estado: "Pendiente" | "En Proceso" | "Completado" | "Cancelado";
  total: string;
}

// Datos simulados
const pedidosMock: Pedido[] = [
  { id: 1, cliente: "Juan Pérez", fecha: "2026-01-10", estado: "Pendiente", total: "1220.00" },
  { id: 2, cliente: "Ana Gómez", fecha: "2026-01-09", estado: "En Proceso", total: "50.00" },
  { id: 3, cliente: "Luis Torres", fecha: "2026-01-08", estado: "Completado", total: "200.00" },
];

export default function EstadoPedidos() {
  const [pedidos, setPedidos] = useState(pedidosMock);
  const [busqueda, setBusqueda] = useState("");

  const pedidosFiltrados = pedidos.filter((p) =>
    p.cliente.toLowerCase().includes(busqueda.toLowerCase())
  );

  const cambiarEstado = (id: number, nuevoEstado: Pedido["estado"]) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p))
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Estado de Pedidos</h2>

      {/* Buscador */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Listado */}
      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col gap-4 overflow-y-auto">
        {pedidosFiltrados.length > 0 ? (
          pedidosFiltrados.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-4 rounded-xl border border-gray-300 hover:bg-red-100"
            >
              <div>
                <p className="font-semibold text-neutral-950">{p.cliente}</p>
                <p className="text-sm text-neutral-700">{p.fecha}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-neutral-950">${p.total}</span>
                <select
                  value={p.estado}
                  onChange={(e) => cambiarEstado(p.id, e.target.value as Pedido["estado"])}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Completado">Completado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          ))
        ) : (
          <p className="text-neutral-950 text-lg">No se encontraron pedidos</p>
        )}
      </div>
    </div>
  );
}
