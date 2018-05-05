import React, { Component } from 'react';
import './MyMap.css';

class MyMap extends Component {
  constructor(props) {
    super(props);
    this.mapDom = React.createRef();
  }

  componentDidMount() {
    let interval;
    interval = setInterval(() => {
      console.log('in interval')
      /* global google */
      if(typeof google !== 'undefined' && typeof google.maps !== 'undefined' && typeof google.maps.Map !== 'undefined') {
        clearInterval(interval);
        this.initMap()
      }
    }, 1500)
  }

  initMap() {
    let markers = [];
    let locations = [
      {
        title: 'LotteMart Supermarket',
        type: 'Supermarket',
        image: 'http://cdn.onlinewebfonts.com/svg/img_243357.png',
        location: {
          lat: 10.741401,
          lng: 106.702040
        }
      },
      {
        title: 'Ton Duc Thang University',
        type: 'University',
        image: 'https://cdn2.iconfinder.com/data/icons/crazy-paparazzi-collection-svg/100/Noun_Project_100Icon_10px_grid_2-47-128.png',
        location: {
          lat: 10.733731,
          lng: 106.699870
        }
      },
      {
        title: 'Vietcombank',
        type: 'Bank',
        image: 'https://cdn2.iconfinder.com/data/icons/realty-business/512/euro_bank-512.png',
        location: {
          lat: 10.740717,
          lng: 106.702197
        }

      },
      {
        title: 'Starlight Bridge',
        type: 'Park',
        image: 'https://d30y9cdsu7xlg0.cloudfront.net/png/12246-200.png',
        location: {
          lat: 10.726011,
          lng: 106.717060
        }
      },
      {
        title: 'Vivo City',
        type: 'Entertainment Center',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRW8AFE-4wR8t-8pol-_kyuoAd7RX5XbN4nknqTjxhNGLFOFCv8Q',
        location: {
          lat: 10.730543,
          lng: 106.703526
        }
      }
    ]
    let mapDom = document.getElementById('map');
    let mapConfigs = {
      center: { lat: 10.779983, lng: 106.699058 },
      zoom: 13
    };
    this.map = new google.maps.Map(mapDom, mapConfigs);
    let largeInfowindow = new google.maps.InfoWindow();
    let bounds = new google.maps.LatLngBounds();
    for(let i = 0; i < locations.length; i++) {
      let position = locations[i].location;
      let title = locations[i].title;
      let type = locations[i].type;
      let image = locations[i].image;
      let marker = new google.maps.Marker({
        map: this.map,
        position: position,
        title: title,
        type: type,
        image: image,
        animation: google.maps.Animation.DROP,
        id: i
      })
      markers.push(marker);
      bounds.extend(marker.position);
      marker.addListener('click', () => {
        populateInfoWindow(this.map, marker, largeInfowindow);
      });
    }
    this.map.fitBounds(bounds);
    function populateInfoWindow(map, marker, infowindow) {
      if(marker.infowindow != marker) {
        infowindow.marker = marker;
        infowindow.setContent(`<div class="marker-image-container"><img class="marker-image" src=${marker.image} alt=${marker.title}/></div><div>${marker.title}</div><div>${marker.type}</div>`);
        infowindow.open(map, marker);
        infowindow.addListener('click', () => {
          infowindow.close();
        });
      }
    }
  }

  render() {
    return (
      <div className="map" id='map'>
        map
      </div>
    );
  }
}

export default MyMap;
