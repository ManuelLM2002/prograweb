require 'sinatra'
require 'sinatra/json'
require 'rack/cors'
require 'json'

set :bind, '0.0.0.0'
set :port, 3000

# =========================
# 🌐 CORS
# =========================
use Rack::Cors do
  allow do
    origins '*'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :delete, :options]
  end
end

# =========================
# 👤 USUARIOS
# =========================
USUARIOS = [
  { id: 1, username: "admin@admin.com", password: "1234", nombre: "Administrador", rol: "Admin" },
  { id: 2, username: "miguel@gmail.com", password: "1234", nombre: "Miguel", rol: "Usuario" }
]

# =========================
# 📅 CITAS
# =========================
CITAS = []

# =========================
# PREFLIGHT
# =========================
options '*' do
  200
end

# =========================
# 🔐 LOGIN
# =========================
post '/login' do
  data = JSON.parse(request.body.read)

  user = USUARIOS.find do |u|
    u[:username] == data["username"] && u[:password] == data["password"]
  end

  if user.nil?
    status 401
    return json(message: "Credenciales incorrectas")
  end

  json(
    username: user[:username],
    nombre: user[:nombre],
    rol: user[:rol]
  )
end

# =========================
# 📝 REGISTRO (CREAR)
# =========================
post '/registro' do
  data = JSON.parse(request.body.read)

  nuevo = {
    id: Time.now.to_i,
    username: data["username"],
    password: data["password"],
    nombre: data["nombre"],
    rol: "Usuario"
  }

  USUARIOS << nuevo
  json(nuevo)
end

# =========================
# 👤 OBTENER USUARIOS
# =========================
get '/usuarios' do
  json USUARIOS
end

# =========================
# ✏️ EDITAR / CAMBIAR ROL
# =========================
put '/usuarios/:id' do
  id = params[:id].to_i
  data = JSON.parse(request.body.read)

  user = USUARIOS.find { |u| u[:id] == id }

  if user.nil?
    status 404
    return json(message: "Usuario no encontrado")
  end

  user[:nombre] = data["nombre"] if data["nombre"]
  user[:username] = data["username"] if data["username"]
  user[:rol] = data["rol"] if data["rol"]

  json user
end

# =========================
# ❌ ELIMINAR USUARIO
# =========================
delete '/usuarios/:id' do
  id = params[:id].to_i

  user = USUARIOS.find { |u| u[:id] == id }

  if user.nil?
    status 404
    return json(message: "Usuario no encontrado")
  end

  USUARIOS.delete(user)

  json(message: "Usuario eliminado")
end

# =========================
# 📅 CITAS (IGUAL QUE NODE)
# =========================
post '/citas' do
  data = JSON.parse(request.body.read)

  nueva = {
    id: Time.now.to_i,
    especialidad: data["especialidad"],
    fecha: data["fecha"],
    hora: data["hora"],
    estado: "Confirmada",
    usuario: data["usuario"]
  }

  CITAS << nueva
  json nueva
end

get '/citas' do
  json CITAS
end

get '/mis-citas/:usuario' do
  usuario = params[:usuario]
  mis = CITAS.select { |c| c[:usuario] == usuario }
  json mis
end

delete '/citas/:id' do
  id = params[:id].to_i
  cita = CITAS.find { |c| c[:id] == id }

  if cita.nil?
    status 404
    return json(message: "Cita no encontrada")
  end

  CITAS.delete(cita)
  json(message: "Cita eliminada")
end