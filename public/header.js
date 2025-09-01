
function attachHeaderEventListeners() {
    //console.log("Attaching header event listeners...");

    // Delay execution slightly to ensure header elements exist
    setTimeout(() => {
        const profileImg = document.getElementById("profile-img");
        const profileMenu = document.getElementById("profile-menu");
        const themeToggle = document.getElementById("theme-toggle");
        const logoutBtn = document.getElementById("logout-btn");
        const darkIcon = document.getElementById("dark-icon");
        const lightIcon = document.getElementById("light-icon");

        if (!profileImg || !profileMenu || !themeToggle || !logoutBtn) {
            console.error("Header elements not found! Retrying in 100ms...");
            setTimeout(attachHeaderEventListeners, 100);
            return;
        }

        //console.log("Header elements found. Adding event listeners.");

        // Toggle profile menu
        profileImg.addEventListener("click", () => {
            profileMenu.classList.toggle("show");
        });

        // Toggle dark/light 
        const savedtheme = localStorage.getItem("theme");

        if(savedtheme === "dark") {
            document.body.classList.add("dark-theme");
            darkIcon.style.display = "inline";
            lightIcon.style.display = "none";
        } else {
            document.body.classList.remove("dark-theme");
            darkIcon.style.display = "none";
            lightIcon.style.display = "inline";
        }
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");

            const isDark = document.body.classList.contains("dark-theme");
            if(isDark) {
                localStorage.setItem("theme", "dark");
                darkIcon.style.display = "inline";
                lightIcon.style.display = "none";
            } else {
                localStorage.setItem("theme", "light");
                darkIcon.style.display = "none";
                lightIcon.style.display = "inline";
            }
        });

        // Logout event
        logoutBtn.addEventListener("click", () => {
            showConfirm('Are you sure you want to logout?', (response) =>{
                if(response) {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                } else {
                    
                }
            });
        });

        // Close profile menu when clicking outside
        document.addEventListener("click", (event) => {
            if (!profileImg.contains(event.target) && !profileMenu.contains(event.target)) {
                profileMenu.classList.remove("show");
            }
        });

        //console.log("Header event listeners attached successfully.");
    }, 500); // Small delay ensures header loads first
}

// Function to show custom alert with dynamic message
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

// Function to show custom confirm dialog with a callback
function showConfirm(message, callback) {
    const confirmBox = document.getElementById('custom-confirm');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmOkButton = document.getElementById('confirm-ok');
    const confirmCancelButton = document.getElementById('confirm-cancel');

    confirmMessage.textContent = message;

    confirmBox.style.display = 'flex'; // Show the confirm box

    // Handling OK button click
    confirmOkButton.onclick = function() {
        callback(true); // User clicked OK
        confirmBox.style.display = 'none'; // Hide confirm box
    };

    // Handling Cancel button click
    confirmCancelButton.onclick = function() {
        callback(false); // User clicked Cancel
        confirmBox.style.display = 'none'; // Hide confirm box
    };
}

// Optionally, show the custom alert or confirm wherever needed
// Example: showAlert('This is a custom alert!');
// Example: showConfirm('Are you sure?', (response) => { console.log(response); });
