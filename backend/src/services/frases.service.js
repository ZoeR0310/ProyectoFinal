import axios from "axios"

const getFrase = async () => {
    try {
        const response = await axios.get("https://zenquotes.io/api/random")
        return response.data[0].q
    } catch (error) {
        return "Hoy es un buen día para aprender algo nuevo 💚"
    }
}

export { getFrase }