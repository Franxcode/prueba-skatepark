const url = '/';
const email = document.getElementById('email');
const nombre = document.getElementById('nombre');
const password = document.getElementById('password');
const repetirPassword = document.getElementById('repetirPassword');
const experiencia = document.getElementById('experiencia');
const especialidad = document.getElementById('especialidad');
const registrarse = document.getElementById('registrarse');

const registro = (event) => {
    event.preventDefault();

    const payload = {
        email: email.value,
        nombre: nombre.value,
        password: password.value,
        experiencia: experiencia.value,
        especialidad: especialidad.value,
        estado: false
    };
    console.log("REGISTRO", payload);
    // if (payload.password === payload.repetirPassword) {
        axios.post(url + 'users', payload).then((response) => {
            const { response:data } = response.data;
            Swal.fire({
                title: 'Éxito!',
                text: `Has creado un nuevo usuario -
                email: ${data.email} |
                nombre: ${data.nombre} |
                experiencia: ${data.anos_experiencia} |
                especialidad: ${data.especialidad} |
                estado: ${data.estado === false ? 'En revision' : 'Aprobado'}`,
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Ok!'
            });
            email.value = ''
            nombre.value = '';
            password.value = '';
            experiencia.value = '';
            especialidad.value = '';
        
}).catch((error) => {
    const { data } = error.response;
    const errorMessages = {
        "users_username_key": "El nombre de usuario ya existe.",
        "users_email_key": "El email ya existe."
    };
    Swal.fire({
        title: 'Ha ocurrido un error!',
        text: `Error:
         ${errorMessages[data.response.constraint]}`,
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Ok!'
      });
});
    // }else{
        // Swal.fire({
        //     title: 'Ha ocurrido un error!',
        //     text: `Error: Las contrasenas no coinciden - Password: ${payload.password} - Repetir Password: ${payload.repetirPassword}`,
        //     icon: 'error',
        //     confirmButtonColor: '#3085d6',
        //     confirmButtonText: 'Ok!'
        //   });
    // }      
};

// registrarse.addEventListener('click', () => registro);