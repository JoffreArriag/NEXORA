import { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface Producto {
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

export default function AgregarProducto() {
  const [producto, setProducto] = useState<Producto>({
    nombre: "",
    descripcion: "",
    precioUnitario: "",
    precioMayor: "",
    stock: "",
    categoria: "",
    marca: "",
    visible: true,
    imagenUrl: "",
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [errores, setErrores] = useState<{ [key: string]: boolean }>({});

  // Traer categorías desde Firestore
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categorias"));
        const cats: Categoria[] = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          nombre: docSnap.data().nombre,
        }));
        setCategorias(cats);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        setToastMessage("Ocurrió un error al cargar las categorías");
        setToastType("error");
      }
    };
    fetchCategorias();
  }, []);

  const guardarProducto = async () => {
    // Validar campos obligatorios
    type CamposProducto = keyof Producto;

    const camposObligatorios: CamposProducto[] = [
      "nombre",
      "descripcion",
      "precioUnitario",
      "precioMayor",
      "stock",
      "categoria",
      "marca",
      "imagenUrl"
    ];

    const nuevosErrores: { [key in CamposProducto]?: boolean } = {};

      camposObligatorios.forEach((campo) => {
        if (!producto[campo]?.toString().trim()) {
          nuevosErrores[campo] = true;
        }
      });

      setErrores(nuevosErrores);

      if (Object.keys(nuevosErrores).length > 0) {
        setToastMessage("Por favor completa los campos obligatorios");
        setToastType("error");
        return;
      }

    setLoading(true);

    try {
      const productosRef = collection(db, "productos");
      await addDoc(productosRef, producto);

      setToastMessage("Producto guardado correctamente");
      setToastType("success");

      // Limpiar formulario
      setProducto({
        nombre: "",
        descripcion: "",
        precioUnitario: "",
        precioMayor: "",
        stock: "",
        categoria: "",
        marca: "",
        visible: true,
        imagenUrl: "",
      });

      setErrores({});
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      setToastMessage("Ocurrió un error al guardar el producto");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Agregar Producto</h2>

      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col gap-6 overflow-y-auto">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Nombre */}
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Nombre del Producto</label>
            <input
              type="text"
              value={producto.nombre}
              onChange={(e) => setProducto({ ...producto, nombre: e.target.value })}
              placeholder="Ingrese el nombre del producto"
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errores.nombre ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
              }`}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Descripción del Producto</label>
            <textarea
              value={producto.descripcion}
              onChange={(e) => setProducto({ ...producto, descripcion: e.target.value })}
              placeholder="Ingrese la descripción"
              rows={3}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errores.descripcion ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
              }`}
            />
          </div>

          {/* Precios y Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Precio Unitario</label>
              <input
                type="number"
                value={producto.precioUnitario}
                onChange={(e) => setProducto({ ...producto, precioUnitario: e.target.value })}
                placeholder="0.00"
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                  errores.precioUnitario ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                }`}
              />
            </div>
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Precio por Mayor</label>
              <input
                type="number"
                value={producto.precioMayor}
                onChange={(e) => setProducto({ ...producto, precioMayor: e.target.value })}
                placeholder="0.00"
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                  errores.precioMayor ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                }`}
              />
            </div>
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Stock</label>
              <input
                type="number"
                value={producto.stock}
                onChange={(e) => setProducto({ ...producto, stock: e.target.value })}
                placeholder="Cantidad disponible"
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                  errores.stock ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                }`}
              />
            </div>
          </div>

          {/* Categoría, Marca, Imagen */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Categoría</label>
              <select
                value={producto.categoria}
                onChange={(e) => setProducto({ ...producto, categoria: e.target.value })}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                  errores.categoria ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                }`}
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Marca del Producto</label>
              <input
                type="text"
                value={producto.marca}
                onChange={(e) => setProducto({ ...producto, marca: e.target.value })}
                placeholder="Ingrese la marca"
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                  errores.marca ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                }`}
              />
            </div>
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">URL de Imagen</label>
              <input
                type="text"
                value={producto.imagenUrl}
                onChange={(e) => setProducto({ ...producto, imagenUrl: e.target.value })}
                placeholder="Ingrese URL de la imagen"
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                  errores.imagenUrl ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                }`}
              />
            </div>
          </div>

          {/* Visible */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={producto.visible}
              onChange={(e) => setProducto({ ...producto, visible: e.target.checked })}
              className="w-4 h-4 accent-red-500"
            />
            <span className="text-neutral-950 font-medium">Visible en la tienda</span>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={guardarProducto}
              disabled={loading}
              className={`bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Guardando..." : "Guardar Producto"}
            </button>
            <button
              type="button"
              className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors"
              onClick={() =>
                setProducto({
                  nombre: "",
                  descripcion: "",
                  precioUnitario: "",
                  precioMayor: "",
                  stock: "",
                  categoria: "",
                  marca: "",
                  visible: true,
                  imagenUrl: "",
                })
              }
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
}
