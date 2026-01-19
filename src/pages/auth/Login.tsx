export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      {/* Fondos decorativos */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-100 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px]" />

      {/* Contenedor */}
      <div className="relative z-10 bg-white/70 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem] w-full max-w-[1150px] h-[720px] flex overflow-hidden m-4">
        
        {/* Branding */}
        <div className="hidden md:flex w-[42%] bg-gradient-to-br from-cyan-500 to-blue-600 p-16 flex-col justify-between text-white relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" fillOpacity="0.1" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-cyan-600 font-black text-2xl">N</span>
              </div>
              <span className="text-3xl font-bold tracking-tight">Nexora</span>
            </div>
            <h1 className="text-5xl font-extrabold leading-tight uppercase tracking-tight">
              Bazar <br /> Angelito
            </h1>
            <div className="h-1.5 w-20 bg-white/30 mt-6 rounded-full" />
          </div>

          <div className="relative z-10">
            <p className="text-blue-50 text-lg opacity-90 leading-relaxed">
              © 2026 Nexora Inc. <br /> 
              <span className="font-medium">Plataforma de gestión comercial profesional.</span>
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="w-full md:w-[58%] p-20 flex flex-col justify-center bg-white/40">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Iniciar sesión</h2>
            <p className="text-slate-500 mt-3 text-xl">Bienvenido de nuevo, por favor ingresa tus datos.</p>
          </div>

          <form className="space-y-8">
            <div>
              <label className="block text-base font-bold text-slate-700 mb-3 ml-1">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="usuario@nexora.com"
                className="w-full bg-white border p-5 rounded-2xl outline-none text-slate-800 text-lg border-slate-200 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-3 ml-1">
                <label className="text-base font-bold text-slate-700">
                  Contraseña
                </label>
                <a href="#" className="text-base font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white border p-5 rounded-2xl outline-none text-slate-800 text-lg border-slate-200 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500"
              />
            </div>

            <button
              type="button"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl shadow-xl transform active:scale-[0.98] transition-all duration-200 mt-4 text-xl"
            >
              Entrar al sistema
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-lg">
              ¿No tienes una cuenta? <a href="/register" className="text-cyan-600 font-bold hover:underline ml-1">Regístrate ahora</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
