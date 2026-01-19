import { useState } from "react";

interface ItemFactura {
  nombre: string;
  precio: number;
  cantidad: number;
  precioMayor?: boolean;
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
    direccion: string;
  };
  usuarioRegistro: string;
  items: ItemFactura[];
  mensajePie: string;
}

// Mock de facturas existentes
const facturasMock: Factura[] = [
  {
    id: 1,
    tipodocumento: "Factura",
    numerodocumento: "F001-001",
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
      { nombre: "Camiseta Roja", precio: 10, cantidad: 2, precioMayor: false },
      { nombre: "Laptop Gamer", precio: 1200, cantidad: 1, precioMayor: true },
    ],
    mensajePie: "Gracias por su compra. ¡Vuelva pronto!",
  },
  {
    id: 2,
    tipodocumento: "Factura",
    numerodocumento: "F001-002",
    fechaRegistro: "2026-01-11",
    negocio: {
      nombre: "Nexora",
      ruc: "0999999999",
      direccion: "Av. Ejemplo 123",
      telefono: "0981234567",
      email: "info@nexora.com",
      ciudad: "Quito",
    },
    cliente: {
      documento: "1723456790",
      nombre: "Cliente B",
      correo: "clienteb@email.com",
      telefono: "0987654322",
      direccion: "Av. Siempre Viva 456",
    },
    usuarioRegistro: "admin",
    items: [
      { nombre: "Zapatos", precio: 50, cantidad: 1, precioMayor: false },
    ],
    mensajePie: "Gracias por su compra. ¡Vuelva pronto!",
  },
];

