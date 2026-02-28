import axios from "axios"

const getDatoCurioso = async () => {
    try {
        const response = await axios.get("https://uselessfacts.jsph.pl/random.json?language=es")
        return response.data.text
    } catch (error) {
        return "¿Sabías que aprender algo nuevo fortalece el cerebro?"
    }
}

export { getDatoCurioso }