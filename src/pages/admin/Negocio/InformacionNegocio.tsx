import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import Toast from "../../../components/Toast";

interface Negocio {
  nombre: string;
  propietario: string;
  ruc: string;
  direccion: string;
  telefono: string;
  correo: string;
  ciudad: string;
  logoUrl: string;
  whatsapp: string;
  googleMaps: string;
  eslogan: string;
  horarios: string;
}

export default function InformacionNegocio() {
  const [negocio, setNegocio] = useState<Negocio>({
    nombre: "",
    propietario: "",
    ruc: "",
    direccion: "",
    telefono: "",
    correo: "",
    ciudad: "",
    logoUrl: "",
    whatsapp: "",
    googleMaps: "",
    eslogan: "",
    horarios: "",
  });

  const [editando, setEditando] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(true);

  const ref = doc(db, "negocio", "config");
  useEffect(() => {
    const cargar = async () => {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setNegocio(snap.data() as Negocio);
      }
      setLoading(false);
    };
    cargar();
  }, []);

  const guardar = async () => {
    try {
      await setDoc(ref, negocio);
      setToast("Información del negocio guardada");
      setToastType("success");
    } catch (error) {
      console.error(error);
      setToast("Error al guardar la información");
      setToastType("error");
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px]">

        <div className="flex justify-center mb-6">
          <img
            src={negocio.logoUrl || "/logolocal.png"}
            className="w-32 h-32 object-cover rounded-2xl border"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">

          <Input label="Nombre del Local" value={negocio.nombre} disabled={!editando}
            onChange={(v) => setNegocio({ ...negocio, nombre: v })} />

          <Input label="Propietario" value={negocio.propietario} disabled={!editando}
            onChange={(v) => setNegocio({ ...negocio, propietario: v })} />

          <Input label="RUC" value={negocio.ruc} disabled={!editando}
            onChange={(v) => setNegocio({ ...negocio, ruc: v })} />

          <Input label="Ciudad" value={negocio.ciudad} disabled={!editando}
            onChange={(v) => setNegocio({ ...negocio, ciudad: v })} />

          <Input label="Dirección" value={negocio.direccion} disabled={!editando}
            onChange={(v) => setNegocio({ ...negocio, direccion: v })} />

          <Input label="Horarios" value={negocio.horarios} disabled={!editando}
            onChange={(v) => setNegocio({ ...negocio, horarios: v })} />

          <Input label="Teléfono" value={negocio.telefono} disabled={!editando}
            onChange={(v) => setNegocio({ ...negocio, telefono: v })} />

          <Input label="WhatsApp" value={negocio.whatsapp} disabled={!editando}
            onChange={(v) => setNegocio({ ...negocio, whatsapp: v })} />

          <Input label="Correo" value={negocio.correo} disabled={!editando}
            onChange={(v) => setNegocio({ ...negocio, correo: v })} />

          <Input label="Google Maps" value={negocio.googleMaps} disabled={!editando}
            onChange={(v) => setNegocio({ ...negocio, googleMaps: v })} />

        </div>

        {/* Eslogan */}
        <div className="mt-4">
          <label className="font-semibold">Eslogan</label>
          <textarea
            value={negocio.eslogan}
            disabled={!editando}
            onChange={(e) => setNegocio({ ...negocio, eslogan: e.target.value })}
            className={`w-full border rounded-lg p-2 ${
              !editando && "bg-gray-100 text-gray-500"
            }`}
          />
        </div>

        {/* Logo */}
        <div className="mt-4">
          <label className="font-semibold">Logo URL</label>
          <input
            value={negocio.logoUrl}
            disabled={!editando}
            onChange={(e) => setNegocio({ ...negocio, logoUrl: e.target.value })}
            className={`w-full border rounded-lg p-2 ${
              !editando && "bg-gray-100 text-gray-500"
            }`}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4 mt-6 justify-end">
          {!editando ? (
            <button
              onClick={() => setEditando(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl"
            >
              Editar Información
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditando(false)}
                className="bg-gray-400 text-white px-6 py-2 rounded-xl"
              >
                Cancelar
              </button>

              <button
                onClick={async () => {
                  await guardar();
                  setEditando(false);
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-xl"
              >
                Guardar Cambios
              </button>
            </>
          )}
        </div>

      </div>

      {toast && (
        <Toast message={toast} type={toastType} onClose={() => setToast("")} />
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="font-semibold">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-lg px-4 py-2 ${
          disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"
        }`}
      />
    </div>
  );
}
