# Google Maps Integration Setup Guide

This guide will help you set up Google Maps integration for your Boisar Tourism website.

## 🗺️ **What's Included:**

### **Interactive Features:**
✅ **Interactive Google Map** with Boisar region tourist destinations
✅ **Custom Markers** for different destination types
✅ **Info Windows** with detailed destination information
✅ **Search Functionality** to find specific destinations
✅ **Filter Controls** by destination type
✅ **Directions Integration** to get routes to destinations
✅ **Responsive Design** for all devices

### **Destination Types:**
- 🟢 **Eco Tourism** (Beaches, Nature Reserves)
- 🟠 **Cultural Heritage** (Temples, Cultural Sites, Warli Villages)
- 🔵 **Nature & Waterfalls** (Natural Attractions, Hills)
- 🟣 **Historical Sites** (Forts, Historical Monuments)
- ⚫ **Industrial Tourism** (TAPS, Industrial Tours)

## 🔧 **Setup Instructions:**

### **Step 1: Get Google Maps API Key**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable APIs**:
   - Go to "APIs & Services" > "Library"
   - Search and enable:
     - **Maps JavaScript API**
     - **Places API** (for enhanced search)
     - **Directions API** (for route planning)
     - **Geocoding API** (for address conversion)

4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### **Step 2: Configure API Key**

1. **Open** `index.html`
2. **Find** this line near the bottom:
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap"></script>
   ```
3. **Replace** `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&callback=initMap"></script>
   ```

### **Step 3: Set API Restrictions (Recommended)**

1. **Go to** Google Cloud Console > APIs & Services > Credentials
2. **Click** on your API key
3. **Set Application restrictions**:
   - Choose "HTTP referrers (web sites)"
   - Add your local domain: `localhost:8000/*`
   - Add your production domain: `boisar-tourism.vercel.app/*`

4. **Set API restrictions**:
   - Choose "Restrict key"
   - Select only the APIs you enabled

## 🎯 **Features Available:**

### **Interactive Map:**
- **Zoom and Pan** around Boisar, Palghar, and nearby coastal regions
- **Click markers** to see destination details
- **Filter by type** using control buttons
- **Search destinations** using the search bar

### **Destination Information:**
- **Ratings and reviews** display
- **Activity tags** for each location
- **Detailed descriptions** of each spot
- **Direct Google Maps links** for navigation

### **Navigation Features:**
- **Get Directions** button for each destination
- **Current location** detection
- **Route planning** with Google Maps integration

### **Responsive Design:**
- **Mobile-friendly** interface
- **Touch gestures** support
- **Optimized for all screen sizes**

## 📍 **Destinations Included:**

### **Eco Tourism (Beaches):**
- Kelva Beach — Black sand, serene environment
- Dahanu Beach — Chikoo orchards, coastal walks

### **Cultural Heritage:**
- Warli Art Village — Tribal paintings and handicrafts
- Local Temples — Spiritual heritage sites

### **Nature & Waterfalls:**
- Dabhosa Waterfall — Stunning monsoon waterfall near Jawhar
- Kohoj Hill — Panoramic hilltop views and treks

### **Historical Sites:**
- Kaldurg Fort — Popular monsoon trekking destination
- Tarapur Fort — Seaside historic fort

### **Industrial Tourism:**
- TAPS (Tarapur Atomic Power Station) area — Industrial tourism zone

## 🚀 **Testing Your Setup:**

1. **Open** your website: `http://localhost:8000`
2. **Scroll down** to the "Explore Boisar" section
3. **Verify** the map loads correctly
4. **Test features**:
   - Click on markers
   - Use filter buttons
   - Search for destinations (e.g., "Kelva Beach")
   - Try "Get Directions" feature

## 🔒 **Security Best Practices:**

### **API Key Security:**
- ✅ **Restrict by domain** (HTTP referrers)
- ✅ **Limit to specific APIs** only
- ✅ **Monitor usage** in Google Cloud Console
- ✅ **Set usage quotas** to prevent abuse

### **Production Deployment:**
- ✅ **Use environment variables** for API keys where possible
- ✅ **Implement server-side validation**
- ✅ **Add rate limiting** for API calls

## 🛠️ **Customization Options:**

### **Add More Destinations:**
Edit `js/google-maps.js` and add to the `destinations` array:
```javascript
{
    name: "Your Destination",
    position: { lat: 19.8135, lng: 72.7470 }, // Boisar area coordinates
    type: "eco-tourism", // or cultural, nature, historical, industrial
    description: "Description of your destination",
    rating: 4.5,
    activities: ["Activity 1", "Activity 2", "Activity 3"]
}
```

### **Customize Map Center:**
Modify the map initialization in `js/google-maps.js`:
```javascript
this.map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: { lat: 19.8135, lng: 72.7470 }, // Boisar, Maharashtra
    mapTypeId: google.maps.MapTypeId.TERRAIN, // or SATELLITE, HYBRID, ROADMAP
    styles: [
        // Add custom map styles here
    ]
});
```

### **Change Marker Icons:**
Update the `getMarkerIcon()` function in `js/google-maps.js` to use custom icons.

## 📱 **Mobile Optimization:**

The map is fully responsive and includes:
- **Touch-friendly controls**
- **Optimized marker sizes**
- **Mobile-specific info windows**
- **Gesture support** for zoom/pan

## 🎨 **Styling Customization:**

All map styles are in `styles.css` under the "Google Maps Integration Styles" section. You can customize:
- **Map container** appearance
- **Search bar** design
- **Legend** styling
- **Info window** appearance
- **Control buttons** design

## 🚨 **Troubleshooting:**

### **Map Not Loading:**
1. Check if API key is correctly set in `index.html`
2. Verify APIs are enabled in Google Cloud Console
3. Check browser console for errors
4. Ensure internet connection is working

### **Markers Not Showing:**
1. Check if coordinates are correct for Boisar region
2. Verify marker creation in console
3. Check for JavaScript errors in `js/google-maps.js`

### **Directions Not Working:**
1. Ensure Directions API is enabled
2. Check if user location permission is granted
3. Verify API key has Directions API access

## 🌟 **Your Interactive Map is Ready!**

Once you've completed the setup, your Boisar Tourism website will have a fully functional, interactive Google Maps integration that allows users to:

- **Explore** all major tourist destinations around Boisar and Palghar district
- **Get detailed information** about beaches, forts, waterfalls, and hills
- **Plan their routes** with directions from their current location
- **Filter destinations** by type (eco, cultural, nature, historical)
- **Search** for specific places easily

The map enhances user experience and makes it easy for tourists to discover and navigate to Boisar's beautiful coastal and cultural destinations! 🌊🎉
