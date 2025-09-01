
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed.");

    // Registration Form Handling
    const registrationForm = document.getElementById('registration');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let name = document.getElementById('username1').value;
            const email = document.getElementById('email1').value;
            const password = document.getElementById('password1').value;

            const nameParts = name.split(' ');
            name = nameParts.map(part => {
                return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            }).join(' ');

            try {
                const response = await fetch('http://localhost:5000/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log("Token received:", data.token);
                    localStorage.setItem('token', data.token);
                    // Show the alert with success message and redirect callback
                    showAlert("Registration Successful!", () => {
                        window.location.href = 'index.html'; // Redirect after user clicks OK
                    });
                } else {
                    showAlert(data.message); // Show the error message if registration fails
                }
            } catch (error) {
                showAlert('Error registering user');
                console.error(error);
            }
        });
    }

    // Login Form Handling
    const loginForm = document.getElementById('login');
    const emailInput = document.getElementById('email');
    const emailList = document.getElementById('email-list');

     if (loginForm) {
        // Check if there are any stored emails and populate the datalist
        const storedEmails = JSON.parse(localStorage.getItem('emails')) || [];
        storedEmails.forEach(email => {
            const option = document.createElement('option');
            option.value = email;
            emailList.appendChild(option);
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            try {
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log("Login successful. Token:", data.token);
                    localStorage.setItem('token', data.token);

                    // Handle Remember me for email only
                    if (remember) {
                        // Store email in localStorage
                        let storedEmails = JSON.parse(localStorage.getItem('emails')) || [];
                        if (!storedEmails.includes(email)) {
                            storedEmails.push(email);
                            localStorage.setItem('emails', JSON.stringify(storedEmails));
                        }
                    }

                    // Show success alert and redirect
                    showAlert("Login Successful!", () => {
                        window.location.href = 'index.html';
                    });
                } else {
                    // Show error alert for invalid login
                    showAlert("Invalid username or password", () => {
                        document.getElementById('email').value = "";  // Clear email field
                        document.getElementById('password').value = "";  // Clear password field
                    });
                }
            } catch (error) {
                showAlert('Error logging in. Please try again.');
                console.error("Login error:", error);
            }
        });
    }
});

function showAlert(message, callback) {
    const alertBox = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    const alertOkButton = document.getElementById('alert-ok');

    // Dynamically set the message
    alertMessage.textContent = message;

    alertBox.style.display = 'flex'; // Show the alert box

    alertOkButton.onclick = function() {
        alertBox.style.display = 'none'; // Close the alert when OK is clicked
        if(callback && typeof callback === 'function') {
            callback();
        }
    };
}