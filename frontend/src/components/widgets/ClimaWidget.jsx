import { useState, useEffect } from 'react'

const ClimaWidget = () => {
  const [clima, setClima] = useState({
    ciudad: 'Cargando...',
    temp: '',
    viento: ''
  })

  useEffect(() => {
    const cargarClima = async () => {
      try {
        const lat = 19.4326 // Toluca
        const lon = -99.1332

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        )
        const data = await res.json()

        setClima({
          ciudad: 'Toluca, MX',
          temp: `🌡️ ${data.current_weather.temperature}°C`,
          viento: `💨 Viento: ${data.current_weather.windspeed} km/h`
        })
      } catch (e) {
        setClima({
          ciudad: 'Error al cargar clima',
          temp: '',
          viento: ''
        })
      }
    }

    cargarClima()
  }, [])

  return (
    <div className="info-card-api" id="clima-card">
      <h3 style={{ color: 'var(--primary-dark)', marginBottom: '10px' }}>🌤️ Clima de hoy</h3>
      <p id="clima-ciudad">{clima.ciudad}</p>
      <p id="clima-temp" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{clima.temp}</p>
      <p id="clima-extra">{clima.viento}</p>
    </div>
  )
}

export default ClimaWidget