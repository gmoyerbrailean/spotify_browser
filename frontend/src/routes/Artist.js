import React from "react";
import { Grid, Table } from "semantic-ui-react";
import DateHistogram from "../compoments/charts/DateHistogram";

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
        name: name,
        rank: 0,
        first: {},
        latest: {},
        tracks: [],
        total_plays: 0,
        total_tracks: 0
      })
      let rankApi = fetch('http://127.0.0.1:5000/api/artists/' + aid + '/rank');
      let firstApi = fetch('http://127.0.0.1:5000/api/artists/' + aid + '/first');
      let latestApi = fetch('http://127.0.0.1:5000/api/artists/' + aid + '/latest');
      let tracksApi = fetch('http://127.0.0.1:5000/api/artists/' + aid + '/tracks');
      let playsApi = fetch('http://127.0.0.1:5000/api/plays?artistId=' + aid);

      Promise.all([rankApi, firstApi, latestApi, tracksApi, playsApi])
      .then(values => Promise.all(values.map(value => value.json())))
      .then(finalVals => {
        console.log(finalVals);
        this.setState({
          rank: finalVals[0]['rank'],
          first: finalVals[1],
          latest: finalVals[2],
          tracks: finalVals[3]['items'],
          total_tracks: finalVals[3]['totalCount'],
          total_plays: finalVals[3]['totalPlays'],
          all_plays: finalVals[4]
        })
      })
    }

    render() {

        const { name, rank, first, latest, tracks, total_plays, total_tracks, all_plays } = this.state;

        return(
            <div id="artist-page">
              <Grid>
                <Grid.Row>
                  <SearchBar type="artists" onSearchSelect={this.handleArtistSelection} />
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={8}>
                    <h1>{name ? name : '...'} is your {rank ? rank + this.getSuffix(rank) : '...'} most listened to artist. </h1>
                    <h2>You've listened to them {total_plays ? total_plays : '(...)'} times, covering {total_tracks ? total_tracks : '(...)'} unique tracks.</h2>
                    <h3>You first listened to {first.track ? first.track + ' on ' + first.date : '...'}</h3>
                    <h3>You most recently listened to {latest.track ? latest.track + ' on ' + latest.date : '...'}</h3>

                    { all_plays ? 
                      <DateHistogram
                        timestamps={all_plays.items.map(i => i.date)}
                        />
                      : 
                      <p> I haven't loaded yet!</p>
                    }


                  </Grid.Column>
                  <Grid.Column width={6}>
                    <div id="artist-track-table">
                      <Table size='small'>
                        <Table.Header>
                          <Table.HeaderCell>Track</Table.HeaderCell>
                          <Table.HeaderCell>Plays</Table.HeaderCell>
                        </Table.Header>
                        <Table.Body>
                          {tracks.map((track, idx) => {
                            return(
                              <Table.Row key={idx}>
                                <Table.Cell>{track.track}</Table.Cell>
                                <Table.Cell>{track.count}</Table.Cell>
                              </Table.Row>
                              )
                            })
                          }
                        </Table.Body>
                      </Table>
                    </div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div> 
        );
    }
}

export default Artist;