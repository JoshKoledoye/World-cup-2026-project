import axios from "axios"
import fs from "fs"
import { env } from "../Config/env"

const api = axios.create({
    baseURL: "https://v3.football.api-sports.io",
    headers: {
        "x-apisports-key": env.API_FOOTBALL_SECRET_KEY
    }
})

async function testApi() {
const stuff = await api.get("/fixtures?league=39&season=2022")
const deepClone = JSON.parse(JSON.stringify(stuff.data))
console.log(deepClone)

// write res to file

fs.writeFileSync("fixtures.json", JSON.stringify(deepClone))
}
testApi()

export default api