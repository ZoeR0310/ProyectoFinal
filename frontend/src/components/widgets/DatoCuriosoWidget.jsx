import { useState, useEffect } from 'react'

const DatoCuriosoWidget = () => {
  const [dato, setDato] = useState('Cargando dato...')

  useEffect(() => {
    const cargarDato = async () => {
      try {
        const res = await fetch(
          'https://uselessfacts.jsph.pl/api/v2/facts/random?language=es'
        )
        const data = await res.json()

        setDato(data.text)
      } catch (e) {
        setDato('El cerebro humano consume más energía que cualquier otro órgano 🧠')
      }
    }

    cargarDato()
  }, [])

  return (
    <div className="info-card-api" id="dato-card" style={{ borderLeft: '1px solid #eee', paddingLeft: '15px' }}>
      <h3 style={{ color: 'var(--primary-dark)', marginBottom: '10px' }}>🧠 Dato curioso</h3>
      <p id="dato-curioso">{dato}</p>
    </div>
  )
}

export default DatoCuriosoWidget