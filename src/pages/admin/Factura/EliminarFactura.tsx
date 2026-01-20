import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase";

interface ItemFactura {
  idProducto: string;
  nombre: string;
  categoria: string;
  marca: string;
  precioUnitario: number;
  precioMayor: number;
  tipoPrecio: string;
  cantidad: number;
  precioUsado: number;
  subtotal: number;
}

interface Factura {
  id: string;
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
    logoUrl?: string;
  };
  cliente: {
    documento: string;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    direccion: string;
  };
  usuarioRegistro: string;
  items: ItemFactura[];
  subtotal: number;
  iva: number;
  total: number;
  mensajePie: string;
}

export default function EliminarFactura() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [tiposDocumento, setTiposDocumento] = useState<string[]>([]);
  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const q = query(collection(db, "ventas"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Factura[];

      setFacturas(data);
      setLoading(false);
    };

    const cargarTipos = async () => {
      const snap = await getDocs(collection(db, "contadores"));
      const tipos = snap.docs.map((d) => d.id);
      setTiposDocumento(tipos);
    };

    cargar();
    cargarTipos();
  }, []);

  const facturasFiltradas = facturas.filter((f) => {
    const coincideTexto =
      f.numerodocumento.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase());

    const coincideTipo =
      filtroTipo === "Todos" || f.tipodocumento === filtroTipo;

    return coincideTexto && coincideTipo;
  });

  const eliminarFactura = async () => {
    if (!facturaSeleccionada) return;

    const ok = window.confirm(
      `¿Eliminar ${facturaSeleccionada.tipodocumento} ${facturaSeleccionada.numerodocumento}?`
    );
    if (!ok) return;

    try {
      await runTransaction(db, async (tx) => {
        for (const item of facturaSeleccionada.items) {
          const ref = doc(db, "productos", item.idProducto);
          const snap = await tx.get(ref);
          const stock = Number(snap.data()?.stock || 0);

          tx.update(ref, { stock: stock + item.cantidad });
        }
        tx.delete(doc(db, "ventas", facturaSeleccionada.id));
      });

      setFacturas((prev) =>
        prev.filter((f) => f.id !== facturaSeleccionada.id)
      );
      setFacturaSeleccionada(null);
    } catch (error) {
      console.error(error);
      alert("Error al eliminar factura");
    }
  };

  if (loading) return <p className="p-6">Cargando facturas...</p>;

  return (
    <div className="w-full h-full flex flex-col bg-transparent p-6">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">
        Eliminar Facturas
      </h2>

      {!facturaSeleccionada ? (
        <div>
          <div className="flex gap-4 mb-4">
            <input
              placeholder="Buscar por número o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            />

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="Todos">Todos</option>
              {tiposDocumento.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {facturasFiltradas.map((f) => (
            <div
              key={f.id}
              onClick={() => setFacturaSeleccionada(f)}
              className="flex justify-between items-center p-4 border rounded-xl hover:bg-red-100 cursor-pointer mb-3"
            >
              <div>
                <p className="font-semibold">{f.cliente.nombre} {f.cliente.apellido}</p>
                <p className="text-sm">
                  {f.tipodocumento} - {f.numerodocumento}
                </p>
              </div>
              <p className="font-bold">${f.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-5xl mx-auto flex flex-col gap-6 overflow-y-auto">
          {/* ENCABEZADO */}
          <div className="flex justify-between items-start mb-6 border-b border-gray-300 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center overflow-hidden border">
                {facturaSeleccionada.negocio.logoUrl ? (
                  <img
                    src={facturaSeleccionada.negocio.logoUrl}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400 font-bold">Logo</span>
                )}
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
            <div className="flex flex-col items-end text-neutral-950 gap-y-4">
              <div className="flex flex-col items-end">
                <label className="font-bold">Tipo Documento</label>
                <span className="text-right">
                  {facturaSeleccionada.tipodocumento}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <label className="font-bold">N° Documento</label>
                <span className="text-right">
                  {facturaSeleccionada.numerodocumento}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <label className="font-bold">Fecha</label>
                <span className="text-right">
                  {facturaSeleccionada.fechaRegistro}
                </span>
              </div>
            </div>
          </div>

          {/* DATOS CLIENTE */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-bold">Documento Cliente</label>
              <input
                value={facturaSeleccionada.cliente.documento}
                readOnly
                className="border rounded-lg px-3 py-2 bg-gray-100"
              />

              <label className="font-bold">Nombre Cliente</label>
              <input
                value={`${facturaSeleccionada.cliente.nombre} ${facturaSeleccionada.cliente.apellido}`}
                readOnly
                className="border rounded-lg px-3 py-2 bg-gray-100"
              />

              <label className="font-bold">Dirección Cliente</label>
              <input
                value={facturaSeleccionada.cliente.direccion}
                readOnly
                className="border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <label className="font-bold">Correo Cliente</label>
              <input
                value={facturaSeleccionada.cliente.correo}
                readOnly
                className="border rounded-lg px-3 py-2 bg-gray-100"
              />

              <label className="font-bold">Teléfono Cliente</label>
              <input
                value={facturaSeleccionada.cliente.telefono}
                readOnly
                className="border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>
          </div>

          {/* TABLA DE ITEMS */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg text-left">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-6 py-2 w-[50%]">Producto</th>
                  <th className="px-4 py-2 w-[20%]">Precio</th>
                  <th className="px-4 py-2 w-[20%] text-center">Cantidad</th>
                  <th className="px-4 py-2 w-[10%] text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {facturaSeleccionada.items.map((item, idx) => (
                  <tr key={idx} className="border-t border-gray-300">
                    <td className="px-6 py-2">{item.nombre}</td>
                    <td className="px-4 py-2">
                      ${item.precioUsado.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center font-semibold">
                      {item.cantidad}
                    </td>
                    <td className="px-4 py-2 text-left">
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALES */}
          <div className="flex flex-col items-end gap-3 mt-6 text-lg">
            <div className="grid grid-cols-[auto_auto] gap-x-12">
              <span className="text-right">Subtotal:</span>
              <span className="font-semibold">
                ${facturaSeleccionada.subtotal.toFixed(2)}
              </span>

              <span className="text-right">IVA:</span>
              <span className="font-semibold">
                ${facturaSeleccionada.iva.toFixed(2)}
              </span>

              <span className="text-right font-bold">Total:</span>
              <span className="font-bold">
                ${facturaSeleccionada.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* MENSAJE */}
          <div>
            <label>Mensaje al pie</label>
            <input
              value={facturaSeleccionada.mensajePie}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-200"
            />
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={eliminarFactura}
              className="bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700"
            >
              Eliminar Factura
            </button>

            <button
              onClick={() => setFacturaSeleccionada(null)}
              className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400"
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
