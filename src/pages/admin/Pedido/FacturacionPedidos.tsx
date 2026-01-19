import { useState } from "react";

interface ItemFactura {
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Factura {
  id: number;
  tipodocumento: string;
  numerodocumento: string;
  fechaRegistro: string;
  negocio: {
    nombre: string;
    ruc: string;
    direccion: string;
    telefono: string;
    email: string;
    ciudad: string;
  };
  cliente: {
    documento: string;
    nombre: string;
    correo: string;
    telefono: string;
    direccion?: string;
  };
  usuarioRegistro: string;
  items: ItemFactura[];
  mensajePie: string;
}

const facturasMock: Factura[] = [
  {
    id: 1,
    tipodocumento: "Factura",
    numerodocumento: "F001-123",
    fechaRegistro: "2026-01-10",
    negocio: {
      nombre: "Nexora",
      ruc: "0999999999",
      direccion: "Av. Ejemplo 123",
      telefono: "0981234567",
      email: "info@nexora.com",
      ciudad: "Quito",
    },
    cliente: {
      documento: "1723456789",
      nombre: "Cliente A",
      correo: "clientea@email.com",
      telefono: "0987654321",
      direccion: "Calle Falsa 123",
    },
    usuarioRegistro: "admin",
    items: [
      { nombre: "Camiseta Roja", precio: 10, cantidad: 2 },
      { nombre: "Laptop Gamer", precio: 1200, cantidad: 1 },
    ],
    mensajePie: "Gracias por su compra. ¡Vuelva pronto!",
  },
];

export default function FacturacionPedidos() {
  const [facturas] = useState(facturasMock);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<Factura | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const calcularSubtotal = (items: ItemFactura[]) =>
    items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const calcularIVA = (subtotal: number) => subtotal * 0.12;

  const facturasFiltradas = facturas.filter(
    (f) =>
      f.numerodocumento.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-transparent p-6">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Facturación de Pedidos</h2>

      {!facturaSeleccionada ? (
        <div className="flex flex-col gap-4">
          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar por número de factura o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
          />

          {/* Listado de facturas */}
          {facturasFiltradas.length > 0 ? (
            facturasFiltradas.map((f) => (
              <div
                key={f.id}
                className="flex justify-between items-center p-4 rounded-xl border border-gray-300 hover:bg-red-100 cursor-pointer"
                onClick={() => setFacturaSeleccionada(f)}
              >
                <div>
                  <p className="font-semibold text-neutral-950">{f.cliente.nombre}</p>
                  <p className="text-sm text-neutral-700">{f.tipodocumento} - {f.numerodocumento}</p>
                </div>
                <span className="font-semibold text-neutral-950">
                  ${calcularSubtotal(f.items).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-neutral-950 text-lg">No se encontraron facturas</p>
          )}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-5xl mx-auto flex flex-col gap-6 overflow-y-auto">

          {/* Cabecera tipo factura */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-red-500 rounded-lg flex items-center justify-center text-white font-black text-2xl">
                Logo
              </div>
              <div className="flex flex-col gap-1 text-neutral-950 font-semibold">
                <p>{facturaSeleccionada.negocio.nombre}</p>
                <p>RUC: {facturaSeleccionada.negocio.ruc}</p>
                <p>Dirección: {facturaSeleccionada.negocio.direccion}</p>
                <p>Teléfono: {facturaSeleccionada.negocio.telefono}</p>
                <p>Email: {facturaSeleccionada.negocio.email}</p>
                <p>Ciudad: {facturaSeleccionada.negocio.ciudad}</p>
              </div>
            </div>
            <div className="flex flex-col text-right text-neutral-950 font-semibold">
              <p>{facturaSeleccionada.tipodocumento} Nº: {facturaSeleccionada.numerodocumento}</p>
              <p>Fecha: {facturaSeleccionada.fechaRegistro}</p>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 flex flex-col gap-1 text-neutral-950 font-semibold">
              <p>Documento: {facturaSeleccionada.cliente.documento}</p>
              <p>Nombre: {facturaSeleccionada.cliente.nombre}</p>
              {facturaSeleccionada.cliente.direccion && <p>Dirección: {facturaSeleccionada.cliente.direccion}</p>}
            </div>
            <div className="flex-1 flex flex-col gap-1 text-neutral-950 font-semibold">
              <p>Correo: {facturaSeleccionada.cliente.correo}</p>
              <p>Teléfono: {facturaSeleccionada.cliente.telefono}</p>
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg text-left">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2">Precio</th>
                  <th className="px-4 py-2">Cantidad</th>
                  <th className="px-4 py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {facturaSeleccionada.items.map((item, idx) => (
                  <tr key={idx} className="border-t border-gray-300">
                    <td className="px-4 py-2">{item.nombre}</td>
                    <td className="px-4 py-2">${item.precio.toFixed(2)}</td>
                    <td className="px-4 py-2">{item.cantidad}</td>
                    <td className="px-4 py-2">${(item.precio * item.cantidad).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="flex flex-col items-end gap-2 mt-4 font-semibold">
            <p>Subtotal: ${calcularSubtotal(facturaSeleccionada.items).toFixed(2)}</p>
            <p>IVA 12%: ${calcularIVA(calcularSubtotal(facturaSeleccionada.items)).toFixed(2)}</p>
            <p>Total: ${(calcularSubtotal(facturaSeleccionada.items) + calcularIVA(calcularSubtotal(facturaSeleccionada.items))).toFixed(2)}</p>
          </div>

          {/* Mensaje pie */}
          <div className="mt-6 text-center text-neutral-700 italic">
            {facturaSeleccionada.mensajePie}
          </div>

          {/* Botones volver, descargar e imprimir */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors"
              onClick={() => setFacturaSeleccionada(null)}
            >
              Volver al listado
            </button>
            <button
              type="button"
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
              onClick={() => alert("Función Descargar aquí")}
            >
              Descargar
            </button>
            <button
              type="button"
              className="bg-green-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-green-700 transition-colors"
              onClick={() => alert("Función Imprimir aquí")}
            >
              Imprimir
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
