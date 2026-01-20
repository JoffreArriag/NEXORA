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
import Toast from "../../../components/Toast";
import { where } from "firebase/firestore";

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

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  marca: string;
  precioUnitario: number;
  precioMayor: number;
  stock: number;
  visible: boolean;
}

export default function EditarFactura() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [tiposDocumento, setTiposDocumento] = useState<string[]>([]);
  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState<Factura | null>(null);
  const [itemsEditados, setItemsEditados] = useState<ItemFactura[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteEditado, setClienteEditado] = useState<
    Factura["cliente"] | null
  >(null);
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    const cargarProductos = async () => {
      const q = query(
        collection(db, "productos"),
        where("visible", "==", true)
      );
      const snap = await getDocs(q);
      setProductos(
        snap.docs.map((d) => {
          const data = d.data() as Omit<Producto, "id">;
          return {
            id: d.id,
            ...data,
          };
        })
      );
    };
    cargarProductos();
  }, []);

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
      `${f.cliente.nombre} ${f.cliente.apellido}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());

    const coincideTipo =
      filtroTipo === "Todos" || f.tipodocumento === filtroTipo;

    return coincideTexto && coincideTipo;
  });

  const guardarCambios = async () => {
    if (!facturaSeleccionada) return;

    try {
      await runTransaction(db, async (tx) => {
        for (const original of facturaSeleccionada.items) {
          const nuevo = itemsEditados.find(
            (i) => i.idProducto === original.idProducto
          )!;
          const diferencia = nuevo.cantidad - original.cantidad;

          if (diferencia !== 0) {
            const ref = doc(db, "productos", original.idProducto);
            const snap = await tx.get(ref);
            const stock = Number(snap.data()?.stock || 0);
            tx.update(ref, { stock: stock - diferencia });
          }
        }

        const subtotal = itemsEditados.reduce((s, i) => s + i.subtotal, 0);
        const iva = subtotal * 0.12;
        const total = subtotal + iva;

        tx.update(doc(db, "ventas", facturaSeleccionada.id), {
          items: itemsEditados,
          cliente: clienteEditado,
          subtotal,
          iva,
          total,
          updatedAt: new Date(),
        });
      });

      setFacturas((prev) =>
        prev.map((f) =>
          f.id === facturaSeleccionada.id
            ? {
                ...f,
                items: itemsEditados,
                cliente: clienteEditado!,
                subtotal: itemsEditados.reduce((s, i) => s + i.subtotal, 0),
                iva: itemsEditados.reduce((s, i) => s + i.subtotal, 0) * 0.12,
                total: itemsEditados.reduce((s, i) => s + i.subtotal, 0) * 1.12,
              }
            : f
        )
      );

      setFacturaSeleccionada(null);
      setToast({
        message: "Factura actualizada correctamente",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setToast({ message: "Error al guardar cambios", type: "error" });
    }
  };

  const agregarItem = () => {
    setItemsEditados(prev => [
      ...prev,
      {
        idProducto: "",
        nombre: "",
        categoria: "",
        marca: "",
        precioUnitario: 0,
        precioMayor: 0,
        tipoPrecio: "Unitario",
        cantidad: 1,
        precioUsado: 0,
        subtotal: 0,
      }
    ]);
  };

  if (loading) return <p className="p-6">Cargando facturas...</p>;

  return (
    <>
      <div className="w-full h-full flex flex-col bg-transparent p-6">
        <h2 className="text-3xl font-bold mb-6 text-neutral-950">
          Editar Facturas
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
                onClick={() => {
                  setFacturaSeleccionada(f);
                  setItemsEditados(JSON.parse(JSON.stringify(f.items)));
                  setClienteEditado({ ...f.cliente });
                }}
                className="flex justify-between items-center p-4 border rounded-xl hover:bg-red-100 cursor-pointer mb-3"
              >
                <div>
                  <p className="font-semibold">
                    {f.cliente.nombre} {f.cliente.apellido}
                  </p>
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
                  value={clienteEditado?.documento || ""}
                  onChange={(e) =>
                    setClienteEditado({
                      ...clienteEditado!,
                      documento: e.target.value,
                    })
                  }
                  className="border rounded-lg px-3 py-2"
                />

                <label className="font-bold">Nombre Cliente</label>
                <input
                  value={
                    clienteEditado
                      ? `${clienteEditado.nombre} ${clienteEditado.apellido}`
                      : ""
                  }
                  onChange={(e) => {
                    const partes = e.target.value.split(" ");
                    const nombre = partes[0] || "";
                    const apellido = partes.slice(1).join(" ") || "";

                    setClienteEditado({
                      ...clienteEditado!,
                      nombre,
                      apellido,
                    });
                  }}
                  className="border rounded-lg px-3 py-2"
                />

                <label className="font-bold">Dirección Cliente</label>
                <input
                  value={clienteEditado?.direccion || ""}
                  onChange={(e) =>
                    setClienteEditado({
                      ...clienteEditado!,
                      direccion: e.target.value,
                    })
                  }
                  className="border rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <label className="font-bold">Correo Cliente</label>
                <input
                  value={clienteEditado?.correo || ""}
                  onChange={(e) =>
                    setClienteEditado({
                      ...clienteEditado!,
                      correo: e.target.value,
                    })
                  }
                  className="border rounded-lg px-3 py-2"
                />

                <label className="font-bold">Teléfono Cliente</label>
                <input
                  value={clienteEditado?.telefono || ""}
                  onChange={(e) =>
                    setClienteEditado({
                      ...clienteEditado!,
                      telefono: e.target.value,
                    })
                  }
                  className="border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* TABLA DE ITEMS */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 rounded-lg text-left">
                <thead className="bg-red-600 text-white">
                  <tr>
                    <th className="px-4 py-2 w-[50%]">Producto</th>
                    <th className="px-4 py-2 w-[15%]">Precio</th>
                    <th className="px-4 py-2 w-[10%]">Cantidad</th>
                    <th className="px-4 py-2 w-[15%]">Mayorista</th>
                    <th className="px-4 py-2 w-[10%]">Subtotal</th>
                    <th className="px-4 py-2 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {itemsEditados.map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-300">
                      <td className="px-4 py-2">
                        <select
                          value={item.idProducto}
                          onChange={(e) => {
                            const p = productos.find(
                              (x) => x.id === e.target.value
                            );
                            if (!p) return;

                            const copia = [...itemsEditados];
                            copia[idx] = {
                              ...copia[idx],
                              idProducto: p.id,
                              nombre: p.nombre,
                              categoria: p.categoria,
                              marca: p.marca,
                              precioUnitario: Number(p.precioUnitario),
                              precioMayor: Number(p.precioMayor),
                              tipoPrecio: "Unitario",
                              precioUsado: Number(p.precioUnitario),
                              subtotal:
                                Number(p.precioUnitario) * copia[idx].cantidad,
                            };
                            setItemsEditados(copia);
                          }}
                          className="w-full border rounded-lg px-2 py-1"
                        >
                          <option value="">Seleccione producto</option>
                          {productos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre} — {p.marca}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-2">
                        ${item.precioUsado.toFixed(2)}
                      </td>

                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={1}
                          value={item.cantidad}
                          onChange={(e) => {
                            const copia = [...itemsEditados];
                            const cant = Number(e.target.value);
                            copia[idx].cantidad = cant;
                            copia[idx].subtotal = cant * copia[idx].precioUsado;
                            setItemsEditados(copia);
                          }}
                          className="w-full border rounded-lg px-2 py-1"
                        />
                      </td>

                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={item.tipoPrecio === "Mayorista"}
                          onChange={(e) => {
                            const copia = [...itemsEditados];
                            const p = productos.find(
                              (x) => x.id === item.idProducto
                            );
                            if (!p) return;

                            const esMayor = e.target.checked;
                            const precio = esMayor
                              ? Number(p.precioMayor)
                              : Number(p.precioUnitario);

                            copia[idx].tipoPrecio = esMayor
                              ? "Mayorista"
                              : "Unitario";
                            copia[idx].precioUsado = precio;
                            copia[idx].subtotal = precio * copia[idx].cantidad;
                            setItemsEditados(copia);
                          }}
                        />
                      </td>

                      <td className="px-4 py-2">${item.subtotal.toFixed(2)}</td>

                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const copia = itemsEditados.filter(
                              (_, i) => i !== idx
                            );
                            setItemsEditados(copia);
                          }}
                          className="text-red-600 text-xl"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={agregarItem}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
              >
                Agregar Producto
              </button>
            </div>

            {/* TOTALES */}
            <div className="flex flex-col items-end gap-3 mt-6 text-lg">
              <div className="grid grid-cols-[auto_auto] gap-x-12">
                <span className="text-right">Subtotal:</span>
                <span className="font-semibold">
                  $
                  {itemsEditados.reduce((s, i) => s + i.subtotal, 0).toFixed(2)}
                </span>

                <span className="text-right">IVA:</span>
                <span className="font-semibold">
                  $
                  {(
                    itemsEditados.reduce((s, i) => s + i.subtotal, 0) * 0.12
                  ).toFixed(2)}
                </span>

                <span className="text-right font-bold">Total:</span>
                <span className="font-bold">
                  $
                  {(
                    itemsEditados.reduce((s, i) => s + i.subtotal, 0) * 1.12
                  ).toFixed(2)}
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
                onClick={guardarCambios}
                className="bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700"
              >
                Guardar Cambios
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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
