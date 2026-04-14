require 'sinatra'
require 'json'

get '/saludo' do
  content_type :json
  { mensaje: "Hola desde Ruby 🧪" }.to_json
end