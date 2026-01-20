import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

interface Historial {
  id: string;
  fecha: Date;
  accion: string;
  descripcion: string;
  monto?: number;
}

export default function HistorialUsuario() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState<string>("");
  const [roles, setRoles] = useState<string[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarUsuarios = async () => {
      const snap = await getDocs(collection(db, "usuarios"));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Usuario[];

      setUsuarios(data);
    };

    cargarUsuarios();
  }, []);

  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "roles"));
        const listaRoles = snapshot.docs.map((doc) => doc.id);
        setRoles(listaRoles);
      } catch (error) {
        console.error("Error cargando roles", error);
      }
    };
    cargarRoles();
  }, []);

  const cargarHistorial = async (usuarioId: string) => {
    setLoading(true);

    const q = query(
      collection(db, "historial"),
      where("usuarioId", "==", usuarioId)
    );

    const snap = await getDocs(q);

    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha.toDate(),
    })) as Historial[];

    setHistorial(data);
    setLoading(false);
  };

  const sugerencias = usuarios.filter(
    (u) =>
      (u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correo.toLowerCase().includes(busqueda.toLowerCase())) &&
      (rolFiltro
        ? u.rol.trim().toLowerCase() === rolFiltro.trim().toLowerCase()
        : true)
  );

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">
        Historial de Usuarios
      </h2>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={usuarioSeleccionado ? usuarioSeleccionado.nombre : busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setUsuarioSeleccionado(null);
            setHistorial([]);
          }}
          className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
        />

        <select
          value={rolFiltro}
          onChange={(e) => setRolFiltro(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Todos los roles</option>
          {roles.map((rol) => (
            <option key={rol} value={rol}>
              {rol}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px]">
        {/* LISTADO DE USUARIOS */}
        {!usuarioSeleccionado && (
          <div className="space-y-4">
            {sugerencias.map((u) => (
              <div
                key={u.id}
                onClick={async () => {
                  setUsuarioSeleccionado(u);
                  setBusqueda("");
                  await cargarHistorial(u.id);
                }}
                className="p-4 border rounded-xl hover:bg-red-100 cursor-pointer flex justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {u.nombre} {u.apellido}
                  </p>
                  <p className="text-sm">{u.correo}</p>
                </div>
                <span className="text-sm text-gray-500">Ver historial</span>
              </div>
            ))}
          </div>
        )}

        {/* HISTORIAL */}
        {usuarioSeleccionado && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">
              Historial de {usuarioSeleccionado.nombre}{" "}
              {usuarioSeleccionado.apellido}
            </h3>

            {loading ? (
              <p>Cargando historial...</p>
            ) : historial.length === 0 ? (
              <p>No hay registros para este usuario</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {historial.map((h) => (
                  <div key={h.id} className="bg-white p-4 rounded-xl shadow">
                    <div className="flex justify-between mb-1">
                      <p className="font-semibold">{h.accion}</p>
                      <p className="text-sm text-gray-500">
                        {h.fecha.toLocaleDateString()}
                      </p>
                    </div>
                    <p>{h.descripcion}</p>
                    {h.monto && (
                      <p className="text-green-600 font-semibold">${h.monto}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              className="bg-gray-300 px-6 py-2 rounded-xl hover:bg-gray-400"
              onClick={() => {
                setUsuarioSeleccionado(null);
                setHistorial([]);
              }}
            >
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
