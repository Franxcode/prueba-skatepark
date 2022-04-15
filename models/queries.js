require('dotenv').config()

const { Client } = require('pg');

const insertUser = async (email, nombre, password, experiencia, especialidad, foto) => {



    const query = 'INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado, is_admin) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *';

    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        await client.connect();
        const counter = await client.query('SELECT COUNT(*) AS count FROM skaters');
        const [{ count }] = counter.rows;
        let isAdmin = false;
        if (Number(count) === 0) {
            isAdmin = true;
        }
        const values = [email,nombre,password,experiencia,especialidad,foto,false,isAdmin];
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        // console.log(error);
        return error;
    }
};

const getUsers = async() => {
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        await client.connect();
        const result = await client.query(`SELECT * FROM skaters ORDER BY id`);
        return result.rows;
    } catch (error) {
        return error;
    }
};

const getUser = async(email, password) => {
    const query = `SELECT * FROM skaters WHERE email = $1 AND password= $2 LIMIT 1`;
    const values = [email, password];
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        await client.connect();
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        return error;
    }
};

const getUserById = async(id) => {
    const query = `SELECT * FROM skaters WHERE id = $1`;
    const values = [id];
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        await client.connect();
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        return error;
    }
};

const updateUser = async (id, user) => {

    const query = 'UPDATE skaters SET nombre=$2, password=$3, anos_experiencia=$4, especialidad=$5 WHERE id=$1 RETURNING*';
    const values = [id, user.nombre, user.password, user.experiencia, user.especialidad];
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        await client.connect();
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        return error;
    }
};

const updateStatus = async (id, status) => {

    const query = 'UPDATE skaters SET estado=$2 WHERE id=$1 RETURNING*';
    const values = [id, status];
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        await client.connect();
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        return error;
    }
};
const deleteUser = async (id) => {
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        await client.connect();
        const result = await client.query(`DELETE FROM skaters WHERE id = '${id}'`);
        return result.rowCount;
    } catch (error) {
        return error;
    }
};

module.exports = {
    insertUser,
    getUsers,
    getUser,
    getUserById,
    updateUser,
    updateStatus,
    deleteUser
}