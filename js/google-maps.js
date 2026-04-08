// Google Maps Integration for Boisar Tourism
class BoisarTourismMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.infoWindow = null;
        this.placesService = null;
        this.destinations = [
            {
                name: "Kelva Beach",
                position: { lat: 19.611587714724607, lng: 72.72995772883563 },
                type: "beach",
                description: "Beautiful and serene beach known for its black sand, coconut trees, and peaceful environment.",
                image: "https://www.mumbailive.com/images/media/images/kelva_beach_1646311055467jpeg?bg=9eb4c9&crop=801.5625%2C450%2Cnull%2C0&fit=crop&fitToScale=h%2C1368%2C768&fm=webp&h=432.2807017543859&height=450&w=770&width=850",
                rating: 4.6,
                activities: ["Beach Walk", "Photography", "Relaxation"]
            },
            {
                name: "Kaldurg Fort",
                position: { lat: 19.694531781043086, lng: 72.81742135159378 },
                type: "heritage",
                description: "A popular trekking destination offering breathtaking views, especially during the monsoon season.",
                image: "https://ik.imagekit.io/lb4u/wp-content/uploads/2021/06/2020110417.jpg",
                rating: 4.5,
                activities: ["Trekking", "Scenic Views", "Photography"]
            },
            {
                name: "Dabhosa Waterfall",
                position: { lat: 20.00469223089058, lng: 73.20810890000001 },
                type: "nature",
                description: "A stunning waterfall near Jawhar, surrounded by dense forest and ideal for nature lovers.",
                image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/5a/47/a4/dabhosa-waterfall.jpg?w=900&h=500&s=1",
                rating: 4.7,
                activities: ["Water Activities", "Photography", "Nature Walk"]
            },
            {
                name: "Kohoj Hill",
                position: { lat: 19.670621293393992, lng: 72.98893181534257 },
                type: "eco-tourism",
                description: "A scenic trekking spot with lush greenery and panoramic views, perfect for adventure seekers.",
                image: "https://www.owletoutdoors.in/images/uploaded_images/Kohoj%2001.jpg",
                rating: 4.4,
                activities: ["Trekking", "Nature Walks", "Picnic"]
            },
            {
                name: "Dahanu Beach",
                position: { lat: 19.991570919914874, lng: 72.7223948632197 },
                type: "beach",
                description: "A clean and peaceful beach famous for chikoo orchards and relaxing coastal vibes.",
                image: "https://www.mtdc.co.in/wp-content/uploads/2019/12/Dahanu_Beach.jpg",
                rating: 4.5,
                activities: ["Beach Activities", "Photography", "Relaxation"]
            },
            {
                name: "Tarapur Fort",
                position: { lat: 19.863847283834907, lng: 72.68201418465745 },
                type: "heritage",
                description: "A historic seaside fort offering scenic ocean views and a glimpse into the region's past.",
                image: "https://cdn.s3waas.gov.in/s3a9a1d5317a33ae8cef33961c34144f84/uploads/bfi_thumb/2020110312-oxv8q8u8w786fzbt8sulrwaaipk97ip3uo21m54m8a.jpg",
                rating: 4.6,
                activities: ["Heritage Tour", "Photography", "Scenic Views"]
            },
            {
                name: "Gholvad Beach",
                position: { lat: 20.092411431745898, lng: 72.72872644308462 },
                type: "beach",
                description: "A serene and uncrowded beach with pristine shoreline, perfect for swimming and water activities.",
                image: "https://content3.jdmagicbox.com/v2/comp/thane/a6/022pxx22.xx22.220317101900.f7a6/catalogue/gholvad-beach-gholvad-thane-tourist-attraction-l4amq8s8xs.jpg",
                rating: 4.5,
                activities: ["Swimming", "Photography", "Water Sports"]
            },
            {
                name: "Satpati Beach",
                position: { lat: 19.721495040404957, lng: 72.6999517 },
                type: "beach",
                description: "A beautiful coastal beach with fishing villages, offering authentic seaside village experience.",
                image: "https://images.jdmagicbox.com/v2/comp/palghar/w7/022pxx22.xx22.141218165203.f2w7/catalogue/satpati-beach-satpati-palghar-tourist-attraction-AcPZ8RV4ZF.jpg",
                rating: 4.3,
                activities: ["Village Tour", "Cultural Experience", "Photography"]
            },
            {
                name: "Shirgaon Beach",
                position: { lat: 19.696556462695384, lng: 72.7104809 },
                type: "beach",
                description: "A scenic beach near Shirgaon fort with beautiful coastal views and adventure opportunities.",
                image: "https://image-worker.mindtrip.ai/image-resize/format=webp,w=1200/https:/images.mindtrip.ai/attractions/4646/e34c/6162/115b/92ae/c0b5/7f98/1b76",
                rating: 4.4,
                activities: ["Beach Activities", "Trekking", "Photography"]
            },
            {
                name: "Arnala Beach",
                position: { lat: 19.45237768672278, lng: 72.7479625306851 },
                type: "beach",
                description: "A quiet beach with historical significance, known for its calm waters and beachside ruins.",
                image: "https://content.jdmagicbox.com/v2/comp/mumbai/i9/022pxx22.xx22.190719212028.z2i9/catalogue/arnala-beach-garden-arnala-palghar-parks-wsu8j6h8x5.jpg",
                rating: 4.2,
                activities: ["Historical Tour", "Photography", "Relaxation"]
            },
            {
                name: "Arnala Fort",
                position: { lat: 19.466082660172965, lng: 72.73224137116438 },
                type: "heritage",
                description: "An ancient coastal fort with Portuguese and Mughal history, offering panoramic sea views.",
                image: "https://cdn.s3waas.gov.in/s3a9a1d5317a33ae8cef33961c34144f84/uploads/bfi_thumb/2020102679-oxhagc9fwsgndmaxvaquvaw47ayxuzsdhjqh39ck96.jpg",
                rating: 4.3,
                activities: ["Fort Exploration", "Photography", "Historical Tour"]
            },
            {
                name: "Asherigad Fort",
                position: { lat: 19.82531672692034, lng: 72.92090657780638 },
                type: "heritage",
                description: "A hilltop fort with breathtaking views and historical significance in Palghar region.",
                image: "https://www.mtdc.co.in/wp-content/uploads/2013/08/asherigad-Fort-640x445.jpg",
                rating: 4.6,
                activities: ["Trekking", "Photography", "Historical Exploration"]
            },
            {
                name: "Tandulwadi Fort",
                position: { lat: 19.61824584963359, lng: 72.84183252883562 },
                type: "heritage",
                description: "A lesser-known hilltop fort surrounded by greenery and offering scenic monsoon views.",
                image: "https://ts-production.imgix.net/images/eaae7067-24fa-4749-aa43-52327e786d47.jpeg?auto=compress,format&w=800&h=450",
                rating: 4.4,
                activities: ["Monsoon Trekking", "Nature Walk", "Photography"]
            },
            {
                name: "Shirgaon Fort",
                position: { lat: 19.69644897282875, lng: 72.71350855582182 },
                type: "heritage",
                description: "A historic coastal fort with sea views, perfect for trekking and photography.",
                image: "https://static2.tripoto.com/media/filter/tst/img/1927440/TripDocument/1581281004_img20200105160406.jpg",
                rating: 4.5,
                activities: ["Fort Trek", "Photography", "Adventure"]
            },
            {
                name: "Bordi Beach",
                position: { lat: 20.100289117681776, lng: 72.7324811693149 },
                type: "beach",
                description: "A long sandy beach ideal for relaxation, with nearby resorts and recreational facilities.",
                image: "https://images.jdmagicbox.com/v2/comp/palghar/e8/022pxx22.xx22.141218143536.l3e8/catalogue/bordi-beach-bordi-palghar-tourist-attraction-98zxaw9o9r.jpg",
                rating: 4.4,
                activities: ["Water Sports", "Relaxation", "Resort Stay"]
            },
            {
                name: "Kalamb Beach",
                position: { lat: 19.403994678148575, lng: 72.76159626137022 },
                type: "beach",
                description: "A secluded beach with peaceful environment, far from crowds, perfect for nature lovers.",
                image: "https://marathi.cdn.zeenews.com/marathi/sites/default/files/2024/11/20/816407-kalamb-beach.jpg?im=FitAndFill=(1200,900)",
                rating: 4.3,
                activities: ["Beach Walk", "Nature Photography", "Meditation"]
            },
            {
                name: "Surya River Dam",
                position: { lat: 19.697647213505245, lng: 72.85093739744585 },
                type: "dam",
                description: "A scenic dam with water activities and peaceful riverside trails for nature enthusiasts.",
                image: "https://sceneloc8.com/wp-content/uploads/2024/04/4-49.png",
                rating: 4.2,
                activities: ["River Rafting", "Nature Walks", "Photography"]
            },
            {
                name: "Vaitarna Lake",
                position: { lat: 19.81854739331834, lng: 73.50855213673722 },
                type: "nature",
                description: "A peaceful lake surrounded by hills and forests, ideal for bird watching and nature photography.",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK8moFiuYBVP0XxCnlFFjqgJTpPEqqh7p7yw&s",
                rating: 4.4,
                activities: ["Bird Watching", "Photography", "Picnic"]
            },
            {
                name: "Jai Vilas Palace",
                position: { lat: 19.89977385557532, lng: 73.2266680558218 },
                type: "heritage",
                description: "A majestic palace in Jawhar showcasing royal architecture and surrounding gardens.",
                image: "https://www.trawell.in/admin/images/upload/016771431jai-vilas-palace.jpg",
                rating: 4.5,
                activities: ["Palace Tour", "Photography", "Garden Walk"]
            },
            {
                name: "Shirpamal Sunset Point",
                position: { lat: 19.92725087482257, lng: 73.2443456725193 },
                type: "viewpoint",
                description: "A stunning sunset viewpoint in Jawhar with panoramic views of the surrounding landscape.",
                image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0c/dc/6d/e3/shirpamal-jawhar.jpg?w=1200&h=-1&s=1",
                rating: 4.8,
                activities: ["Sunset Viewing", "Photography", "Romantic Evening"]
            },
            {
                name: "Hanuman Point",
                position: { lat: 19.903603651547346, lng: 73.23181391349308 },
                type: "spiritual",
                description: "A scenic viewpoint near a Hanuman temple offering panoramic views and spiritual experience.",
                image: "https://www.trawell.in/admin/images/upload/016771530hanuman-point.jpg",
                rating: 4.6,
                activities: ["Temple Visit", "Meditation", "Photography"]
            },
            {
                name: "Jai Sagar Dam",
                position: { lat: 19.928833907361565, lng: 73.22213972277905 },
                type: "eco-tourism",
                description: "A scenic dam in Jawhar surrounded by hills, perfect for bird watching and nature photography.",
                image: "https://www.trawell.in/admin/images/thumbs/01677170Khadkhad-dam_thumb.jpg",
                rating: 4.5,
                activities: ["Bird Watching", "Photography", "Nature Walk"]
            },
            {
                name: "Vajreshwari Temple",
                position: { lat: 19.487228456207113, lng: 73.02611801534256 },
                type: "spiritual",
                description: "An ancient temple dedicated to Goddess Vajreshwari, an important pilgrimage site in Palghar.",
                image: "https://mandirbook.com/uploads/temple/87/photo/crop/photo15362522460.jpeg",
                rating: 4.6,
                activities: ["Temple Darshan", "Meditation", "Spiritual Experience"]
            },
            {
                name: "Tansa Wildlife Sanctuary",
                position: { lat: 19.553241304116543, lng: 73.26085061647288 },
                type: "nature",
                description: "A rich wildlife sanctuary with diverse flora and fauna, ideal for nature and wildlife enthusiasts.",
                image: "https://sanctuarynaturefoundation.org/uploads/Article/1638532152814_Forest-around-Suryamal-Hill---photo-credit-Kedar-Gore_C-1920.jpg",
                rating: 4.7,
                activities: ["Wildlife Safari", "Bird Watching", "Photography"]
            },
            {
                name: "Dhekale Dam",
                position: { lat: 19.620773911714195, lng: 72.93999667301384 },
                type: "nature",
                description: "A scenic dam surrounded by greenery and hills, offering beautiful views and recreational activities.",
                image: "https://images.jdmagicbox.com/v2/comp/palghar/z3/022pxx22.xx22.221127034042.i9z3/catalogue/dhekale-dam-palghar-tourist-attraction-ri24340565.jpg",
                rating: 4.3,
                activities: ["Picnicking", "Boating", "Photography"]
            },
            {
                name: "Tandulwadi Waterfall",
                position: { lat: 19.615356414915404, lng: 72.84926021164361 },
                type: "nature",
                description: "A breathtaking seasonal waterfall near Tandulwadi fort surrounded by dense forests and rocky terrain.",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReO0fxwQQVWNQ7w0RVqKcNxey3eMULL7cI-g&s",
                rating: 4.5,
                activities: ["Trekking", "Photography", "Nature Walk"]
            },
            {
                name: "Kalmandavi Waterfall",
                position: { lat: 19.869962516834068, lng: 73.25382506942 },
                type: "nature",
                description: "A stunning hidden waterfall nestled in the Palghar hills, known for its pristine waters and lush green surroundings.",
                image: "https://media1.thrillophilia.com/filestore/x5b1zlmiuz92c6y2f9wmzsn0hlko_maxresdefault.jpg",
                rating: 4.6,
                activities: ["Swimming", "Photography", "Nature Walks"]
            },
        ];
    }

    // Initialize the map
    initMap() {
        // Center map on Boisar
        const boisarCenter = { lat: 19.75, lng: 72.8 };

        this.map = new google.maps.Map(document.getElementById("map"), {
            zoom: 10,
            center: boisarCenter,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                }
            ]
        });

        this.infoWindow = new google.maps.InfoWindow();
        // Initialize Places Service
        try {
            this.placesService = new google.maps.places.PlacesService(this.map);
            this.enrichDestinationsWithPhotos();
        } catch (e) {
            console.warn('[Maps] PlacesService not available or failed to initialize', e);
        }
        this.addDestinationMarkers();
        this.addMapControls();
    }

    // Add markers for all destinations
    addDestinationMarkers() {
        this.destinations.forEach((destination, index) => {
            const marker = new google.maps.Marker({
                position: destination.position,
                map: this.map,
                title: destination.name,
                icon: this.getMarkerIcon(destination.type),
                animation: google.maps.Animation.DROP
            });

            // Add click event listener
            marker.addListener("click", () => {
                this.showDestinationInfo(destination, marker);
            });

            this.markers.push(marker);
        });
    }

    // Find destination by name and open its info window
    focusDestinationByName(name) {
        const idx = this.destinations.findIndex(d => d.name === name);
        if (idx === -1) return;
        const dest = this.destinations[idx];
        const marker = this.markers[idx];
        if (!dest || !marker) return;
        this.map.setCenter(dest.position);
        this.map.setZoom(10);
        this.showDestinationInfo(dest, marker);
    }

    // Get marker icon based on destination type
    getMarkerIcon(type) {
        const icons = {
            "beach": {
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#00BCD4" stroke="#fff" stroke-width="2"/>
                        <path d="M16 8l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="#fff"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32)
            },
            "heritage": {
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#FF9800" stroke="#fff" stroke-width="2"/>
                        <path d="M16 6l2 4h4l-3 3 1 4-4-3-4 3 1-4-3-3h4z" fill="#fff"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32)
            },
            "nature": {
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#2196F3" stroke="#fff" stroke-width="2"/>
                        <path d="M16 8c-4 0-6 3-6 6s2 6 6 6 6-3 6-6-2-6-6-6z" fill="#fff"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32)
            },
            "eco-tourism": {
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#4CAF50" stroke="#fff" stroke-width="2"/>
                        <path d="M16 8l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="#fff"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32)
            }
        };
        return icons[type] || icons["eco-tourism"];
    }

    // Show destination information in info window
    showDestinationInfo(destination, marker) {
        const photoUrl = destination.photoUrl || destination.image;
        const content = `
            <div class="map-info-window">
                <div class="info-header">
                    <h3>${destination.name}</h3>
                    <div class="rating">
                        ${'★'.repeat(Math.floor(destination.rating))}${'☆'.repeat(5 - Math.floor(destination.rating))}
                        <span>${destination.rating}</span>
                    </div>
                </div>
                <div class="info-image">
                    <img src="${photoUrl}" alt="${destination.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">
                </div>
                <div class="info-content">
                    <p>${destination.description}</p>
                    <div class="activities">
                        <strong>Activities:</strong>
                        <div class="activity-tags">
                            ${destination.activities.map(activity => `<span class="activity-tag">${activity}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="info-actions">
                    <button class="btn-get-directions" onclick="getDirections('${destination.name}', ${destination.position.lat}, ${destination.position.lng})">
                        <i class="fas fa-directions"></i> Get Directions
                    </button>
                    <button class="btn-view-details" onclick="viewDestinationDetails('${destination.name}')">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        `;

        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
    }

    // Try to fetch Google Places photo for each destination
    enrichDestinationsWithPhotos() {
        if (!this.placesService) return;
        this.destinations.forEach((destination) => {
            const request = {
                query: destination.name,
                fields: ['photos', 'place_id', 'name', 'geometry'],
                locationBias: destination.position ? {
                    center: destination.position,
                    radius: 50000
                } : undefined
            };
            this.placesService.findPlaceFromQuery(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length) {
                    const place = results[0];
                    destination.placeId = place.place_id;
                    if (place.photos && place.photos.length) {
                        try {
                            const url = place.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
                            if (url) destination.photoUrl = url;
                        } catch (_) { }
                    }
                }
            });
        });
    }

    // Add map controls
    addMapControls() {
        // Add custom map controls
        const mapControls = document.createElement('div');
        mapControls.className = 'map-controls';
        mapControls.innerHTML = `
            <div class="control-group">
                <button class="control-btn" onclick="filterDestinations('all')" id="filter-all">
                    <i class="fas fa-globe"></i> All
                </button>
                <button class="control-btn" onclick="filterDestinations('beach')" id="filter-beach">
                    <i class="fas fa-umbrella-beach"></i> Beaches
                </button>
                <button class="control-btn" onclick="filterDestinations('heritage')" id="filter-heritage">
                    <i class="fas fa-landmark"></i> Heritage
                </button>
                <button class="control-btn" onclick="filterDestinations('nature')" id="filter-nature">
                    <i class="fas fa-water"></i> Waterfalls
                </button>
                <button class="control-btn" onclick="filterDestinations('eco-tourism')" id="filter-eco">
                    <i class="fas fa-tree"></i> Eco Tourism
                </button>
            </div>
        `;

        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapControls);
    }

    // Filter destinations by type
    filterDestinations(type) {
        // Update active filter button
        document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`filter-${type === 'all' ? 'all' : type}`).classList.add('active');

        // Show/hide markers based on filter
        this.markers.forEach((marker, index) => {
            const destination = this.destinations[index];
            if (type === 'all' || destination.type === type) {
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }
        });
    }

    // Get directions to destination
    getDirections(destinationName, lat, lng) {
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();

        directionsRenderer.setMap(this.map);

        // Get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                const request = {
                    origin: userLocation,
                    destination: { lat: lat, lng: lng },
                    travelMode: google.maps.TravelMode.DRIVING
                };

                directionsService.route(request, (result, status) => {
                    if (status === 'OK') {
                        directionsRenderer.setDirections(result);
                    } else {
                        alert('Directions request failed: ' + status);
                    }
                });
            }, () => {
                alert('Unable to get your location. Please enable location services.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    // View destination details
    viewDestinationDetails(destinationName) {
        // Close info window
        this.infoWindow.close();

        // Scroll to destinations section or open modal
        const destination = this.destinations.find(dest => dest.name === destinationName);
        if (destination) {
            // You can implement a modal or redirect to a details page
            alert(`Viewing details for ${destinationName}\n\n${destination.description}\n\nRating: ${destination.rating}/5\n\nActivities: ${destination.activities.join(', ')}`);
        }
    }

    // Search destinations
    searchDestinations(query) {
        const filteredDestinations = this.destinations.filter(destination =>
            destination.name.toLowerCase().includes(query.toLowerCase()) ||
            destination.description.toLowerCase().includes(query.toLowerCase()) ||
            destination.activities.some(activity => activity.toLowerCase().includes(query.toLowerCase()))
        );

        // Hide all markers first
        this.markers.forEach(marker => marker.setVisible(false));

        // Show filtered markers
        filteredDestinations.forEach(destination => {
            const index = this.destinations.indexOf(destination);
            if (index !== -1) {
                this.markers[index].setVisible(true);
            }
        });

        return filteredDestinations;
    }
}

// Global functions for map interactions
let tourismMap;

function initMap() {
    try {
        console.log('[Maps] initMap callback fired');
        tourismMap = new BoisarTourismMap();
        tourismMap.initMap();
    } catch (e) {
        console.error('[Maps] initMap error', e);
        if (typeof mapsLoadError === 'function') {
            mapsLoadError();
        }
    }
}

function filterDestinations(type) {
    if (tourismMap) {
        tourismMap.filterDestinations(type);
    }
}

function getDirections(destinationName, lat, lng) {
    if (tourismMap) {
        tourismMap.getDirections(destinationName, lat, lng);
    }
}

function viewDestinationDetails(destinationName) {
    if (tourismMap) {
        tourismMap.viewDestinationDetails(destinationName);
    }
}

function searchDestinations(query) {
    if (tourismMap) {
        return tourismMap.searchDestinations(query);
    }
    return [];
}

