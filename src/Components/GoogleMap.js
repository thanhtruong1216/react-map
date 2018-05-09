import React, { Component } from 'react';
import '../App.css';
import superagent from 'superagent';
import locations from './Locations';
import styles from './StylesMap';
import Proptypes from 'prop-types';

class GoogleMap extends Component {
  constructor(props) {
    super(props);
    this.mapDom = React.createRef();
    this.markers = {};
    this.venues = {};
    this.state = {
      searchResult: [],
      searchingState: false,
      largeInfowindow: null,
      locations: locations
    }
  }
// Filter location when click filter icon in search box
  filterLocation = (e) => {
    this.setState({
      searchingState: true
    })
    e.preventDefault();
    const {locations} = this.state;
    let locationFiltered = locations.filter((location) => location.title.match(new RegExp(this.input.value, 'i')));
    this.setState({searchResult: locationFiltered})

  // Find the marker that has in search result but not has in markers
    let locationIdsResult = locationFiltered.map(x => x.id + '');
    let locationIdsThatHasMarker = Object.keys(this.markers);
    let set1 = new Set(locationIdsResult);
    let set2 = new Set(locationIdsThatHasMarker);
    let locationIdsDifference = [...set2].filter(x => !set1.has(x)).map(Number);
    let addmarker = [...set1].filter(x => !set2.has(x)).map(Number);
    let diff_markers = locationIdsDifference.map(id => this.markers[id]);
  // Loop through array of differrence markers and set map is null
    diff_markers.forEach(function(marker) {
      marker.setMap(null);
    })
  // Loop through array of difference locations and delele it from makers object
    locationIdsDifference.forEach(id => {
      delete this.markers[id];
    })
    let defaultIcon = makeMarkerIcon('0091ff');
    let highlightedIcon = makeMarkerIcon('FFFF24');
    function makeMarkerIcon(markerColor) {
      let markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
      return markerImage;
    }
    let locationIdsSet = new Set(addmarker);
    let locationToAddMarkers = this.state.locations.filter(location => locationIdsSet.has(location.id))
  // Create maker
    for(let i = 0; i < locationToAddMarkers.length; i++) {
      let location = locationToAddMarkers[i];
      let position = location.location;
      let title = location.title;
      let type = location.type;
      let image = location.image;
      let id = location.id;
      let data = this.venues[id];
      let address = data.location.address;
      let city = data.location.city;
      let phoneNumber = data.contact.phone;
      let checking = data.stats.checkinsCount;
      let name = data.categories[0].name;
      let marker = new google.maps.Marker({
        map: this.map,
        position: position,
        title: title,
        type: type,
        animation: google.maps.Animation.DROP,
        id: id,
        image:image,
        icon: defaultIcon,
        address:address,
        city: city,
        phoneNumber: phoneNumber,
        checking: checking,
        name: name
      })
      this.markers[location.id] = marker;

     // let markers = this.state.markers;
     // let newMarkers = [...markers, marker];
     // this.setState({markers: newMarkers});

      this.bounds.extend(marker.position);
      marker.addListener('click', () => {
        this.populateInfoWindow(marker, this.state.largeInfowindow);
      });

      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
    }
    this.map.fitBounds(this.bounds);
  }