export default function EditarFactura() {
  const [facturas] = useState<Factura[]>(facturasMock);
  const [busqueda, setBusqueda] = useState("");
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<Factura | null>(null);

  const actualizarItem = (index: number, key: keyof ItemFactura, value: string | number | boolean) => {
    if (!facturaSeleccionada) return;
    const nuevosItems = [...facturaSeleccionada.items];
    if (key === "nombre" && typeof value === "string") nuevosItems[index][key] = value;
    if ((key === "precio" || key === "cantidad") && typeof value === "number") nuevosItems[index][key] = value;
    if (key === "precioMayor" && typeof value === "boolean") nuevosItems[index][key] = value;
    setFacturaSeleccionada({ ...facturaSeleccionada, items: nuevosItems });
  };

  const agregarItem = () => {
    if (!facturaSeleccionada) return;
    setFacturaSeleccionada({
      ...facturaSeleccionada,
      items: [...facturaSeleccionada.items, { nombre: "", precio: 0, cantidad: 1, precioMayor: false }],
    });
  };

  const calcularSubtotalItem = (item: ItemFactura) =>
    item.precioMayor ? item.precio * item.cantidad * 0.9 : item.precio * item.cantidad;

  const calcularSubtotal = () =>
    facturaSeleccionada ? facturaSeleccionada.items.reduce((acc, item) => acc + calcularSubtotalItem(item), 0) : 0;
  const calcularIVA = () => calcularSubtotal() * 0.12;
  const calcularTotal = () => calcularSubtotal() + calcularIVA();

  const facturasFiltradas = facturas.filter(
    (f) =>
      f.numerodocumento.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-transparent p-6">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Editar Facturas</h2>

      {!facturaSeleccionada ? (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Buscar por número de factura o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
          />

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
                  ${f.items.reduce((acc, item) => acc + calcularSubtotalItem(item), 0).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-neutral-950 text-lg">No se encontraron facturas</p>
          )}
        </div>
      ) : (
        // Aquí se muestra el diseño completo de CrearFactura
        <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-5xl mx-auto flex flex-col gap-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-6 border-b border-gray-300 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-red-500 rounded-lg flex items-center justify-center text-white font-black text-2xl">Logo</div>
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
              <label className="mb-1">Tipo Documento</label>
              <select
                value={facturaSeleccionada.tipodocumento}
                onChange={(e) => setFacturaSeleccionada({ ...facturaSeleccionada, tipodocumento: e.target.value })}
                className="mb-2 border border-gray-300 rounded-lg px-2 py-1"
              >
                <option value="Factura">Factura</option>
                <option value="Boleta">Boleta</option>
              </select>

              <label className="mb-1">N° Documento</label>
              <input
                type="text"
                value={facturaSeleccionada.numerodocumento}
                onChange={(e) => setFacturaSeleccionada({ ...facturaSeleccionada, numerodocumento: e.target.value })}
                className="mb-2 border border-gray-300 rounded-lg px-2 py-1"
              />

              <label className="mb-1">Fecha</label>
              <input
                type="date"
                value={facturaSeleccionada.fechaRegistro}
                onChange={(e) => setFacturaSeleccionada({ ...facturaSeleccionada, fechaRegistro: e.target.value })}
                className="border border-gray-300 rounded-lg px-2 py-1"
              />
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 flex flex-col gap-2">
              <label>Documento Cliente</label>
              <input type="text" value={facturaSeleccionada.cliente.documento} onChange={e=>setFacturaSeleccionada({...facturaSeleccionada, cliente:{...facturaSeleccionada.cliente, documento:e.target.value}})} className="border border-gray-300 rounded-lg px-3 py-2"/>
              <label>Nombre Cliente</label>
              <input type="text" value={facturaSeleccionada.cliente.nombre} onChange={e=>setFacturaSeleccionada({...facturaSeleccionada, cliente:{...facturaSeleccionada.cliente, nombre:e.target.value}})} className="border border-gray-300 rounded-lg px-3 py-2"/>
              <label>Dirección Cliente</label>
              <input type="text" value={facturaSeleccionada.cliente.direccion} onChange={e=>setFacturaSeleccionada({...facturaSeleccionada, cliente:{...facturaSeleccionada.cliente, direccion:e.target.value}})} className="border border-gray-300 rounded-lg px-3 py-2"/>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label>Correo Cliente</label>
              <input type="email" value={facturaSeleccionada.cliente.correo} onChange={e=>setFacturaSeleccionada({...facturaSeleccionada, cliente:{...facturaSeleccionada.cliente, correo:e.target.value}})} className="border border-gray-300 rounded-lg px-3 py-2"/>
              <label>Teléfono Cliente</label>
              <input type="text" value={facturaSeleccionada.cliente.telefono} onChange={e=>setFacturaSeleccionada({...facturaSeleccionada, cliente:{...facturaSeleccionada.cliente, telefono:e.target.value}})} className="border border-gray-300 rounded-lg px-3 py-2"/>
            </div>
          </div>

          {/* Tabla de items */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg text-left">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2">Precio</th>
                  <th className="px-4 py-2">Cantidad</th>
                  <th className="px-4 py-2">Mayorista</th>
                  <th className="px-4 py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {facturaSeleccionada.items.map((item, idx)=>(
                  <tr key={idx} className="border-t border-gray-300">
                    <td className="px-4 py-2"><input type="text" value={item.nombre} onChange={e=>actualizarItem(idx,"nombre",e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1"/></td>
                    <td className="px-4 py-2"><input type="number" value={item.precio} onChange={e=>actualizarItem(idx,"precio",Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-2 py-1"/></td>
                    <td className="px-4 py-2"><input type="number" value={item.cantidad} onChange={e=>actualizarItem(idx,"cantidad",Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-2 py-1"/></td>
                    <td className="px-4 py-2 text-center"><input type="checkbox" checked={item.precioMayor||false} onChange={e=>actualizarItem(idx,"precioMayor",e.target.checked)}/></td>
                    <td className="px-4 py-2">${calcularSubtotalItem(item).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={agregarItem} className="mt-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors">Agregar Producto</button>
          </div>

          {/* Totales */}
          <div className="flex flex-col items-end gap-2 mt-4 font-semibold">
            <p>Subtotal: ${calcularSubtotal().toFixed(2)}</p>
            <p>IVA 12%: ${calcularIVA().toFixed(2)}</p>
            <p>Total: ${calcularTotal().toFixed(2)}</p>
          </div>

          {/* Mensaje pie */}
          <div className="mt-4">
            <label>Mensaje al pie</label>
            <input type="text" value={facturaSeleccionada.mensajePie} onChange={e=>setFacturaSeleccionada({...facturaSeleccionada,mensajePie:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" className="bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors" onClick={()=>alert("Factura editada con éxito!")}>Guardar Cambios</button>
            <button type="button" className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors" onClick={()=>setFacturaSeleccionada(null)}>Volver al listado</button>
          </div>
        </div>
      )}
    </div>
  );
}
