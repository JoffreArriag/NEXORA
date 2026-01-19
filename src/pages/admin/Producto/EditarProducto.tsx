import { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface Producto {
  id?: string; 
  nombre: string;
  descripcion: string;
  precioUnitario: string;
  precioMayor: string;
  stock: string;
  categoria: string;
  marca: string;
  visible: boolean;
  imagenUrl: string;
}

interface Categoria {
  id: string;
  nombre: string;
}

// Nuevo tipo para errores (booleano para cada campo)
type ErroresProducto = {
  [key in keyof Producto]?: boolean;
};

export default function EditarProducto() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>(""); // NUEVO
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [errores, setErrores] = useState<ErroresProducto>({});
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Cargar productos y categorías desde Firestore
  useEffect(() => {
    const fetchCategorias = async () => {
      const snapshot = await getDocs(collection(db, "categorias"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, nombre: doc.data().nombre }));
      setCategorias(data);
    };

    const fetchProductos = async () => {
      const snapshot = await getDocs(collection(db, "productos"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Producto) }));
      setProductos(data);
    };

    fetchCategorias();
    fetchProductos();
  }, []);

  const guardarCambios = async () => {
    if (!productoSeleccionado) return;

    // Validar campos obligatorios
    const camposObligatorios: (keyof Producto)[] = [
      "nombre", "descripcion", "precioUnitario", "precioMayor",
      "stock", "categoria", "marca", "imagenUrl"
    ];

    const nuevosErrores: ErroresProducto = {};
    camposObligatorios.forEach(campo => {
      if (!productoSeleccionado[campo]?.toString().trim()) {
        nuevosErrores[campo] = true;
      }
    });
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      setToastMessage("Por favor completa los campos obligatorios");
      setToastType("error");
      return;
    }

    try {
      const { id, ...data } = productoSeleccionado;
      const productoParaGuardar = {
        ...data,
        visible: productoSeleccionado.visible ?? true,
      };

      if (id) {
        await updateDoc(doc(db, "productos", id), productoParaGuardar);
        setToastMessage("Producto actualizado correctamente");
      } else {
        await addDoc(collection(db, "productos"), productoParaGuardar);
        setToastMessage("Producto agregado correctamente");
      }

      setToastType("success");
      setProductoSeleccionado(null);
      setErrores({});
    } catch (error) {
      console.error(error);
      setToastMessage("Ocurrió un error al guardar el producto");
      setToastType("error");
    }
  };

  // Filtrado por nombre y categoría
  const sugerencias = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    (categoriaFiltro === "" || p.categoria === categoriaFiltro)
  );

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Editar Producto</h2>

      {/* Buscador + filtro por categoría */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={productoSeleccionado ? productoSeleccionado.nombre : busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setProductoSeleccionado(null);
          }}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col gap-4 overflow-y-auto">
        {!productoSeleccionado ? (
          sugerencias.length > 0 ? (
            sugerencias.map(p => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-gray-300 hover:bg-red-100 cursor-pointer flex justify-between items-center"
                onClick={() => setProductoSeleccionado(p)}
              >
                <div>
                  <p className="font-semibold text-neutral-950">{p.nombre}</p>
                  <p className="text-sm text-neutral-700">{p.categoria} - {p.marca}</p>
                </div>
                <p className="font-semibold text-neutral-950">${p.precioUnitario}</p>
              </div>
            ))
          ) : (
            <p className="text-neutral-950 text-lg">No se encontraron productos</p>
          )
        ) : (
          <form className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Nombre del Producto</label>
              <input
                type="text"
                value={productoSeleccionado.nombre}
                onChange={(e) =>
                  setProductoSeleccionado({ ...productoSeleccionado, nombre: e.target.value })
                }
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${errores.nombre ? "border-red-600" : "border-gray-300"}`}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Descripción del Producto</label>
              <textarea
                value={productoSeleccionado.descripcion}
                onChange={(e) =>
                  setProductoSeleccionado({ ...productoSeleccionado, descripcion: e.target.value })
                }
                rows={3}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${errores.descripcion ? "border-red-600" : "border-gray-300"}`}
              />
            </div>

            {/* Precios y stock */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">Precio Unitario</label>
                <input
                  type="number"
                  value={productoSeleccionado.precioUnitario}
                  onChange={(e) =>
                    setProductoSeleccionado({ ...productoSeleccionado, precioUnitario: e.target.value })
                  }
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${errores.precioUnitario ? "border-red-600" : "border-gray-300"}`}
                />
              </div>
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">Precio por Mayor</label>
                <input
                  type="number"
                  value={productoSeleccionado.precioMayor}
                  onChange={(e) =>
                    setProductoSeleccionado({ ...productoSeleccionado, precioMayor: e.target.value })
                  }
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${errores.precioMayor ? "border-red-600" : "border-gray-300"}`}
                />
              </div>
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">Stock</label>
                <input
                  type="number"
                  value={productoSeleccionado.stock}
                  onChange={(e) =>
                    setProductoSeleccionado({ ...productoSeleccionado, stock: e.target.value })
                  }
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${errores.stock ? "border-red-600" : "border-gray-300"}`}
                />
              </div>
            </div>

            {/* Categoría, Marca, Imagen */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">Categoría</label>
                <select
                  value={productoSeleccionado.categoria}
                  onChange={(e) =>
                    setProductoSeleccionado({ ...productoSeleccionado, categoria: e.target.value })
                  }
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${errores.categoria ? "border-red-600" : "border-gray-300"}`}
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">Marca del Producto</label>
                <input
                  type="text"
                  value={productoSeleccionado.marca}
                  onChange={(e) =>
                    setProductoSeleccionado({ ...productoSeleccionado, marca: e.target.value })
                  }
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${errores.marca ? "border-red-600" : "border-gray-300"}`}
                />
              </div>
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">URL de Imagen</label>
                <input
                  type="text"
                  value={productoSeleccionado.imagenUrl}
                  onChange={(e) =>
                    setProductoSeleccionado({ ...productoSeleccionado, imagenUrl: e.target.value })
                  }
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${errores.imagenUrl ? "border-red-600" : "border-gray-300"}`}
                />
              </div>
            </div>

            {/* Visible */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={productoSeleccionado.visible}
                onChange={(e) =>
                  setProductoSeleccionado({ ...productoSeleccionado, visible: e.target.checked })
                }
                className="w-4 h-4 accent-red-500"
              />
              <span className="text-neutral-950 font-medium">Visible en la tienda</span>
            </div>

            {/* Botones */}
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={guardarCambios}
                className="bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors"
                onClick={() => setProductoSeleccionado(null)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Toast */}
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
