const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const { randomBytes } = require('crypto')

const app = express()

const port = 8080

const db = new sqlite3.Database(path.join(__dirname, 'db.db'), (err) => {
  if (err) {
    return console.error(err.message)
  }
  console.log('Connected to SQlite database')
})

const saltRounds = 10

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use('/scripts', express.static(path.join(__dirname, 'public', 'scripts')))

const getTokenFromRequest = (req) => {
  const auth = req.header('Authorization')
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.replace('Bearer ', '')
    if (token) {
      return token
    }
  }
  return null
}

const getUserByToken = async (token) => {
  return new Promise((resolve, reject) => {
    db.get('select * from users where token = ?', [token], (err, row) => {
      if (row) {
        resolve(row)
      }
      resolve(null)
    })
  })
}

const getUserByCredentials = async (email, password) => {
  return new Promise((resolve, reject) => {
    db.get('select * from users where email = ?', [email], (err, row) => {
      if (row) {
        resolve(row)
      }
      resolve(null)
    })
  })
}

const isUserAuthorized = async (req) => {
  const token = getTokenFromRequest(req)
  if (!token) {
    return false
  }
  const user = await getUserByToken(token)
  if (!user) {
    return false
  }
  return true
}

const getUser = async (req) => {
  const token = getTokenFromRequest(req)
  if (!token) {
    return null
  }
  return await getUserByToken(token)
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')))

app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')))

app.post('/check', async (req, res) => {
  const authorized = await isUserAuthorized(req)
  res.status(200).json({ success: authorized })
})

app.post('/logout', async (req, res) => {
  const user = await getUser(req)
  console.log(user)
  db.run('update users set token = null where id = ?', [user.id], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      })
    }
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body || {}

  const errors = {}

  if (!email) {
    errors.email = 'email is required'
  }

  if (!password) {
    errors.password = 'password is required'
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      errors,
    })
  }

  const user = await getUserByCredentials(email, password)

  const token = randomBytes(64).toString('hex')

  if (user) {
    db.run('update users set token = ? where id = ?', [token, user.id], (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        })
      }
      return res.status(200).json({
        success: true,
        token,
      })
    })
  } else {
    return res.status(403).json({
      success: false,
    })
  }
})

app.post('/register', (req, res) => {
  const { username, email, password, password_confirmation } = req.body || {}

  const errors = {}

  if (!username) {
    errors.username = 'username is required'
  }

  if (!email) {
    errors.email = 'email is required'
  }

  if (!password) {
    errors.password = 'password is required'
  } else {
    if (!password_confirmation) {
      errors.password_confirmation = 'password confirmation is required'
    } else if (password_confirmation != password) {
      errors.password = 'password not confirmed'
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      errors,
    })
  }

  const passwordHash = bcrypt.hashSync(password, saltRounds)

  db.run('insert into users (username, email, password) values (?, ?, ?)', [username, email, passwordHash], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      })
    }
    return res.status(200).json({
      success: true,
    })
  })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
