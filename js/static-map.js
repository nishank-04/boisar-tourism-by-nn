// Static Map with Clickable Destinations for Boisar Tourism
class StaticMap {
    constructor() {
        this.destinations = [
            {
                name: "Kelva Beach",
                position: { x: 45, y: 35 },
                type: "beach",
                description: "Beautiful beach with black sand, coconut trees, and peaceful environment.",
                image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.6,
                activities: ["Beach Walk", "Photography", "Relaxation"]
            },
            {
                name: "Kaldurg Fort",
                position: { x: 60, y: 45 },
                type: "heritage",
                description: "Popular trekking destination offering breathtaking views, especially during monsoon.",
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.5,
                activities: ["Trekking", "Scenic Views", "Photography"]
            },
            {
                name: "Dabhosa Waterfall",
                position: { x: 55, y: 50 },
                type: "nature",
                description: "Stunning waterfall near Jawhar, surrounded by dense forest and ideal for nature lovers.",
                image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.7,
                activities: ["Water Activities", "Photography", "Nature Walk"]
            },
            {
                name: "Kohoj Hill",
                position: { x: 50, y: 40 },
                type: "eco-tourism",
                description: "Scenic trekking spot with lush greenery and panoramic views, perfect for adventure seekers.",
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.4,
                activities: ["Trekking", "Nature Walks", "Picnic"]
            },
            {
                name: "Dahanu Beach",
                position: { x: 40, y: 30 },
                type: "beach",
                description: "Clean and peaceful beach famous for chikoo orchards and relaxing coastal vibes.",
                image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.5,
                activities: ["Beach Activities", "Photography", "Relaxation"]
            },
            {
                name: "Tarapur Fort",
                position: { x: 35, y: 25 },
                type: "heritage",
                description: "Historic seaside fort offering scenic ocean views and glimpses into the region's past.",
                image: "https://images.unsplash.com/photo-1519451241446-6641405a8c0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.6,
                activities: ["Heritage Tour", "Photography", "Scenic Views"]
            }
        ];
    }

    initStaticMap() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        mapContainer.innerHTML = `
            <div class="static-map-container">
                <div class="map-header">
                    <h3>Boísar Tourist Destinations</h3>
                    <p>Click on the markers to explore destinations</p>
                </div>
                <div class="static-map">
                    <div class="map-background">
                        <svg viewBox="0 0 100 80" class="boisar-map">
                            <!-- Simplified Boísar coastal outline -->
                            <path d="M20 10 L80 10 L85 20 L80 30 L75 40 L70 50 L65 60 L60 65 L50 70 L40 65 L30 60 L25 50 L20 40 L15 30 L10 20 Z"
                                  fill="#e8f5e8" stroke="#2d5a27" stroke-width="0.5"/>
                            
                            <!-- Destination markers -->
                            ${this.destinations.map((dest, index) => `
                                <circle cx="${dest.position.x}" cy="${dest.position.y}" r="2" 
                                        class="destination-marker ${dest.type}" 
                                        data-destination="${index}"
                                        title="${dest.name}">
                                    <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite"/>
                                </circle>
                            `).join('')}
                        </svg>
                    </div>
                </div>
                <div class="destination-info" id="destinationInfo" style="display: none;">
                    <div class="info-content">
                        <button class="close-info" onclick="closeDestinationInfo()">×</button>
                        <div class="info-header">
                            <h4 id="infoName"></h4>
                            <div class="rating" id="infoRating"></div>
                        </div>
                        <div class="info-image">
                            <img id="infoImage" src="" alt="">
                        </div>
                        <div class="info-description">
                            <p id="infoDescription"></p>
                        </div>
                        <div class="info-activities">
                            <h5>Activities:</h5>
                            <div class="activity-tags" id="infoActivities"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add click event listeners to markers
        this.destinations.forEach((dest, index) => {
            const marker = mapContainer.querySelector(`[data-destination="${index}"]`);
            if (marker) {
                marker.addEventListener('click', () => this.showDestinationInfo(dest));
            }
        });
    }

    showDestinationInfo(destination) {
        const infoDiv = document.getElementById('destinationInfo');
        if (!infoDiv) return;

        document.getElementById('infoName').textContent = destination.name;
        document.getElementById('infoRating').innerHTML = 
            `${'★'.repeat(Math.floor(destination.rating))}${'☆'.repeat(5-Math.floor(destination.rating))} ${destination.rating}`;
        document.getElementById('infoImage').src = destination.image;
        document.getElementById('infoImage').alt = destination.name;
        document.getElementById('infoDescription').textContent = destination.description;
        
        const activitiesDiv = document.getElementById('infoActivities');
        activitiesDiv.innerHTML = destination.activities.map(activity => 
            `<span class="activity-tag">${activity}</span>`
        ).join('');

        infoDiv.style.display = 'block';
    }
}

// Global functions
let staticMap;

function initStaticMap() {
    staticMap = new StaticMap();
    staticMap.initStaticMap();
}

function closeDestinationInfo() {
    const infoDiv = document.getElementById('destinationInfo');
    if (infoDiv) {
        infoDiv.style.display = 'none';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initStaticMap();
});

