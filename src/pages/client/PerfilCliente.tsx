import { useState } from "react";

export default function PerfilCliente() {
  const datosIniciales = {
    nombre: "Juan",
    apellido: "Pérez",
    cedula: "0102030405",
    telefono: "+593 987 654 321",
    correo: "juan.perez@email.com",
    confirmCorreo: "juan.perez@email.com",
    password: "12345678",
    confirmPassword: "12345678",
    nacimiento: "1990-01-01",
    genero: "Masculino",
    direccion: "Av. Principal 123",
    postal: "170101",
    ciudad: "Quito"
  };

  const [form, setForm] = useState(datosIniciales);
  const [editando, setEditando] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => setForm(prev => ({...prev, [key]:value}));
  const handleCancelar = () => { setForm(datosIniciales); setEditando(false); }
  const handleGuardar = () => { console.log("Guardando datos:", form); setEditando(false); }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-black text-slate-800">Mi Perfil</h1>
        {!editando && (
          <button onClick={()=>setEditando(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-8 rounded-2xl font-semibold transition-colors">
            Editar
          </button>
        )}
      </div>
      <p className="text-lg text-slate-700 mb-12">Visualiza y edita tu información personal completa.</p>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Campo label="Nombre" value={form.nombre} editable={editando} onChange={v=>handleChange("nombre",v)} />
        <Campo label="Apellido" value={form.apellido} editable={editando} onChange={v=>handleChange("apellido",v)} />
        <Campo label="Cédula" value={form.cedula} editable={editando} onChange={v=>handleChange("cedula",v)} />
        <Campo label="Teléfono" value={form.telefono} editable={editando} onChange={v=>handleChange("telefono",v)} />
        <Campo label="Correo Electrónico" value={form.correo} editable={editando} onChange={v=>handleChange("correo",v)} />
        <Campo label="Confirmar Correo Electrónico" value={form.confirmCorreo} editable={editando} onChange={v=>handleChange("confirmCorreo",v)} />
        <Campo label="Contraseña" type="password" value={form.password} editable={editando} onChange={v=>handleChange("password",v)} />
        <Campo label="Confirmar Contraseña" type="password" value={form.confirmPassword} editable={editando} onChange={v=>handleChange("confirmPassword",v)} />
        <Campo label="Fecha de Nacimiento" type="date" value={form.nacimiento} editable={editando} onChange={v=>handleChange("nacimiento",v)} />
        <Campo label="Género" type="select" value={form.genero} options={["Masculino","Femenino","Otro"]} editable={editando} onChange={v=>handleChange("genero",v)} />
        <Campo label="Dirección" value={form.direccion} editable={editando} onChange={v=>handleChange("direccion",v)} className="col-span-2" />
        <Campo label="Código Postal" value={form.postal} editable={editando} onChange={v=>handleChange("postal",v)} />
        <Campo label="Ciudad" type="select" value={form.ciudad} editable={editando} onChange={v=>handleChange("ciudad",v)} options={[
          "Quito","Guayaquil","Cuenca","Machala","Manta","Portoviejo","Ambato",
          "Riobamba","Ibarra","Loja","Esmeraldas","Tulcán","Latacunga","Quevedo",
          "Babahoyo","Santa Elena","Playas","Salinas","Azogues","Macas",
          "Puyo","Tena","Nueva Loja","Zamora"
        ]} />

        {editando && (
          <div className="col-span-2 flex gap-6 mt-10">
            <button type="button" onClick={handleGuardar} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-5 rounded-2xl font-bold text-xl transition-colors">
              Guardar Cambios
            </button>
            <button type="button" onClick={handleCancelar} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-5 rounded-2xl font-bold text-xl transition-colors">
              Cancelar
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

/* COMPONENTES */
interface CampoProps { label:string; value:string; type?:string; options?:string[]; editable?:boolean; className?:string; onChange:(v:string)=>void }
function Campo({ label, value, type="text", options=[], editable=true, className="", onChange }: CampoProps) {
  if(type==="select"){
    return (
      <div className={className}>
        <label className="block text-lg font-bold text-slate-700 mb-2">{label}</label>
        <select value={value} disabled={!editable} onChange={e=>onChange(e.target.value)}
          className={`w-full bg-white border p-5 rounded-2xl text-lg outline-none transition-all
            ${editable ? "border-slate-200 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500" : "border-slate-200 bg-slate-100 cursor-not-allowed"}`}>
          {options.map(opt=><option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    )
  }
  return (
    <div className={className}>
      <label className="block text-lg font-bold text-slate-700 mb-2">{label}</label>
      <input type={type} value={value} disabled={!editable} onChange={e=>onChange(e.target.value)}
        className={`w-full bg-white border p-5 rounded-2xl text-lg outline-none transition-all
          ${editable ? "border-slate-200 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500" : "border-slate-200 bg-slate-100 cursor-not-allowed"}`}
      />
    </div>
  )
}
