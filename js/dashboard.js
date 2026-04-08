/**
 * Dashboard Script
 * Handles recent bookings, trips, and user dashboard functionality
 */

console.log('Dashboard.js loaded');

// Load recent trips and display in dashboard
async function loadRecentTrips() {
    console.log('loadRecentTrips() called');
    try {
        const token = localStorage.getItem('authToken');
        console.log('Token exists:', !!token);

        if (!token) {
            console.log('No token, showing local trips');
            showLocalTrips();
            return;
        }

        console.log('Fetching trips from backend...');
        const response = await fetch('/api/trips?limit=5', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            const result = await response.json();
            console.log('Trips received:', result.data);
            displayTrips(result.data);
        } else {
            console.log('Backend response not ok, showing local trips');
            showLocalTrips();
        }
    } catch (error) {
        console.error('Error loading trips (full error):', error);
        showLocalTrips();
    }
}

function displayTrips(trips) {
    console.log('displayTrips called with', trips.length, 'trips');
    const bookingsList = document.getElementById('bookingsList');
    console.log('bookingsList element:', bookingsList);

    if (!bookingsList) {
        console.error('bookingsList element not found!');
        return;
    }

    if (trips.length === 0) {
        console.log('No trips, showing empty state');
        bookingsList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No trips planned yet. <a href="features/trip-planner.html">Plan your first trip!</a></p>';
        return;
    }

    console.log('Rendering', trips.length, 'trips');
    bookingsList.innerHTML = trips.map(trip => `
        <div class="booking-item" onclick="viewTripItinerary('${trip._id}')">
            <div class="booking-icon">
                <i class="fas fa-map-marked-alt"></i>
            </div>
            <div class="booking-details">
                <div class="booking-title">${trip.title}</div>
                <div class="booking-info">
                    <span><i class="fas fa-calendar"></i> ${new Date(trip.duration.startDate).toLocaleDateString()}</span>
                    <span><i class="fas fa-users"></i> ${trip.groupSize.adults} adults</span>
                </div>
                <div class="booking-status" style="color: ${getStatusColor(trip.status)}; font-size: 0.8rem; margin-top: 6px;">
                    ${capitalizeFirstLetter(trip.status)} • ${trip.duration.days} days
                </div>
            </div>
        </div>
    `).join('');
}

function showLocalTrips() {
    console.log('showLocalTrips called');
    const lastTrip = localStorage.getItem('lastTripPlan');
    console.log('lastTripPlan from localStorage:', !!lastTrip);

    if (!lastTrip) {
        const bookingsList = document.getElementById('bookingsList');
        if (bookingsList) {
            bookingsList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No trips planned yet. <a href="features/trip-planner.html">Plan your first trip!</a></p>';
        }
        return;
    }

    const trip = JSON.parse(lastTrip);
    console.log('Local trip data:', trip);

    const bookingsList = document.getElementById('bookingsList');
    if (!bookingsList) {
        console.error('bookingsList element not found!');
        return;
    }

    bookingsList.innerHTML = `
        <div class="booking-item" onclick="showLocalTripItinerary()">
            <div class="booking-icon">
                <i class="fas fa-map-marked-alt"></i>
            </div>
            <div class="booking-details">
                <div class="booking-title">${trip.duration.days} Days - Boisar Adventure</div>
                <div class="booking-info">
                    <span><i class="fas fa-calendar"></i> ${new Date(trip.duration.startDate).toLocaleDateString()}</span>
                    <span><i class="fas fa-users"></i> ${trip.groupSize.adults} adults</span>
                </div>
                <div class="booking-status" style="color: #f39c12; font-size: 0.8rem; margin-top: 6px;">
                    Draft • ${trip.duration.days} days
                </div>
            </div>
        </div>
    `;
}

