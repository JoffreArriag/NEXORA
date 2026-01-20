import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { runTransaction } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface ItemFactura {
  nombre: string;
  precio: number;
  cantidad: number;
  precioMayor?: boolean;
}

interface Cliente {
  documento: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
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
    logoUrl: string;
  };
  cliente: Cliente;
  usuarioRegistro: string;
  items: ItemFactura[];
  mensajePie: string;
}

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  marca: string;
  precioUnitario: string;
  precioMayor: string;
  stock: string;
  visible: boolean;
}

// Datos iniciales
const facturaInicial: Factura = {
  id: 0,
  tipodocumento: "Factura",
  numerodocumento: "",
  fechaRegistro: new Date().toISOString().split("T")[0],
  negocio: {
    nombre: "",
    ruc: "",
    direccion: "",
    telefono: "",
    email: "",
    ciudad: "",
    logoUrl: "",
  },
  cliente: {
    documento: "",
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
  },
  usuarioRegistro: "admin",
  items: [{ nombre: "", precio: 0, cantidad: 1, precioMayor: false }],
  mensajePie: "Gracias por su compra. ¡Vuelva pronto!",
};

export default function CrearFactura() {
  const [factura, setFactura] = useState<Factura>(facturaInicial);
  const [clienteExistente, setClienteExistente] = useState(false);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [aplicarIVA, setAplicarIVA] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const generarNumeroDocumento = async (tipo: string) => {
    const ref = doc(db, "contadores", tipo);

    const prefijo = tipo === "Factura" ? "F001-" : "NV001-";

    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);

      let ultimo = 0;
      if (snap.exists()) {
        ultimo = snap.data().ultimo;
      }

      const nuevo = ultimo + 1;

      transaction.set(ref, { ultimo: nuevo }, { merge: true });

      return prefijo + String(nuevo).padStart(6, "0");
    });
  };
  const obtenerUltimoNumeroDocumento = async (tipo: string) => {
    const ref = doc(db, "contadores", tipo);
    const snap = await getDoc(ref);

    let ultimo = 0;
    if (snap.exists()) {
      ultimo = snap.data().ultimo;
    }

    const prefijo = tipo === "Factura" ? "F001-" : "NV001-";
    return prefijo + String(ultimo + 1).padStart(6, "0");
  };

  const eliminarItem = (index: number) => {
    const nuevos = factura.items.filter((_, i) => i !== index);

    setFactura({
      ...factura,
      items:
        nuevos.length > 0
          ? nuevos
          : [{ nombre: "", precio: 0, cantidad: 1, precioMayor: false }],
    });
  };

  // Clases condicionales para inputs y labels
  const inputBase = "border rounded-lg px-3 py-2 transition-all duration-200";
  const inputNormal = "border-gray-300 bg-white text-gray-900";
  const inputBloqueado =
    "border-gray-600 bg-gray-200 text-neutral-950 cursor-not-allowed";
  const labelNormal = "text-neutral-950";
  const labelBloqueado = "text-neutral-950";
  const inputClienteClass = `${inputBase} ${
    clienteExistente ? inputBloqueado : inputNormal
  }`;
  const labelClienteClass = clienteExistente ? labelBloqueado : labelNormal;

  // Cargar datos del negocio
  useEffect(() => {
    const cargarNegocio = async () => {
      try {
        const ref = doc(db, "negocio", "config");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();

          setFactura((prev) => ({
            ...prev,
            negocio: {
              nombre: data.nombre || "",
              ruc: String(data.ruc || ""),
              direccion: data.direccion || "",
              telefono: String(data.telefono || ""),
              email: data.correo || "",
              ciudad: data.ciudad || "",
              logoUrl: data.logoUrl || "",
            },
          }));
        }
      } catch (error) {
        console.error("Error cargando negocio:", error);
      }
    };

    cargarNegocio();
  }, []);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const q = query(
          collection(db, "productos"),
          where("visible", "==", true)
        );
        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Producto[];

        setProductos(data);
      } catch (error) {
        console.error("Error cargando productos", error);
      }
    };

    cargarProductos();
  }, []);

  useEffect(() => {
    const generarInicial = async () => {
      const num = await obtenerUltimoNumeroDocumento("Factura");
      setFactura((prev) => ({
        ...prev,
        numerodocumento: num,
      }));
    };
    generarInicial();
  }, []);

  //Buscar cliente
  const buscarClientePorCedula = async (cedula: string) => {
    if (!cedula) return;

    setBuscandoCliente(true);
    try {
      const q = query(
        collection(db, "usuarios"),
        where("cedula", "==", cedula)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setFactura((prev) => ({
          ...prev,
          cliente: {
            documento: cedula,
            nombre: docData.nombre || "",
            apellido: docData.apellido || "",
            correo: docData.correo || "",
            telefono: docData.telefono || "",
            direccion: docData.direccion || "",
          },
        }));
      } else {
        setFactura((prev) => ({
          ...prev,
          cliente: {
            documento: cedula,
            nombre: "",
            apellido: "",
            correo: "",
            telefono: "",
            direccion: "",
          },
        }));
      }
    } catch (error) {
      console.error("Error buscando cliente:", error);
    }
    setBuscandoCliente(false);
  };

  const agregarItem = () => {
    setFactura({
      ...factura,
      items: [
        ...factura.items,
        { nombre: "", precio: 0, cantidad: 1, precioMayor: false },
      ],
    });
  };

  const actualizarItem = (
    index: number,
    key: keyof ItemFactura,
    value: string | number | boolean
  ) => {
    const nuevosItems = [...factura.items];
    if (key === "nombre" && typeof value === "string")
      nuevosItems[index][key] = value;
    if ((key === "precio" || key === "cantidad") && typeof value === "number")
      nuevosItems[index][key] = value;
    if (key === "precioMayor" && typeof value === "boolean")
      nuevosItems[index][key] = value;
    setFactura({ ...factura, items: nuevosItems });
  };

  const calcularSubtotalItem = (item: ItemFactura) => {
    const producto = productos.find((p) => p.nombre === item.nombre);
    if (!producto) return 0;

    const precio = item.precioMayor
      ? Number(producto.precioMayor)
      : Number(producto.precioUnitario);

    return precio * item.cantidad;
  };

  const calcularSubtotal = () =>
    factura.items.reduce((acc, item) => acc + calcularSubtotalItem(item), 0);
  const calcularIVA = () => (aplicarIVA ? calcularSubtotal() * 0.15 : 0);
  const calcularTotal = () => calcularSubtotal() + calcularIVA();

  return (
    <div className="w-full h-full flex flex-col bg-transparent p-6">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">
        Crear Nueva Factura
      </h2>
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-5xl mx-auto flex flex-col gap-6 overflow-y-auto">
        {/* Encabezado tipo factura */}
        <div className="flex justify-between items-start mb-6 border-b border-gray-300 pb-4">
          <div className="flex items-center gap-4">
            {/* Logo dinámico */}
            <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center overflow-hidden border">
              {factura.negocio.logoUrl ? (
                <img
                  src={factura.negocio.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400 font-bold">Logo</span>
              )}
            </div>

            <div className="flex flex-col gap-1 text-neutral-950 font-semibold">
              <p>{factura.negocio.nombre}</p>
              <p>RUC: {factura.negocio.ruc}</p>
              <p>Dirección: {factura.negocio.direccion}</p>
              <p>Teléfono: {factura.negocio.telefono}</p>
              <p>Email: {factura.negocio.email}</p>
              <p>Ciudad: {factura.negocio.ciudad}</p>
            </div>
          </div>

          <div className="flex flex-col text-right text-neutral-950 font-semibold">
            <label className="mb-1">Tipo Documento</label>
            <select
              value={factura.tipodocumento}
              onChange={async (e) => {
                const tipo = e.target.value;
                const ultimoNumero = await obtenerUltimoNumeroDocumento(tipo);

                setFactura((prev) => ({
                  ...prev,
                  tipodocumento: tipo,
                  numerodocumento: ultimoNumero,
                }));

                // Aplicar IVA solo si es factura
                setAplicarIVA(tipo === "Factura");
              }}
              className="mb-2 border border-gray-300 rounded-lg px-2 py-1"
            >
              <option value="Factura">Factura</option>
              <option value="NotaVenta">Nota de Venta</option>
            </select>

            <label className="mb-1">N° Documento</label>
            <input
              type="text"
              value={factura.numerodocumento}
              readOnly
              onChange={(e) =>
                setFactura({ ...factura, numerodocumento: e.target.value })
              }
              className="mb-2 border border-gray-300 rounded-lg px-2 py-1"
            />

            <label className="mb-1">Fecha</label>
            <input
              type="date"
              value={factura.fechaRegistro}
              onChange={(e) =>
                setFactura({ ...factura, fechaRegistro: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-2 py-1"
            />
          </div>
        </div>

        {/* Datos del cliente */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1 flex flex-col gap-2">
            <label>Documento Cliente</label>
            <input
              type="text"
              value={factura.cliente.documento}
              onChange={(e) =>
                setFactura({
                  ...factura,
                  cliente: { ...factura.cliente, documento: e.target.value },
                })
              }
              onBlur={() =>
                clienteExistente &&
                buscarClientePorCedula(factura.cliente.documento)
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
              disabled={clienteExistente && buscandoCliente}
            />

            <label className={labelClienteClass}>Nombre Cliente</label>
            <input
              type="text"
              value={
                clienteExistente
                  ? `${factura.cliente.nombre} ${factura.cliente.apellido}`
                  : factura.cliente.nombre
              }
              onChange={(e) =>
                setFactura({
                  ...factura,
                  cliente: { ...factura.cliente, nombre: e.target.value },
                })
              }
              className={inputClienteClass}
              readOnly={clienteExistente}
            />

            <label className={labelClienteClass}>Dirección Cliente</label>
            <input
              type="text"
              value={factura.cliente.direccion}
              onChange={(e) =>
                setFactura({
                  ...factura,
                  cliente: { ...factura.cliente, direccion: e.target.value },
                })
              }
              className={inputClienteClass}
              readOnly={clienteExistente}
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className={labelClienteClass}>Correo Cliente</label>
            <input
              type="email"
              value={factura.cliente.correo}
              onChange={(e) =>
                setFactura({
                  ...factura,
                  cliente: { ...factura.cliente, correo: e.target.value },
                })
              }
              className={inputClienteClass}
              readOnly={clienteExistente}
            />

            <label className={labelClienteClass}>Teléfono Cliente</label>
            <input
              type="text"
              value={factura.cliente.telefono}
              onChange={(e) =>
                setFactura({
                  ...factura,
                  cliente: { ...factura.cliente, telefono: e.target.value },
                })
              }
              className={inputClienteClass}
              readOnly={clienteExistente}
            />

            <div className="mt-10 flex items-center gap-2 justify-start">
              <input
                type="checkbox"
                checked={clienteExistente}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setClienteExistente(checked);
                  if (!checked) {
                    setFactura((prev) => ({
                      ...prev,
                      cliente: {
                        documento: "",
                        nombre: "",
                        apellido: "",
                        correo: "",
                        telefono: "",
                        direccion: "",
                      },
                    }));
                  }
                }}
                className="accent-neutral-950 scale-110"
              />
              <label className="text-neutral-950 font-semibold cursor-pointer">
                Cliente existente
              </label>
            </div>
          </div>
        </div>

        {/* Tabla de items */}
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
              {factura.items.map((item, idx) => (
                <tr key={idx} className="border-t border-gray-300">
                  <td className="px-4 py-2">
                    <select
                      value={item.nombre}
                      onChange={(e) => {
                        const producto = productos.find(
                          (p) => p.nombre === e.target.value
                        );
                        if (!producto) return;

                        const nuevos = [...factura.items];
                        nuevos[idx] = {
                          ...nuevos[idx],
                          nombre: producto.nombre,
                          precio: Number(producto.precioUnitario),
                          precioMayor: false,
                        };

                        setFactura({ ...factura, items: nuevos });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1"
                    >
                      <option value="">Seleccione producto</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.nombre}>
                          {p.nombre} — {p.marca}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={(() => {
                        const p = productos.find(
                          (x) => x.nombre === item.nombre
                        );
                        if (!p) return "0.00";
                        return item.precioMayor
                          ? p.precioMayor
                          : p.precioUnitario;
                      })()}
                      readOnly
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg px-2 py-1"
                    />
                  </td>

                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) =>
                        actualizarItem(idx, "cantidad", Number(e.target.value))
                      }
                      className="w-full border border-gray-300 rounded-lg px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.precioMayor || false}
                      onChange={(e) =>
                        actualizarItem(idx, "precioMayor", e.target.checked)
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    ${calcularSubtotalItem(item).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => eliminarItem(idx)}
                      className="text-red-600 hover:text-red-800 text-xl"
                      title="Eliminar producto"
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

        {/* Totales */}
        <div className="flex flex-col items-end gap-3 mt-6 text-lg">
          <div className="grid grid-cols-[auto_auto] gap-x-12">
            <span className="text-right">Subtotal:</span>
            <span className="font-semibold">
              ${calcularSubtotal().toFixed(2)}
            </span>

            {aplicarIVA && (
              <>
                <span className="text-right">IVA 15%:</span>
                <span className="font-semibold">
                  ${calcularIVA().toFixed(2)}
                </span>
              </>
            )}

            <span className="text-right font-bold">Total:</span>
            <span className="font-bold">${calcularTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Mensaje pie */}
        <div className="mt-4">
          <label>Mensaje al pie</label>
          <input
            type="text"
            value={factura.mensajePie}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-200 text-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
            onClick={async () => {
              if (loading) return;

              try {
                setLoading(true);

                // Validaciones
                if (factura.items.length === 0 || !factura.items[0].nombre) {
                  setToastMessage("Debe agregar al menos un producto");
                  setToastType("error");
                  setLoading(false);
                  return;
                }

                for (const i of factura.items) {
                  const p = productos.find((x) => x.nombre === i.nombre);
                  if (!p) {
                    setToastMessage("Producto inválido");
                    setToastType("error");
                    setLoading(false);
                    return;
                  }
                }

                const numeroFinal = await runTransaction(
                  db,
                  async (transaction) => {
                    const contadorRef = doc(
                      db,
                      "contadores",
                      factura.tipodocumento
                    );
                    const contadorSnap = await transaction.get(contadorRef);
                    const ultimo = contadorSnap.exists()
                      ? contadorSnap.data().ultimo
                      : 0;
                    const nuevo = ultimo + 1;
                    const prefijo =
                      factura.tipodocumento === "Factura" ? "F001-" : "NV001-";
                    const numero = prefijo + String(nuevo).padStart(6, "0");
                    const productosRefs = factura.items.map((i) => {
                      const p = productos.find((x) => x.nombre === i.nombre)!;
                      return doc(db, "productos", p.id);
                    });
                    const productosSnaps = await Promise.all(
                      productosRefs.map((r) => transaction.get(r))
                    );

                    productosSnaps.forEach((snap, idx) => {
                      const item = factura.items[idx];
                      const stockActual = Number(snap.data()?.stock || 0);
                      if (item.cantidad > stockActual) {
                        throw new Error(
                          `Stock insuficiente para ${item.nombre}`
                        );
                      }
                    });
                    transaction.set(
                      contadorRef,
                      { ultimo: nuevo },
                      { merge: true }
                    );

                    productosSnaps.forEach((snap, idx) => {
                      const ref = productosRefs[idx];
                      const item = factura.items[idx];
                      const stockActual = Number(snap.data()?.stock || 0);
                      transaction.update(ref, {
                        stock: stockActual - item.cantidad,
                      });
                    });

                    const data = {
                      tipodocumento: factura.tipodocumento,
                      numerodocumento: numero,
                      fechaRegistro: factura.fechaRegistro,
                      negocio: factura.negocio,
                      cliente: factura.cliente,
                      usuarioRegistro: factura.usuarioRegistro,
                      items: factura.items.map((i) => {
                        const p = productos.find((x) => x.nombre === i.nombre)!;
                        const precioUsado = i.precioMayor
                          ? Number(p.precioMayor)
                          : Number(p.precioUnitario);
                        return {
                          idProducto: p.id,
                          nombre: p.nombre,
                          categoria: p.categoria,
                          marca: p.marca,
                          precioUnitario: Number(p.precioUnitario),
                          precioMayor: Number(p.precioMayor),
                          tipoPrecio: i.precioMayor ? "Mayorista" : "Unitario",
                          cantidad: i.cantidad,
                          precioUsado,
                          subtotal: precioUsado * i.cantidad,
                        };
                      }),
                      subtotal: Number(calcularSubtotal().toFixed(2)),
                      iva: aplicarIVA ? Number(calcularIVA().toFixed(2)) : 0,
                      total: Number(calcularTotal().toFixed(2)),
                      mensajePie: factura.mensajePie,
                      createdAt: serverTimestamp(),
                    };

                    transaction.set(doc(collection(db, "ventas")), data);

                    return numero;
                  }
                );

                setToastMessage(
                  `${factura.tipodocumento} ${numeroFinal} guardada correctamente`
                );
                setToastType("success");

                setFactura((prev) => ({
                  ...prev,
                  cliente: {
                    documento: "",
                    nombre: "",
                    apellido: "",
                    correo: "",
                    telefono: "",
                    direccion: "",
                  },
                  items: [
                    { nombre: "", precio: 0, cantidad: 1, precioMayor: false },
                  ],
                  numerodocumento: "",
                }));
                setClienteExistente(false);
              } catch (error: unknown) {
                console.error("Error guardando factura:", error);
                const mensaje =
                  error instanceof Error
                    ? error.message
                    : "Ocurrió un error al guardar la factura";
                setToastMessage(mensaje);
                setToastType("error");
              } finally {
                setLoading(false);
              }
            }}
          >
            Guardar Factura
          </button>

          <button
            type="button"
            className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors"
            onClick={async () => {
              const tipo = factura.tipodocumento;
              const nuevoNumero = await generarNumeroDocumento(tipo);

              setFactura((prev) => ({
                ...prev,
                cliente: {
                  documento: "",
                  nombre: "",
                  apellido: "",
                  correo: "",
                  telefono: "",
                  direccion: "",
                },
                items: [
                  { nombre: "", precio: 0, cantidad: 1, precioMayor: false },
                ],
                numerodocumento: nuevoNumero,
              }));

              setClienteExistente(false);
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
      {/* TOAST */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage("")}
        />
      )}
    </div>
  );
}
