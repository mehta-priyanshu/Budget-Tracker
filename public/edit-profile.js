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

async function fetchUserData() {
    try {
        const token = localStorage.getItem("token");  // Ensure token is retrieved
        if (!token) {
            showAlert('Please login first');
            window.location.href ='login.html';
            return;
        }

        const response = await fetch("http://localhost:5000/get-user", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            if(response.status === 401) {
                showAlert("Session Expired. Please login again.");
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json(); // Ensure response.json() is only called if valid
        //console.log(data); // Debugging: Check if the user data is fetched properly

        // Populate the form fields with fetched user data
        document.getElementById("name").value = data.name;
        document.getElementById("email").value = data.email;
        //document.getElementById('password').value = data.password;

    } catch (err) {  // Use `err` here to handle the error properly
        console.error("Error fetching user data:", err);
        showAlert("Failed to fetch user data. Please try again.");
    }
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", fetchUserData);

document.getElementById('edit-profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/update-user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        showAlert("Profile updated successfully!");
        
        window.location.href = "/login.html"; 

    } catch (error) {
        console.error("Error in edit-profile.js:", error);
        showAlert(error.message);
    }
});


document.getElementById('cancel-btn').addEventListener('click', () => {
    window.location.href = 'index.html'
})

