import React from "react";
import 'chart.js/auto';
import { Bar } from 'react-chartjs-2';

// A date histogram takes 
class DateHistogram extends React.Component {

    render() {

        const timestamps = this.props.timestamps;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        // Generate the dates for the x-axis
        var date_labels = [];
        for( let dt = new Date("2018", "0"); dt < new Date(); dt.setMonth(dt.getMonth()+1)) {
          date_labels.push(months[dt.getMonth()] + " " + dt.getFullYear());
        }
        
        // Map the timestamps into the date label format
        // and count the number of plays per date
        const date_frequency = date_labels.map(date => {
            return timestamps.reduce((n, val) => {
              let dt = new Date(val);
              return n + (months[dt.getMonth()] + " " + dt.getFullYear() === date);
            }, 0);
        });
        
        const data = {
            labels: date_labels,
            datasets: [{
              data: date_frequency,
              backgroundColor: 'rgba(29, 185, 84, 0.5)' // spotify green
            }]
          }

        
        // const data = {
        //   labels: ["1", "2", "3", "4", "5"],
        //   datasets: [{
        //     data: [2,3,2,2,4],
        //     backgroundColor: 'rgba(29, 185, 84, 0.5)' // spotify green
        //   }]
        // }

          const chartTitle = "";
          const options = {
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                display: false
              },
              title: {
                display: chartTitle ? true : false,
                text: chartTitle
              },
              scales: {
                yAxes: [{
                    ticks: {
                      beginAtZero: true,
                    },
                    scaleLabel: {
                      display: true,
                      labelString: '# Plays'
                    }        
                }],
                xAxes: [{
                  ticks: {
                    beginAtZero: true,
                  }
                }]
              }
            }

            console.log(data);
      
          return(
            <Bar
              data={data}
              // options={options}
              // height={chart_height}
            />      
          )
          // return(<p>hello</p>);

    }


};

export default DateHistogram;