import Swal, { SweetAlertIcon, SweetAlertPosition } from "sweetalert2";

export const showInfoMixinAlert = (
    title: string,
    message: string,
    type: SweetAlertIcon,
    position?: SweetAlertPosition
) => Swal.mixin({
    icon: type,
    position: position ?? "top-end",
    showConfirmButton: false,
    showCloseButton: true,
    timer: 2000,
    timerProgressBar: true,
    title,
    html: message, // Cambiado de 'text' a 'html' para permitir contenido HTML
    toast: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
}).fire();
export const showLoadingAlert = (title: string, text: string) => {
    return Swal.fire({
        title,
        text,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })
}
export const showToastLoadingAlert = (title: string, text: string) => {
    return Swal.fire({
        title,
        text,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })
}

export const showInfoAlert = (title: string, text: string) => Swal.fire({
    icon: 'info',
    title,
    text,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
})
// export const formAlert = () => {
//     return Swal.fire({
//         title: 'Ingrese los detalles',
//         html: `
//         <input id="curso" class="swal2-input" placeholder="Curso">
//         <input id="aula" class="swal2-input" placeholder="Aula">
//         <textarea id="descripcion" class="swal2-textarea" placeholder="Descripción"></textarea>
//       `,
//         focusConfirm: false,
//         preConfirm: () => {
//             const curso = (document.getElementById('curso') as HTMLInputElement).value;
//             const aula = (document.getElementById('aula') as HTMLInputElement).value;
//             const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value;
//             if (!curso || !aula || !descripcion) {
//                 Swal.showValidationMessage("Por favor, rellene todos los campos.");
//                 return false;
//             }
//             return { curso, aula, descripcion };
//         },
//         confirmButtonText: 'Enviar',
//         showCancelButton: true,
//         cancelButtonText: 'Cancelar',
//     }).then((result) => {
//         if (result.isConfirmed) {
//             return result.value;
//         }
//     });
// }
export const showConfirmAlert = (title: string, text: string, callback: Function) => Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: 'green',
    cancelButtonColor: '#1282FB',
    cancelButtonText: 'Regresar',
    confirmButtonText: 'Confirmar',
    reverseButtons: true, // Add this line to reverse the order of the buttons
}).then((result) => {
    if (result.isConfirmed) {
        callback()
    }
})