async function viewTripItinerary(tripId) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Please login to view itinerary');
            return;
        }

        const response = await fetch(`/api/trips/${tripId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            displayItineraryModal(result.data);
        } else {
            alert('Could not load itinerary');
        }
    } catch (error) {
        console.error('Error loading itinerary:', error);
        alert('Error loading itinerary');
    }
}

function showLocalTripItinerary() {
    const lastTrip = localStorage.getItem('lastTripPlan');
    if (lastTrip) {
        const trip = JSON.parse(lastTrip);
        displayLocalItineraryModal(trip);
    }
}

function displayItineraryModal(trip) {
    const modal = document.createElement('div');
    modal.className = 'itinerary-modal';
    modal.innerHTML = `
        <div class="itinerary-modal-content">
            <div class="itinerary-modal-header">
                <h2>${trip.title}</h2>
                <button onclick="this.closest('.itinerary-modal').remove()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="itinerary-modal-body">
                <div class="trip-summary">
                    <p><strong>Duration:</strong> ${trip.duration.days} days (${new Date(trip.duration.startDate).toLocaleDateString()} - ${new Date(trip.duration.endDate).toLocaleDateString()})</p>
                    <p><strong>Travelers:</strong> ${trip.groupSize.adults} adults${trip.groupSize.children > 0 ? `, ${trip.groupSize.children} children` : ''}</p>
                    <p><strong>Budget:</strong> ${capitalizeFirstLetter(trip.budget)}</p>
                    <p><strong>Interests:</strong> ${trip.interests.join(', ')}</p>
                </div>
                ${trip.itinerary && trip.itinerary.length > 0 ? `
                    <div class="itinerary-details">
                        <h4>Day-by-Day Itinerary</h4>
                        ${trip.itinerary.map((day, idx) => `
                            <div class="itinerary-day">
                                <h5>📅 Day ${day.day}</h5>
                                ${day.activities && day.activities.length > 0 ? `
                                    <div class="day-activities">
                                        ${day.activities.map(act => `
                                            <p>• <strong>${act.time || 'Scheduled'}</strong>: ${act.activity} @ ${act.location}</p>
                                        `).join('')}
                                    </div>
                                ` : '<p style="color: #999; font-size: 0.9rem;">Rest day / Free time</p>'}
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: #999;">No itinerary details yet</p>'}
            </div>
            <div class="itinerary-modal-footer">
                <button onclick="downloadItinerary('${trip._id}')" class="btn-primary">
                    <i class="fas fa-download"></i> Download
                </button>
                <button onclick="shareTrip('${trip._id}')" class="btn-secondary">
                    <i class="fas fa-share"></i> Share
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    modal.querySelector('.itinerary-modal-content').style.cssText = 'background: white; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;';
}

function displayLocalItineraryModal(trip) {
    const modal = document.createElement('div');
    modal.className = 'itinerary-modal';
    modal.innerHTML = `
        <div class="itinerary-modal-content">
            <div class="itinerary-modal-header">
                <h2>${trip.duration} Days - Boisar Adventure</h2>
                <button onclick="this.closest('.itinerary-modal').remove()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="itinerary-modal-body">
                <div class="trip-summary">
                    <p><strong>Date:</strong> ${new Date(trip.date).toLocaleDateString()}</p>
                    <p><strong>Duration:</strong> ${trip.duration} days</p>
                    <p><strong>Travelers:</strong> ${trip.groupSize} people</p>
                    <p><strong>Budget:</strong> ${capitalizeFirstLetter(trip.budget)}</p>
                    <p><strong>Pace:</strong> ${capitalizeFirstLetter(trip.pace)}</p>
                    <p><strong>Interests:</strong> ${trip.interests.join(', ')}</p>
                </div>
                <p style="color: #f39c12; font-size: 0.9rem; margin-top: 16px;"><i class="fas fa-info-circle"></i> This is a local draft. Sign in to save it to your account.</p>
            </div>
            <div class="itinerary-modal-footer">
                <a href="features/trip-planner.html" class="btn-primary">Edit Itinerary</a>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    modal.querySelector('.itinerary-modal-content').style.cssText = 'background: white; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;';
}

function downloadItinerary(tripId) {
    alert('Download feature coming soon!');
}

function shareTrip(tripId) {
    alert('Share feature coming soon!');
}

function getStatusColor(status) {
    const colors = {
        'draft': '#f39c12',
        'planned': '#3498db',
        'booked': '#27ae60',
        'ongoing': '#e74c3c',
        'completed': '#95a5a6',
        'cancelled': '#c0392b'
    };
    return colors[status] || '#7f8c8d';
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Load trips when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    loadRecentTrips();
});

// Reload trips every 10 seconds
setInterval(loadRecentTrips, 10000);

// Also reload when user returns to page
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        console.log('Page became visible, reloading trips');
        loadRecentTrips();
    }
});
