
document.addEventListener("DOMContentLoaded", async () => {
    //console.log("DOM fully loaded and parsed.");

    // Load header dynamically
    await loadHeader();
    //await loadAlertScript();
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
        //console.error("Error loading header:", error);
    }
}

function loadHeaderCSS() {
    if(!document.querySelector('link[href="header.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "header.css";
        document.head.appendChild(link);
        //console.log("Header CSS Loaded");
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

/*function loadAlertScript() {
    const script = document.createElement("script");
    script.src = "alert.js";
    script.defer = true;
    document.body.appendChild(script);
}*/

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

/*const logoutUser = () =>{
    const confirmlogout = confirm ("Are you sure you want to logout?");
    if(confirmlogout){
        localStorage.removeItem('token');
        window.location.href = "login.html";
    }
};
document.getElementById('logout-btn').addEventListener('click', logoutUser);*/

let allData = []; // Store fetched data globally for search functionality

        // Fetch data from the API
        const req = new XMLHttpRequest();
        req.open("GET", "/api/expenses", true);
        req.send();

        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) {
                const response = JSON.parse(req.responseText);
                if (response.success) {
                    allData = response.data; // Store data globally
                    displayData(allData); // Display all data initially
                } else {
                    document.querySelector("tbody").innerHTML = '<tr><td colspan="4">Error fetching data</td></tr>';
                }
            }
        };
        
        // Function to display data in the table
        function displayData(data) {
            const tbody = document.querySelector("tbody");
            tbody.innerHTML = ""; // Clear the table body
            if (data.length > 0) {
                data.forEach((item, index) => {
                    const row = document.createElement("tr");
                    row.setAttribute('data-id', item._id);
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${item.appliances}</td>
                        <td>${item.options}</td>
                        <td>${item.expense}</td>
                        <td>${item.debit}</td>
                        <td>${new Date(item.date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}</td>
                        <td class="action-buttons">
                        <button class="edit-button">Edit</button>
                        <button class="delete-button">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="4">No data found</td></tr>';
            }
        }

        // Add event listener to the Search button
        document.getElementById("search-button").addEventListener("click", function () {
            const query = document.getElementById("search-input").value.toLowerCase();
            const filteredData = allData.filter(item => {
                const appliances = item.appliances.toLowerCase();
                const options = item.options.toLowerCase();
                const expense = item.expense.toString().toLowerCase();
                const date = new Date(item.date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                }).toLowerCase();
                return (
                appliances.includes(query) ||
                options.includes(query) ||
                expense.includes(query) || 
                date.includes(query)
                );
            });
            displayData(filteredData);
        });


const fetchData = (type = 'all', fromDate = '', toDate = '') => {
    let query = `?type=${type}`
    if(fromDate && toDate) {
        query += `&fromDate=${fromDate}&toDate=${toDate}`;
    }

    fetch(`/api/expenses${query}`)
    .then((response) => response.json())
    .then((data) => {
        const tbody = document.querySelector('#DataTableBody');
        const totalincomespan = document.getElementById('totalincome');
        const totalexpensespan = document.getElementById('totalexpense');
        const todayexpensespan = document.getElementById('todayexpense');

        let todayexpense = 0;
        let totalexpense = 0;
        let totalincome = 0;
        tbody.innerHTML = ''; 

        if (data.success && data.data.length > 0) {
            data.data.forEach((expense, index) => {
                const expenseDate = new Date(expense.date);
                const today = new Date();
                
                // Check if the expense is an "Expense" type and is from today
                if (expense.debit === 'Expense' && expenseDate.toLocaleDateString() === today.toLocaleDateString()) {
                    todayexpense += parseFloat(expense.expense);
                }

                // Calculate total income and expense (ignoring today's date for total)
                if (expense.debit === 'Income') {
                    totalincome += parseFloat(expense.expense);
                } else if (expense.debit === 'Expense') {
                    totalexpense += parseFloat(expense.expense);
                }

                const row = `
                    <tr data-id="${expense._id}">
                        <td>${index + 1}</td>
                        <td>${expense.appliances}</td>
                        <td>${expense.options}</td>
                        <td>${expense.expense}</td>
                        <td>${expense.debit}</td>
                        <td>${new Date(expense.date).toLocaleDateString()}</td>
                        <td class="action-buttons">
                            <button class="edit-button">Edit</button>
                            <button class="delete-button">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });

            // Display the results
            totalincomespan.textContent = totalincome.toFixed(2);
            totalexpensespan.textContent = totalexpense.toFixed(2);
            todayexpensespan.textContent = todayexpense.toFixed(2);
        } else {
            tbody.innerHTML = '<tr><td colspan="6">No data found</td></tr>';
            totalexpensespan.textContent = 0;
            totalincomespan.textContent = 0;
            todayexpensespan.textContent = 0;
        }
    })
    .catch((error) => console.error('Error:', error));
};

document.getElementById('searchButton').addEventListener('click', () => {
    const type = document.getElementById('transaction-type').value;
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    fetchData(type, fromDate, toDate);
});

document.getElementById('todayButton').addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    fetchData ('all', today, today);
});

   /* if (fromDate && toDate) {
        fetchData(type, fromDate, toDate); 
    } else {
        showAlert('Please select both "From" and "To" dates!');
    }
});*/

fetchData();

const fetchAndDisplayPendingAmount = () =>{
    fetch ('/api/expense')
    .then((response) => response.json())
    .then((data) => {
        //console.log('API Response:', data);

        if(data.success && data.data) {
            const pendingAmount = data.data.pendingAmount ?? 0;
            const pendingspan = document.getElementById('pendingAmount');
            pendingspan.textContent = pendingAmount.toFixed(2); 
        }else {
            console.error('Error fetching pending amount:', data.message);
        }
    })
    .catch((error) => console.error('Error', error));
};
fetchAndDisplayPendingAmount(); 

document.querySelector('tbody').addEventListener('click', function(event) {
    if(event.target.classList.contains('delete-button')){
        const row = event.target.closest('tr');
        const itemId = row.getAttribute('data-id');
        console.log('item ID:', itemId);

        if(itemId) {
            showConfirm("Are you sure you want to delete this row?", (response) => {
                if(response) {
                    deleteDataFromAPI(itemId, row);
                } else {
                    console.log('user canceled.');
                }
            });
        }else {
            console.error('Data Id not found for deletion');
        }
    }
    });

function deleteDataFromAPI(itemId, row) {
    console.log(itemId);
    console.log(`Attempting to delete item with Id: ${itemId}`);
    fetch(`/api/expenses/${itemId}`, {
        method: `DELETE`
    })
    .then(response => {
        console.log(`Response status: ${response.status}`);
        if(response.ok) {
            console.log(`item with Id ${itemId} deleted successfully.`);
            location.reload();
            
        }else {
        console.error('Failed to delete item on the server.');    
        }
    })
    .catch (error =>{
      console.error('Fetch error:', error);  
    });
}

let currentItemId = null; // Store the ID of the item being edited

// Event listener for the Edit button
document.querySelector('tbody').addEventListener('click', function(event) {
    if (event.target.classList.contains('edit-button')) {
        const row = event.target.closest('tr');
        const itemId = row.getAttribute('data-id'); 
         if (!itemId) return console.error('Data Id not found for edit');
        // Fetch the current data from the server or use the row data
        fetch(`/api/expenses/${itemId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Fill the form with the current data
                    const item = data.data;
                    document.getElementById('edit-appliances').value = item.appliances;
                    document.getElementById('edit-options').value = item.options;
                    document.getElementById('edit-expense').value = item.expense;
                    document.getElementById('edit-debit').value = item.debit;
                    document.getElementById('edit-date').value = new Date(item.date).toISOString().split('T')[0];

                    //togglePopup();
                    
                    // Show the form and store the item ID
                    currentItemId = itemId;
                    document.getElementById('edit-form').style.display = 'block';
                }
            })
            .catch(error => console.error('Error fetching item data:', error));
    }
});

// Event listener for saving changes
document.getElementById('save-changes-button').addEventListener('click', function() {
    const appliances = document.getElementById('edit-appliances').value;
    const options = document.getElementById('edit-options').value;
    const expense = document.getElementById('edit-expense').value;
    const debit = document.getElementById('edit-debit').value;
    const date = document.getElementById('edit-date').value;

    // Prepare the updated data
    const updatedData = {
        appliances,
        options,
        expense,
        debit,
        date,
    };

    // Send the updated data to the server
    fetch(`/api/expenses/${currentItemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the row in the table
            const row = document.querySelector(`tr[data-id="${currentItemId}"]`);
            row.cells[1].textContent = appliances;
            row.cells[2].textContent = options;
            row.cells[3].textContent = expense;
            row.cells[4].textContent = debit;
            row.cells[5].textContent = new Date(date).toLocaleDateString();

            // Hide the edit form and reset the form fields
            document.getElementById('edit-form').style.display = 'none';
            document.getElementById('edit-appliances').value = '';
            document.getElementById('edit-options').value = '';
            document.getElementById('edit-expense').value = '';
            document.getElementById('edit-debit').value = '';
            document.getElementById('edit-date').value = '';
        } else {
            showAlert('Failed to update item.');
        }
    })
    .catch(error => console.error('Error updating item:', error));
});
function togglePopup() {
    const overlay = document.getElementById('edit-form');
    //popup.style.display = popup.style.display === 'block'? 'none' :'block';
    overlay.classList.toggle('show');
}

//Event listener for canceling the edit
document.getElementById('cancel-edit-button').addEventListener('click', function() {
    document.getElementById('edit-form').style.display = 'none';
    document.getElementById('edit-appliances').value = '';
    document.getElementById('edit-options').value = '';
    document.getElementById('edit-expense').value = '';
    document.getElementById('edit-debit').value = '';
    document.getElementById('edit-date').value = '';
}); 
// Custom confirmation wrapper
function showConfirm(message, callback) {
    const result = confirm(message); // uses the browser's built-in confirm dialog
    callback(result);
}