  componentDidMount() {
    let interval;
    interval = setInterval(() => {
      /* global google */
      if(typeof google !== 'undefined' && typeof google.maps !== 'undefined' && typeof google.maps.Map !== 'undefined') {
        clearInterval(interval);
        this.initMap()
      }
    }, 1500)
  // Fetch data from foursquare API and save it to venues object
    const urls = this.state.locations.map((location) => {
      let fourSquareUrl = `https://api.foursquare.com/v2/venues/search?ll=
      ${location.location.lat},${location.location.lng}&oauth_token=1O0IBO4YM04WTZXRT3ALWM333MHCF3FXOSCCVBHDZDYZRYPC&v=20180417`;
      try {
        superagent
          .get(fourSquareUrl)
          .query(null)
          .set('Accept','text/json')
          .end((error, response) => {
            let venuesResponse = response.body.response.venues[0];
            this.venues[location.id] = venuesResponse;
            console.log("venues data", this.venues);
          })
      } catch(error) {
        console.log(error);
      }
    })
  }
  initMap() {
    let mapConfigs = {
      center: { lat: 10.758334, lng: 106.672211 },
      zoom: 13,
      styles: styles,
      mapTypeControl: false
    };
    let defaultIcon = makeMarkerIcon('0091ff');
    let highlightedIcon = makeMarkerIcon('FFFF24');
    let mapDom = document.getElementById('map');
    this.bounds = new google.maps.LatLngBounds();
    this.setState({largeInfowindow: new google.maps.InfoWindow()});
    this.map = new google.maps.Map(mapDom, mapConfigs);

    function makeMarkerIcon(markerColor) {
      let markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
      return markerImage;
    }

    for(let i = 0; i < this.state.locations.length; i++) {
      let location = this.state.locations[i]
      let position = location.location;
      let title = location.title;
      let type = location.type;
      let image = location.image;
      let id = location.id;
      let data = this.venues[id];
      let address = data && data.location && data.location.address;
      let city = data.location.city;
      let phoneNumber = data.contact.phone;
      let checking = data.stats.checkinsCount;
      let name = data.categories[0].name;
      let marker = new google.maps.Marker({
        map: this.map,
        position: position,
        title: title,
        type: type,
        icon: defaultIcon,
        image: image,
        animation: google.maps.Animation.DROP,
        id: id,
        address:address,
        city: city,
        phoneNumber: phoneNumber,
        checking: checking,
        name: name
      })
      this.markers[location.id] = marker;

     // let markers = this.state.markers;
     // let newMarkers = [...markers, marker];
     // this.setState({markers: newMarkers});

      this.bounds.extend(marker.position);

      marker.addListener('click', () => {
        this.populateInfoWindow(marker, this.state.largeInfowindow);
      });

      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
    }

    this.map.fitBounds(this.bounds);
  }
// Create info window content and check type of data to decide what imformation will show.
  populateInfoWindow = (marker) => {
    let infowindow = this.state.largeInfowindow;
    let checkAddress = null;
    let checkCity = null;
    let checkPhoneNumber = null;
    if(infowindow.marker !== marker) {
      if(marker.address === undefined) {
        checkAddress = 'Adress is not available'
      } else {
        checkAddress = marker.address
      }

      if(marker.city === undefined) {
        checkCity = 'City is not available'
      } else {
        checkCity = marker.city
      }

      if(marker.phoneNumber === undefined) {
        checkPhoneNumber = 'Phone number is not available'
      } else {
        checkPhoneNumber = marker.phoneNumber
      }

      infowindow.marker = marker;
      infowindow.setContent(`
        <div class="info-window-container">
          <img class="marker-image" src=${marker.image} alt=${marker.title}/>
          <h3>${marker.title}</h3>
          <p>${marker.name}</p>
          <address>Adress: ${checkAddress}</br>${checkCity}</br>${checkPhoneNumber}</address>
          <p>Checking count: ${marker.checking}</p>
        </div>
      `);
      infowindow.open(this.map, marker);
      infowindow.addListener('click', () => {
        infowindow.close();
      });
    }
  }

// Show info window when click on the name of the location
  showInfowindowForLocation = (location) => {
    this.populateInfoWindow(this.markers[location.id]);
  }

  render() {
    let locations;
    let alertSearchResultEmpty = null;
    if(this.state.searchingState) {
      locations = this.state.searchResult;
    } else {
      locations = this.state.locations;
    }
    if(this.state.searchingState && this.state.searchResult.length === 0) {
      alertSearchResultEmpty = (
        <div className="alert-location-search-box">No location match</div>
      )
    }
    return (
      <div className="container">
        <div className="search-box" >
          <input
            id="search-box-input"
            type="search"
            placeholder="Location name"
            ref={(input) => this.input = input}
            onClick={this.searching}
          />
          <button onClick={(e) => this.filterLocation(e)} >
            <span>
              <i className="fa fa-filter filter-icon" aria-hidden="true"></i>
            </span>
          </button>
          {alertSearchResultEmpty}
          <ul className="location-name-container">
            {locations.map((location, key) => {
              return(
                <li
                  id="location"
                  onClick={(e) => this.showInfowindowForLocation(location)}
                  key={key}>
                  {location.title}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="map-container">
          <div className="map" id="map"></div>
        </div>
      </div>
    );
  }
}

GoogleMap.proptypes = {
  searchResult: Proptypes.array.isRequired,
  locations: Proptypes.array.isRequired,
  venues: Proptypes.object.isRequired,
  markers: Proptypes.object.isRequired
}
export default GoogleMap;