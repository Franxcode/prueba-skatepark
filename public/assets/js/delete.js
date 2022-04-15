const eliminarUser = (event, id) => {
    event.preventDefault();
    Swal.fire({
        title: 'Estás seguro que deseas eliminar este usuario?',
        text: "Está acción no podrá ser revertida!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar!'
      }).then((result) => {
        if (result.isConfirmed) {
        axios.delete(`/datos/${id}`);
        Swal.fire(
            'Borrado!',
            'El usuario ha sido eliminado.',
            'success'
        );
        setTimeout(()=> {
            window.location.href = 'registro';
        },2000)
        }
    });
};