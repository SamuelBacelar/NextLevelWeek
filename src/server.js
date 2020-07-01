const express = require("express")
const nunjucks = require("nunjucks")
const db = require("./database/db")
const server = express()


server.use(express.static("public"))

server.use(express.urlencoded({ extended: true }))


nunjucks.configure("src/views", {
    express: server,
    noCache: true
})


//Rotas________________________________________________
server.get("/", (req, res) => {
    return res.render("index.html", {title: "Um título"})
})

server.get("/create-point", (req, res) => {

    console.log(req.query)

    return res.render("create-point.html", {saved: false})
})

server.post("/savepoint", (req, res) => {

    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?
        );
    `
    const values = [
      req.body.image,
      req.body.name,
      req.body.address,
      req.body.address2,
      req.body.state,
      req.body.city,
      req.body.items
    ]

    function afterInsertData(err) {
        if (err) {
            console.log(err)
            return res.send("Erro no cadastro")
        }

        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render("create-point.html", {saved: true})
    }

    db.run(query, values, afterInsertData)

   
})

server.get("/search-results", (req, res) => {

    const search = req.query.search

    if (search === "") {
        return res.render("search-results.html", { total: 0 })
    }

     db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
        if (err) {
            return console.log(err)
        }

        const total = rows.length

        return res.render("search-results.html", {places: rows, total})
    })

   
})

server.listen(3000)