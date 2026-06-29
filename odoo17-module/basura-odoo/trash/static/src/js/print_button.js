function printTicket() {
    var iframe = document.querySelector('.o_readonly');

    if (!iframe) {
        console.error('No se encontró el iframe con la clase .o_readonly');
        return;
    }
    var iframeHead = iframe.contentDocument.head.innerHTML;

    var iframeContent = iframe.contentDocument.body.innerHTML;
    var printWindow = window.open('', '_blank');
    const printDocument = printWindow.document;

    const fragment = printDocument.createDocumentFragment();
    const htmlContent = document.createElement('html');

    htmlContent.innerHTML = `
        <html>
        ${iframeHead}
        ${iframeContent}
        </html>
    `;
    fragment.appendChild(htmlContent);
    printDocument.body.appendChild(fragment);

    printDocument.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}