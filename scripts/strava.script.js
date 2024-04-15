const activities = {
    biking: 'fa-person-biking',
    running: 'fa-person-running',
    hiking: 'fa-person-hiking',
    walking: 'fa-person-walking',
    swimming: 'fa-person-swimming'
}//FA icons corresponding to the GPX Strava workout types
// Define the Vue app
const app = {
    trackLoaded: false,
    trackData: null,
    trackMetadata: {},
    waypoints: [],
    distMarker: 0,
    maxDistMarker: 0,
    formattedTimeAtdistMarker: null,
    initialTime: 0,
    
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const gpxData = reader.result;
                const parser = new DOMParser();
                this.trackData = parser.parseFromString(gpxData, "application/xml"); //convert text into DOM
                this.trackLoaded = true;
                this.getMetadata(); //parse for Strava metadata like name and activity type
                this.maxDistMarker = this.calculatemaxDistMarker(); //add up all haversine distances
                this.initialTime = new Date(
                    this.trackData
                    .getElementsByTagName("trk")[0]
                    .getElementsByTagName("trkseg")[0]
                    .children[0].children[1].textContent //basically find date the first element of a workout
                ).getTime(); // and convert in into epoch time
            };
            reader.readAsText(file);
        }
    },
    preventDefaultEnter(e) {
        e.target.classList.add("hovering");//add class to dropper
        e.preventDefault();
        return false;
    },
    preventDefaultExit(e) {
        e.target.classList.remove("hovering");//remove class from dropper
        e.preventDefault();
        return false;
    },
    handleDragDrop(event) {
        event.preventDefault();
        event.target.classList.remove("hovering");
        this.handleFileUpload({target: event.dataTransfer})//rephrase dataTransfer to something handle file upload can handle
        
    },
    getMetadata() {
        const tracks = this.trackData.getElementsByTagName("trk")[0];
        if (tracks.getElementsByTagName("name")) {
            this.trackMetadata["name"] = tracks.getElementsByTagName("name")[0].textContent; //get Name if exists
        }
        if (tracks.getElementsByTagName("type")) {
            this.trackMetadata["type"] = tracks.getElementsByTagName("type")[0].textContent; //get activity type if possible
            this.trackMetadata["icon"] = activities[this.trackMetadata["type"]];
        }
    },
    calculatemaxDistMarker() {
        if (this.trackLoaded) {
            const tracks = this.trackData.getElementsByTagName("trk")[0];
            const track_segs = Array.from(tracks.getElementsByTagName("trkseg")); //get a list of segments
            const waypoints = [].concat(...track_segs.map((track) => Array.from(track.children))) //use this to merge the list of different segments into one big list
            this.waypoints = waypoints;
            const totalDistance = waypoints.reduce((acc, waypoint, index) => {
                const prev_waypoint = waypoints[Math.max(index-1,0)]; //make sure we don't go to -1
                const dist = this.haversineDistance(
                    [waypoint.getAttribute("lon"), waypoint.getAttribute("lat")],
                    [prev_waypoint.getAttribute("lon"), prev_waypoint.getAttribute("lat")]
                ) //find haversine between previous and current coordinates
                return acc + dist;
           
        }, 0); //add haversine distances of the waypoints
        return totalDistance; //the length of the workout in feet
        }
    },
    haversineDistance(coords1, coords2) {
        function toRad(x) {
            return x * Math.PI / 180;
        }

        var lon1 = coords1[0];
        var lat1 = coords1[1];

        var lon2 = coords2[0];
        var lat2 = coords2[1];

        var R = 20925524; // Radius of the earth in feet

        var x1 = lat2 - lat1;
        var dLat = toRad(x1);
        var x2 = lon2 - lon1;
        var dLon = toRad(x2)
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;

        return d;

    },//definitely not stolen from https://stackoverflow.com/a/30316500
    makeSurePeopleDontGoTooHigh(event) {
        const num  = event.target.value; //this is in miles
        event.target.value = Math.max(0, Math.min(num, this.maxDistMarker/5280)); //clamp value to a normal range
        this.distMarker = event.target.value * 5280; //update distMarker
    },
    calculateTime() {
        console.log("Calculating time")
        let accumulatedDistance = 0; //in feet
        for (let waypointIndex = 0; waypointIndex < this.waypoints.length; waypointIndex++) {
            const waypoint = this.waypoints[waypointIndex];
            const prevWaypoint = this.waypoints[Math.max(waypointIndex - 1,0)]; //make sure we don't go to -1

            const dist = this.haversineDistance(
                [
                    waypoint.getAttribute('lon'),
                    waypoint.getAttribute('lat')
                ],
                [
                    prevWaypoint.getAttribute('lon'),
                    prevWaypoint.getAttribute('lat')
                ]
        )
        accumulatedDistance += dist;

        if (accumulatedDistance > this.distMarker) {
            const endEpochTime = new Date(waypoint.children[1].textContent).getTime()
            const timeSinceBeginning = (endEpochTime - this.initialTime) / 1000; // find seconds between the two values
            
            this.formattedTimeAtdistMarker = new Date(timeSinceBeginning * 1000).toISOString().slice(11, 19);//https://stackoverflow.com/a/25279340
            return;
        }
        }
    }
}

// Mount the Vue app using Petite Vue
PetiteVue.createApp(app).mount('#app');