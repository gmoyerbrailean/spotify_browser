import React from "react";

import SearchBar from "../compoments/SearchBar";

class Artist extends React.Component{

    constructor(props) {
        super(props);
        
        this.state = {
          name: '',
          rank: 0,
          first: {},
          latest: {},
          tracks: [],
          total_plays: 0,
          total_tracks: 0
        };
      }

    getSuffix = (num) => {
      switch (num) {
        case 1:
          return('st');
        case 2:
          return('nd');
        case 3:
          return('rd');
        default:
          return('th');
      }
    }

    handleArtistSelection = (aid, name) => {

      console.log(aid);
      this.setState({
        name: name
      })
      let rankApi = fetch('http://127.0.0.1:5000/api/artists/' + aid + '/rank');
      let firstApi = fetch('http://127.0.0.1:5000/api/artists/' + aid + '/first');
      let latestApi = fetch('http://127.0.0.1:5000/api/artists/' + aid + '/latest');
      let tracksApi = fetch('http://127.0.0.1:5000/api/artists/' + aid + '/tracks');

      Promise.all([rankApi, firstApi, latestApi, tracksApi])
      .then(values => Promise.all(values.map(value => value.json())))
      .then(finalVals => {
        console.log(finalVals);
        this.setState({
          rank: finalVals[0]['rank'],
          first: finalVals[1],
          latest: finalVals[2],
          tracks: finalVals[3]['items'],
          total_tracks: finalVals[3]['totalCount'],
          total_plays: finalVals[3]['totalPlays']
        })
      })
    }

    render() {

        const { name, rank, first, latest, total_plays, total_tracks } = this.state;

        return(
            <div id="artist-page">
              <SearchBar type="artists" onSearchSelect={this.handleArtistSelection} />
                <h2>Artist: {name} </h2>
                <h3>Your {rank ? rank + this.getSuffix(rank) : '...'} most listened to artist.</h3>
                <p>You first listened to {first.track ? first.track + ' on ' + first.date : '...'}</p>
                <p>You most recently listened to {latest.track ? latest.track + ' on ' + latest.date : '...'}</p>
                <p>You've listened to them {total_plays ? total_plays : '(...)'} times, covering {total_tracks ? total_tracks : '(...)'} unique tracks.</p>
            </div>
        );
    }
}

export default Artist;