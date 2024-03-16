import dotenv from "dotenv"
import {app} from "./app.js"
import connectDB from "./db/index.js";
// import {router} from "./routes/auth.route.js"

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
    app.on("errror", (error) => {
        console.log("ERROR: ", error)
        throw error
    })
})
.catch((err) => {
    console.log("MONGODB connection falied !!!! ",err)
})

// app.use("api/v1/vashu",router)

//default route
app.get("/", (req, res) => {
    res.send("this is home page")
}) 