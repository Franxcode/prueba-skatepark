require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const hbs = require('hbs');
const expressFileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const { insertUser, getUsers, getUser, getUserById, updateUser, updateStatus, deleteUser } = require('./models/queries');

const SESSIONCOOKIE = 'session';
// Handlebars
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper("counter", (index) => {
    return index + 1;
});

// Middlewares
app.use('/assets', express.static(__dirname + '/public/assets') );
app.use( express.json() );
app.use( express.static('public') );
app.use( express.urlencoded({ extended: true }) );
app.use(cookieParser());
app.use( expressFileUpload({
    limits: {fileSize: 90000000},
    abortOnLimit: true,
    responseOnLimit: 'El peso del archivo que intentas subir supera el limite permitido.'
}) );

const validateJWT = async (req, res, next) => {
    if (!req.cookies[SESSIONCOOKIE]) {
        res.redirect('/login');
        return;
    }

    const cookie = req.cookies[SESSIONCOOKIE];
    try {
        const token = await jwt.verify(cookie, process.env.SECRETKEY);
        req.userId = token.userId;
        req.isAdmin = token.isAdmin;
    } catch (error) {
        res.redirect('/login');
        return error;
    }
    next();
};

// Routes
app.get('/', validateJWT, async (req, res) => {
    const users = await getUsers();
    if (req.isAdmin) {
        res.redirect('/admin');    
    }else{
        res.render('index', {users});
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie(SESSIONCOOKIE);
    res.redirect('/login');
});

app.get('/datos', validateJWT, async (req, res) => {
    const id = req.userId;
    const user = await getUserById(id);
    res.render('datos', {user});
});

app.post('/datos', validateJWT, async (req, res) => {
    const { nombre, password, repitePassword, experiencia, especialidad } = req.body;

    const payload = {
        nombre,
        password,
        experiencia,
        especialidad
    }
    if (password !== repitePassword) {
        res.render('datos', {
            error: 'Las contrasenas no coinciden.'
        });
        return;
    }
    try {
        const user = await updateUser(req.userId, payload);
        if (user && user.email) {
            res.render('datos', {user});
            return;
        }
        throw user;
    } catch (error) {
        const user = await getUserById(req.userId);
        console.log(user);
        console.log(error);
        console.log(error.message);
        res.status(500).render('datos', {
            user,
            error: `Ha ocurrido un error ${error.message}`
        });
    }

});

app.delete('/datos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await deleteUser(id);
        if (response > 0) {
            res.render('registro', {
                message: 'Exito'
            });
            return;
        }else{
            res.status(500).render('datos', {
                error: 'Contacte al Administrador.'
            });
        }
    } catch (error) {
        return error;
    }
});

app.get('/admin', validateJWT, async (req, res) => {
    const users = await getUsers();
    res.render('admin', {users}); 
});

app.post('/admin', validateJWT, async (req, res) => {
    const { id, estado = false } = req.body;
    try {
        await updateStatus(id, estado);
        res.redirect('/admin');
    } catch (error) {
        return error;
    }

});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Verificar si el usuario existe
        const user = await getUser(email, password);
        // Crear Token
        if (user && user.email) {

            const token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + 120,
                userId: user.id,
                isAdmin: user.is_admin
            },
            process.env.SECRETKEY);
            res.cookie(SESSIONCOOKIE,token, {
                maxAge: 300000,
                secure: true,
            }).redirect('/datos');
        }else{
            res.status(400).render('login', {
                error: 'Usuario o contrasena invalida.'
            });
        }
    } catch (error) {
        return res.status(500).render('login',
        {
            error: 'Hable con el administrador.'
        });
    }
});

app.get('/registro', (req, res) => {
    res.render('registro');
});

app.post('/registro', async (req, res) => {
    if (req.files === null) {
        res.render('registro', {
            error: 'Debes cargar una foto de perfil.'
        });
        return;
    }
    const { email, nombre, password, repetirPassword, experiencia, especialidad} = req.body;
    const { foto } = req.files;
    const photoName = `${foto.md5}-${foto.name}`;
    if (password !== repetirPassword) {
        res.render('registro', {
            error: 'Las contrasenas no coinciden.'
        });
        return;
    }
    const response = await insertUser(email, nombre, password, experiencia, especialidad, photoName);

    const errorMessages = {
        "skaters_email_key": "El correo electronico ya fue utilizado",
    }
    if (response.severity) {
        res.status(500).render('registro', {
            error: `Ha ocurrido un error: ${errorMessages[response.constraint]}.`
        });
        return;
    }
    try {
        await foto.mv(__dirname + `/public/assets/uploads/${photoName}`);
    } catch (error) {
        res.render('registro', {
            error: error.message
        });
    }
    res.redirect('/login');
});

app.listen(port, () => console.log(`Server initialized at port ${port}.`));