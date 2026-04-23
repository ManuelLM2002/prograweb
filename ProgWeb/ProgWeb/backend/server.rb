require 'sinatra'
require 'sinatra/json'
require 'mysql2'
require 'rack/cors'
require 'json'

set :bind, '0.0.0.0'
set :port, 3000

# =========================
# CORS
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
# 🛢️ CONEXIÓN MYSQL
# =========================
DB = Mysql2::Client.new(
  host: "localhost",
  username: "root",
  password: "Admin123!",
  database: "hospital"
)

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

  result = DB.query("
    SELECT * FROM usuarios 
    WHERE username='#{data["username"]}' 
    AND password='#{data["password"]}'
  ")

  user = result.first

  if user.nil?
    status 401
    return json(message: "Credenciales incorrectas")
  end

  json(
    username: user["username"],
    nombre: user["nombre"],
    rol: user["rol"] || "Usuario"
  )
end

# =========================
# 📝 REGISTRO
# =========================
post '/registro' do
  data = JSON.parse(request.body.read)

  DB.query("
    INSERT INTO usuarios (username, password, nombre, rol)
    VALUES ('#{data["username"]}', '#{data["password"]}', '#{data["nombre"]}', 'Usuario')
  ")

  json(message: "Usuario creado")
end

# =========================
# 👤 CREAR USUARIO (ADMIN)
# =========================
post '/usuarios' do
  data = JSON.parse(request.body.read)

  DB.query("
    INSERT INTO usuarios (username, password, nombre, rol)
    VALUES ('#{data["username"]}', '#{data["password"]}', '#{data["nombre"]}', '#{data["rol"] || "Usuario"}')
  ")

  json(message: "Usuario creado")
end

# =========================
# 👥 OBTENER USUARIOS
# =========================
get '/usuarios' do
  result = DB.query("SELECT * FROM usuarios")
  json result.to_a
end

# =========================
# ✏️ EDITAR USUARIO
# =========================
put '/usuarios/:id' do
  id = params[:id]
  data = JSON.parse(request.body.read)

  campos = []
  campos << "nombre='#{data["nombre"]}'" if data["nombre"]
  campos << "username='#{data["username"]}'" if data["username"]
  campos << "rol='#{data["rol"]}'" if data["rol"]

  DB.query("UPDATE usuarios SET #{campos.join(", ")} WHERE id=#{id}")

  json(message: "Actualizado")
end

# =========================
# ❌ ELIMINAR USUARIO
# =========================
delete '/usuarios/:id' do
  id = params[:id]

  DB.query("DELETE FROM usuarios WHERE id=#{id}")

  json(message: "Eliminado")
end

# =========================
# 📅 CREAR CITA
# =========================
post '/citas' do
  data = JSON.parse(request.body.read)

  DB.query("
    INSERT INTO citas (id, especialidad, fecha, hora, estado, usuario)
    VALUES (#{Time.now.to_i}, '#{data["especialidad"]}', '#{data["fecha"]}', '#{data["hora"]}', 'Confirmada', '#{data["usuario"]}')
  ")

  json(message: "Cita creada")
end

# =========================
# 📅 OBTENER CITAS
# =========================
get '/citas' do
  result = DB.query("SELECT * FROM citas")
  json result.to_a
end

# =========================
# ❌ ELIMINAR CITA
# =========================
delete '/citas/:id' do
  id = params[:id]

  DB.query("DELETE FROM citas WHERE id=#{id}")

  json(message: "Cita eliminada")
end

# =========================
# 📤 EXPORTAR CITAS
# =========================
get '/exportar-citas' do
  result = DB.query("SELECT * FROM citas").to_a

  File.write("citas.json", JSON.pretty_generate(result))

  json(message: "Exportado correctamente")
end