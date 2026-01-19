import { useState } from "react";

interface Pedido {
  id: number;
  cliente: string;
  email: string;
  fecha: string;
  estado: "Pendiente" | "En Proceso" | "Completado" | "Cancelado";
  productos: { nombre: string; cantidad: number; precio: string }[];
  total: string;
}

const IVA_PORCENTAJE = 12; // 12% de IVA

// Datos simulados
const pedidosMock: Pedido[] = [
  {
    id: 1,
    cliente: "Juan Pérez",
    email: "juan@mail.com",
    fecha: "2026-01-10",
    estado: "Pendiente",
    productos: [
      { nombre: "Camiseta Roja", cantidad: 2, precio: "10.00" },
      { nombre: "Laptop Gamer", cantidad: 1, precio: "1200.00" },
    ],
    total: "1220.00",
  },
  {
    id: 2,
    cliente: "Ana Gómez",
    email: "ana@mail.com",
    fecha: "2026-01-09",
    estado: "En Proceso",
    productos: [
      { nombre: "Cafetera", cantidad: 1, precio: "50.00" },
    ],
    total: "50.00",
  },
];

export default function ListadoPedidos() {
  const [pedidos] = useState(pedidosMock);
  const [busqueda, setBusqueda] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  const pedidosFiltrados = pedidos.filter((p) =>
    p.cliente.toLowerCase().includes(busqueda.toLowerCase())
  );

  const calcularSubTotal = (productos: Pedido["productos"]) => {
    return productos.reduce((acc, prod) => acc + parseFloat(prod.precio) * prod.cantidad, 0);
  };

  const calcularIVA = (subtotal: number) => {
    return (subtotal * IVA_PORCENTAJE) / 100;
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Listado de Pedidos</h2>

      {/* Buscador */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por cliente..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPedidoSeleccionado(null);
          }}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Listado o detalle */}
      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col gap-4 overflow-y-auto">
        {!pedidoSeleccionado ? (
          pedidosFiltrados.length > 0 ? (
            pedidosFiltrados.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-gray-300 hover:bg-red-100 cursor-pointer flex justify-between items-center"
                onClick={() => setPedidoSeleccionado(p)}
              >
                <div>
                  <p className="font-semibold text-neutral-950">{p.cliente}</p>
                  <p className="text-sm text-neutral-700">{p.fecha} - {p.estado}</p>
                </div>
                <p className="font-semibold text-neutral-950">${p.total}</p>
              </div>
            ))
          ) : (
            <p className="text-neutral-950 text-lg">No se encontraron pedidos</p>
          )
        ) : (
          // Detalle de pedido
          <form className="flex flex-col gap-6">
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Cliente</label>
              <input
                type="text"
                value={pedidoSeleccionado.cliente}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={pedidoSeleccionado.email}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">Fecha</label>
                <input
                  type="text"
                  value={pedidoSeleccionado.fecha}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">Estado</label>
                <input
                  type="text"
                  value={pedidoSeleccionado.estado}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Productos */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Productos</label>
              <div className="space-y-2">
                {pedidoSeleccionado.productos.map((prod, i) => (
                  <div key={i} className="flex justify-between border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                    <span>{prod.nombre} x{prod.cantidad}</span>
                    <span>${prod.precio}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SubTotal, IVA y Total */}
            {(() => {
              const subtotal = calcularSubTotal(pedidoSeleccionado.productos);
              const iva = calcularIVA(subtotal);
              const total = subtotal + iva;
              return (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-neutral-950 font-semibold mb-2">SubTotal</label>
                    <input
                      type="text"
                      value={`$${subtotal.toFixed(2)}`}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-950 font-semibold mb-2">IVA ({IVA_PORCENTAJE}%)</label>
                    <input
                      type="text"
                      value={`$${iva.toFixed(2)}`}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-950 font-semibold mb-2">Total</label>
                    <input
                      type="text"
                      value={`$${total.toFixed(2)}`}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed"
                    />
                  </div>
                </div>
              );
            })()}

            {/* Botón volver */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors"
                onClick={() => setPedidoSeleccionado(null)}
              >
                Volver al listado
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
