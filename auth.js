// Authentication Management

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return false;
    }

    // Display current user
    const currentUser = localStorage.getItem('currentUser') || 'User';
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        userDisplay.textContent = `👤 ${currentUser}`;
    }

    return true;
}

// Handle logout - globally accessible
window.handleLogout = function () {
    if (confirm('Yakin ingin logout?')) {
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Check auth on page load
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
