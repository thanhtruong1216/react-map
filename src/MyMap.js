import React, { Component } from 'react';
import './MyMap.css';
import superagent from 'superagent';
import locations from './Locations';
import styles from './StylesMap';

class MyMap extends Component {
  constructor(props) {
    super(props);
    this.mapDom = React.createRef();
    this.state = {
      venues: [],
      result: [],
      markers: [],
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
    let locationTitle = locations.map((location) => {
      return location.title;
    })
    let locationFilter = locationTitle.filter((title) => title.match(new RegExp(this.input.value)));
    this.setState({result: locationFilter})
  }

  componentDidMount() {
    let interval;
    const {venues} = this.state;
    let locationInfo = null;
    interval = setInterval(() => {
      console.log('in interval')
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
      .query(null)
      .set('Accept','text/json')
      .end((error, response) => {
        const venues = response.body.response.venues;
        for(let i = 0; i < venues.length; i++) {
          console.log(`Name: ${venues[i].name}, Adress: ${venues[i].location.address}, Phone: ${venues[i].contact.phone}`)
          locationInfo = `<div>Name: ${venues[i].name}</div>div>Adress: ${venues[i].location.address}</div><div>Phone: ${venues[i].contact.phone}</div>`
        }
        this.setState({venues})
      })
    })
  }

  initMap() {
    let bounds = new google.maps.LatLngBounds();
    let defaultIcon = makeMarkerIcon('0091ff');
    let highlightedIcon = makeMarkerIcon('FFFF24');
    let mapDom = document.getElementById('map');
    let mapConfigs = {
      center: { lat: 10.779983, lng: 106.699058 },
      zoom: 13,
      styles: styles,
      mapTypeControl: false
    };
    this.state.largeInfowindow = new google.maps.InfoWindow();
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
      let marker = new google.maps.Marker({
        map: this.map,
        position: position,
        title: title,
        type: type,
        icon: defaultIcon,
        image: image,
        animation: google.maps.Animation.DROP,
        id: id
      })

     this.setState(({markers}) => ({
        markers: [...markers, {id: location.id, marker: marker}]
      }));

     // let markers = this.state.markers;
     // let newMarkers = [...markers, marker];
     // this.setState({markers: newMarkers});

      bounds.extend(marker.position);
      marker.addListener('click', () => {
        populateInfoWindow(this.map, marker, this.state.largeInfowindow);
      });

      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
    }

    function populateInfoWindow(map, marker, infowindow) {
      if(marker.infowindow != marker) {
        infowindow.marker = marker;
        infowindow.setContent(`
          <div class="marker-image-container"><img class="marker-image" src=${marker.image} alt=${marker.title}/>
          </div><div>${marker.title}</div>
          <div>${marker.type}</div>
        `);
        infowindow.open(map, marker);
        infowindow.addListener('click', () => {
          infowindow.close();
        });
      }
    }
    this.map.fitBounds(bounds);

  }

  render() {
    const {result} = this.state;
    let searchBoxNode = null;
    if(!this.state.searchingState) {
      searchBoxNode =
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
            <ul className="location-name-container">
              {this.state.locations.map((location, key) => {
                return(
                  <li
                    id="location"
                    key={key}>
                    {location.title}
                  </li>
                );
              })}
            </ul>
        </div>
    } else {
      searchBoxNode =
        <div className="search-box">
          <input
            id="search-box-input"
            type="search"
            placeholder="Location name"
            ref={(input) => this.input = input}
          />
          <span>
            <i className="fa fa-filter filter-icon" aria-hidden="true" onClick={(e) => this.filterLocation(e)} ></i>
          </span>
          <ul className="location-name-container">
            {result.map((locationTitle, key) => {
              return(
                <li
                  id="location"
                  key={key}>
                  {locationTitle}
                </li>
              );
            })}
          </ul>
        </div>
    }
    return (
      <div className="container">
        {searchBoxNode}
        <div className="map" id='map'></div>
      </div>
    );
  }
}

export default MyMap;
