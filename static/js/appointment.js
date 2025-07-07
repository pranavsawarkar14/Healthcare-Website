document.addEventListener('DOMContentLoaded', function() {
    const appointmentsList = document.getElementById('appointments-list');

    function displayAppointments() {
        // Fetch appointments from localStorage
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

        // Clear the current list
        appointmentsList.innerHTML = '';

        // Display each appointment
        appointments.forEach((appointment, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>Appointment ${index + 1}:</strong><br>
                Name: ${appointment.firstName} ${appointment.lastName}<br>
                Address: ${appointment.address}<br>
                Phone: ${appointment.phone}<br>
                Email: ${appointment.email || 'N/A'}<br>
                Date: ${appointment.date || 'N/A'}
            `;
            appointmentsList.appendChild(listItem);
        });

        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<li>No appointments booked yet.</li>';
        }
    }

    // Initial display of appointments
    displayAppointments();

    // Refresh appointments every 30 seconds
    setInterval(displayAppointments, 30000);
});