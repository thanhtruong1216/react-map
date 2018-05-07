import React, { Component } from 'react';
import './MyMap.css';
import superagent from 'superagent';
import locations from './Locations';
import styles from './StylesMap';

class MyMap extends Component {
  constructor(props) {
    super(props);
    this.mapDom = React.createRef();
    this.markers = {};
    this.state = {
      venues: [],
      result: [],
      searchingState: false,
      largeInfowindow: null,
      locations: locations
    }
  }

  filterLocation = (e) => {
    this.setState({
      searchingState: true
    })
    const {result} = this.state;
    e.preventDefault();
    const {locations} = this.state;
    let locationFiltered = locations.filter((location) => location.title.match(new RegExp(this.input.value, 'i')));
    this.setState({result: locationFiltered})

    // let locationIdsResult = result.map(x => x.id + '');
    let locationIdsResult = locationFiltered.map(x => x.id + '');

    let locationIdsThatHasMarker = Object.keys(this.markers);
    let set1 = new Set(locationIdsResult);
    let set2 = new Set(locationIdsThatHasMarker);
    let locationIdsDifference = [...set2].filter(x => !set1.has(x)).map(Number);
    let diff_markers = locationIdsDifference.map(id => this.markers[id]);

    diff_markers.forEach(function(marker) {
      marker.setMap(null);
    })

    locationIdsDifference.forEach(id => {
      delete this.markers[id];
    })

    // this.populateInfoWindow(this.markers);
  }

  componentDidMount() {
    let interval;
    const {venues} = this.state;
    let locationInfo = null;
    interval = setInterval(() => {
      /* global google */
      if(typeof google !== 'undefined' && typeof google.maps !== 'undefined' && typeof google.maps.Map !== 'undefined') {
        clearInterval(interval);
        this.initMap()
      }
    }, 1500)
    const urls = this.state.locations.map((location) => {
      const fourSquareUrl = `https://api.foursquare.com/v2/venues/search?ll=
      ${location.location.lat},${location.location.lng}&oauth_token=1O0IBO4YM04WTZXRT3ALWM333MHCF3FXOSCCVBHDZDYZRYPC&v=20180417`;
      superagent
      .get(fourSquareUrl)
      .set('Accept','text/json')
      .end((error, response) => {
        let venuesResponse = response.body.response.venues[0];
        this.state.venues.push(venuesResponse);
        this.setState({venues})
        console.log("venues state", this.state.venues)
      })
    })
  }
  initMap() {
    this.bounds = new google.maps.LatLngBounds();
    let defaultIcon = makeMarkerIcon('0091ff');
    let highlightedIcon = makeMarkerIcon('FFFF24');
    let mapDom = document.getElementById('map');
    let mapConfigs = {
      center: { lat: 10.779983, lng: 106.699058 },
      zoom: 13,
      styles: styles,
      mapTypeControl: false
    };
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
      console.log("state", this.state.venues)
      let location = this.state.locations[i]
      let position = location.location;
      let title = location.title;
      let type = location.type;
      let image = location.image;
      let id = location.id;
      let address = this.state.venues[i].location.address;
      let city = this.state.venues[i].location.city;
      // let contact = this.state.venues.location.address;
      let marker = new google.maps.Marker({
        map: this.map,
        position: position,
        title: title,
        type: type,
        icon: defaultIcon,
        image: image,
        animation: google.maps.Animation.DROP,
        id: id,
        address: address,
        city: city
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

  populateInfoWindow = (marker) => {
    let infowindow = this.state.largeInfowindow;

    if(infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent(`
        <div class="marker-image-container"><img class="marker-image" src=${marker.image} alt=${marker.title}/>
        </div><div>${marker.title}</div>
        <div>${marker.type}</div>
        <div>${marker.address}</div>
        <div>${marker.city}</div>
      `);
      infowindow.open(this.map, marker);
      infowindow.addListener('click', () => {
        infowindow.close();
      });
    }
  }

  showInfowindowForLocation = (location) => {
    this.populateInfoWindow(this.markers[location.id]);
  }

  render() {
    let locations;
    let alertSearchResultEmpty = null;
    if(this.state.searchingState) {
      locations = this.state.result;
    } else {
      locations = this.state.locations;
    }
    if(this.state.searchingState && this.state.result.length === 0) {
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
          <span>
            <i className="fa fa-filter filter-icon" aria-hidden="true" onClick={(e) => this.filterLocation(e)} ></i>
          </span>
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
        <div className="map" id='map'></div>
      </div>
    );
  }
}

export default MyMap;
