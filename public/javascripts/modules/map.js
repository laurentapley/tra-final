import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
    center: {
        lat: 34.681146,
        lng: -86.741721
    },
    zoom: 22
};

function loadPlaces(map, lat = 34.681146, lng = -86.741721) {
    axios.get(`/api/v1/stores/near?lat=${lat}&lng=${lng}`).then(res => {
        const places = res.data;
        console.log(places);
        if (!places.length) {
            alert('no places found!');
            return;
        }

        // create a bounds
        const bounds = new google.maps.LatLngBounds();

        const infoWindow = new google.maps.InfoWindow();
        const markers = places.map(place => {
            const [placeLng, placeLat] = place.location.coordinates;

            const position = {
                lat: placeLat,
                lng: placeLng
            };
            bounds.extend(position);
            const marker = new google.maps.Marker({ map, position });
            // when someone clicks marker we need someway to reference the data for that marker
            marker.place = place;
            return marker;
        });

        // when someone clicks on a marker, show the details of that place
        markers.forEach(marker =>
            marker.addListener('click', function() {
                console.log(this.place);
                const html = `
              <div class="popup">
                <a href="/store/${this.place.slug}">
                  <img src="/uploads/${this.place.photo ||
                    'store-closing.jpg'}" alt="${this.place.name}" />
                  <p>${this.place.name} - ${this.place.location.address}</p>
                </a>
              </div>
            `;
                infoWindow.setContent(html);
                infoWindow.open(map, this);
            })
        );

        // then zoom the map to fit all the markers perfectly
        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds);
    });
}

function makeMap(mapDiv) {
    if (!mapDiv) return;

    // make our map
    const map = new google.maps.Map(mapDiv, mapOptions);
    loadPlaces(map);

    const input = $('[name="geolocate"]');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        loadPlaces(
            map,
            place.geometry.location.lat(),
            place.geometry.location.lng()
        );
        //  console.log(place);
    });
}

export default makeMap;
