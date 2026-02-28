import axios from "axios"

const getClima = async () => {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather`,
            {
                params: {
                    q: "Toluca",
                    units: "metric",
                    lang: "es",
                    appid: process.env.WEATHER_API_KEY
                }
            }
        )

        return {
            temp: response.data.main.temp,
            descripcion: response.data.weather[0].description
        }
    } catch (error) {
        return null
    }
}

export { getClima }