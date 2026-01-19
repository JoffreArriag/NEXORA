export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      {/* Fondos */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-cyan-100 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-blue-100 rounded-full blur-[140px]" />

      {/* Contenedor registro más grande */}
      <div className="relative z-10 bg-white/70 backdrop-blur-2xl border border-white shadow-[0_30px_80px_rgba(0,0,0,0.08)] rounded-[3.5rem] w-full max-w-[1500px] h-[900px] flex overflow-hidden m-4">
        {/* Branding */}
        <div className="hidden md:flex w-[42%] bg-gradient-to-br from-cyan-500 to-blue-600 p-28 flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-4 mb-14">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-cyan-600 font-black text-4xl">N</span>
              </div>
              <span className="text-5xl font-bold">Nexora</span>
            </div>
            <h1 className="text-7xl font-extrabold leading-tight">Crear <br /> Cuenta</h1>
          </div>
          <p className="text-blue-100 text-xl">
            Plataforma inteligente para la gestión comercial del Bazar Angelito.
          </p>
        </div>

        {/* Formulario */}
        <div className="w-full md:w-[58%] p-28 bg-white/40 overflow-y-auto">
          <h2 className="text-6xl font-bold text-slate-800 mb-14">Registro de Usuario</h2>

          <form className="grid grid-cols-2 gap-10">
            <Input label="Nombre" />
            <Input label="Apellido" />
            <Input label="Cédula" />
            <Input label="Número de Teléfono" />
            <Input label="Correo Electrónico" type="email" />
            <Input label="Confirmar Correo Electrónico" type="email" />
            <Input label="Contraseña" type="password" />
            <Input label="Confirmar Contraseña" type="password" />
            <Input label="Fecha de Nacimiento" type="date" />
            <Select label="Género" options={["Masculino","Femenino","Otro"]} />
            <Input label="Dirección de Domicilio" className="col-span-2" />
            <Input label="Código Postal" />
            <Select label="Ciudad" options={[
              "Quito","Guayaquil","Cuenca","Machala","Manta","Portoviejo","Ambato",
              "Riobamba","Ibarra","Loja","Esmeraldas","Tulcán","Latacunga","Quevedo",
              "Babahoyo","Santa Elena","Playas","Salinas","Azogues","Macas",
              "Puyo","Tena","Nueva Loja","Zamora"
            ]} />

            <div className="col-span-2 flex gap-10 mt-12">
              <button type="button" className="flex-1 bg-slate-900 text-white py-7 rounded-2xl text-2xl font-bold hover:bg-slate-800">
                Registrarse
              </button>
              <button type="button" className="flex-1 bg-slate-200 text-slate-700 py-7 rounded-2xl text-2xl font-bold hover:bg-slate-300">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* COMPONENTES VISUALES */
interface InputProps { label: string; type?: string; className?: string }
function Input({ label, type="text", className="" }: InputProps) {
  return (
    <div className={className}>
      <label className="block text-xl font-bold text-slate-700 mb-3">{label}</label>
      <input type={type} placeholder={label}
        className="w-full bg-white border p-6 rounded-2xl text-xl outline-none border-slate-200 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
      />
    </div>
  )
}

interface SelectProps { label:string; options:string[]; }
function Select({ label, options }: SelectProps) {
  return (
    <div>
      <label className="block text-xl font-bold text-slate-700 mb-3">{label}</label>
      <select className="w-full bg-white border p-6 rounded-2xl text-xl outline-none border-slate-200 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all">
        <option value="">Seleccionar</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
