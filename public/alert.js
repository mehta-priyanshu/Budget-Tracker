function showAlert(message) {
    const alertBox = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    const alertOkButton = document.getElementById('alert-ok');

    alertMessage.textContent = message;
    alertBox.style.display = 'flex';

    alertOkButton.onclick = function() {
        alertBox.style.display = 'none'; // Close alert when OK is clicked
    };
}
window.onclick = function(event) {
    if (event.target === document.getElementById('custom-alert')) {
        event.target.style.display = 'none';
    }
};