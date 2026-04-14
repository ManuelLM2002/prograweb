require 'json'

# Leer archivo JSON (lo exportaremos desde Node)
file = File.read('citas.json')
citas = JSON.parse(file)

puts "===== REPORTE DE CITAS ====="

citas.each do |cita|
  puts "ID: #{cita["id"]}"
  puts "Especialidad: #{cita["especialidad"]}"
  puts "Fecha: #{cita["fecha"]}"
  puts "Hora: #{cita["hora"]}"
  puts "Estado: #{cita["estado"]}"
  puts "Usuario: #{cita["usuario"]}"
  puts "---------------------------"
end

puts "Total de citas: #{citas.length}"