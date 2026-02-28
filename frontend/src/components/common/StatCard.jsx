const StatCard = ({ titulo, valor, onClick }) => {
  return (
    <div className="stat-card" onClick={onClick}>
      <h3>{titulo}</h3>
      <p>{valor}</p>
    </div>
  )
}

export default StatCard