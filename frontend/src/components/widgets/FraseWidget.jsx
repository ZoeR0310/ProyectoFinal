import { useState, useEffect } from 'react'

const FraseWidget = () => {
  const [frase, setFrase] = useState({
    texto: 'Cargando frase...',
    autor: ''
  })

  useEffect(() => {
    const cargarFrase = async () => {
      try {
        const res = await fetch('https://api.quotable.io/random')
        const data = await res.json()

        setFrase({
          texto: `"${data.content}"`,
          autor: `— ${data.author}`
        })
      } catch (e) {
        setFrase({
          texto: 'Hoy también es un buen día para avanzar 💪',
          autor: ''
        })
      }
    }

    cargarFrase()
  }, [])

  return (
    <div className="info-card-api" id="frase-card" style={{ borderLeft: '1px solid #eee', paddingLeft: '15px' }}>
      <h3 style={{ color: 'var(--primary-dark)', marginBottom: '10px' }}>💚 Frase del día</h3>
      <p id="frase-texto">{frase.texto}</p>
      <small id="frase-autor" style={{ color: '#666' }}>{frase.autor}</small>
    </div>
  )
}

export default FraseWidget