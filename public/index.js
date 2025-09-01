document.addEventListener("DOMContentLoaded", async () => {
    //console.log("DOM fully loaded and parsed.");

    // Load header dynamically
    await loadHeader();

});

// Function to load the header dynamically
async function loadHeader() {
    try {
        const response = await fetch("header.html");
        const data = await response.text();
        document.getElementById("header-container").innerHTML = data;

        //console.log("Header loaded successfully.");

        loadHeaderCSS();

        // Load header.js script dynamically AFTER the header is inserted
        loadHeaderScript();
    } catch (error) {
        console.error("Error loading header:", error);
    }
}

function loadHeaderCSS() {
    if(!document.querySelector('link[href="header.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "header.css";
        document.head.appendChild(link);
        console.log("Header CSS Loaded");
    }
}

// Function to load header.js dynamically
function loadHeaderScript() {
    const script = document.createElement("script");
    script.src = "header.js";
    script.defer = true;
    script.onload = () => {
        //console.log("Header script loaded.");
        attachHeaderEventListeners(); // Ensure listeners attach after script loads
    };
    document.body.appendChild(script);
}

const tokn = localStorage.getItem('token');
        if(tokn) {
            //console.log('User is logged in');
        } else{
            console.log('User is not logged in');
            window.location.href ='login.html;'
        }

        async function loadUsers() {
             try {
                const response = await fetch('/get-users');
                const data = await response.json();

                const selectElement = document.getElementById('options');
                selectElement.innerHTML = '<option value="">Select User</option>'; 

                if (response.ok) {
                    data.forEach(user => {
                        const option = document.createElement('option');
                        option.textContent = user.name; 
                        option.value = user.name; 
                        selectElement.appendChild(option);
                    });
                } else {
                    console.error("Error:", data.message);
                }
            } catch (error) {
                console.error("Error loading users:", error);
            }
        }

        // Run function when page loads
        document.addEventListener('DOMContentLoaded', loadUsers);

        function isTokenExpired(token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
                const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
                return payload.exp < currentTime; // Check if expired
            } catch (error) {
                return true; // If token is invalid, treat as expired
            }
        }

        const token = localStorage.getItem('token');

        if (!token || isTokenExpired(token)) {
            console.log("Token missing or expired. Redirecting to login page...");
            localStorage.removeItem('token'); // Clear invalid token
            window.location.href = "login.html"; // Redirect to login page
        } else {
            //console.log("Token is valid. User allowed to access index.html.");
        }    
        
            //Going to login page when click logout button
            /*const logoutUser = () =>{
                const confirmLogout = confirm ("Are you sure you want to Logout?");
                if(confirmLogout) {
                    localStorage.removeItem('token');
                    window.location.href = "login.html";
                }
            };
            document.getElementById('logout-btn').addEventListener('click', logoutUser);*/

            document.getElementById('expense-form').addEventListener('submit', async (event) => {
                event.preventDefault();

                const appliances = document.getElementById('appliances').value;
                const expense = document.getElementById('expense').value;
                const debit = document.querySelector('input[name="debit"]:checked')?.value;
                const options = document.getElementById('options').value;

                if (!appliances || !expense || !debit ||!options ) {
                    showAlert("All fields are required.");
                    return;
                }
                try {
                const response = await fetch('/add-expense', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ appliances, expense, debit, options }),
                });

                const data = await response.json();
                showAlert(data.message);

                if(response.ok) {
                    document.getElementById('expense-form').reset();
                   // showAlert("Successfully Added!");
                    window.location.href = 'expenses.html';
                }else {
                    showAlert(data.message || "Failed to add expense!");
                }
            }catch {
                showAlert("Error adding expense!")
                console.error('error');
            }
        });