import React from 'react';
import { DashboardContainer } from '../../../shared/Dashboard/Dashboard';
import { Typography } from '@material-ui/core';
import { BigPreloader, notifyError } from '../../../../utils/helpers';
import APIHELPER from '../../../../utils/APIHelper';
import * as d3 from "d3";
import classes from './Stats.module.scss';

interface FullStats {
  insertion_stats: {
    [year: string]: {
      count: number;
      inserted: number;
    }
  };
  public_private: {
    [year: string]: {
      public: number;
      private: number;
    }
  };
}


const TeacherStats: React.FC = () => {
  const [stats, setStats] = React.useState<FullStats | undefined>();

  React.useEffect(() => {
    APIHELPER.request('teacher/stats')
      .then(setStats)
      .catch(notifyError);
  }, []);

  function constructTxBarPlot() {
    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 30, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top;

    const data = Object.entries(stats!.insertion_stats).map(([key, val]) => ({ 
      year: key, ratio: (val.inserted / val.count) * 100 
    }));

    // append the svg object to the body of the page
    const svg = d3.select("#tx_insertion_g")
      .append("svg")
      .attr("viewBox", `0 0 ${height + margin.top} ${width + margin.left + margin.right}`)
      .attr("style", "max-width: 100%")
      .append("g")
      .attr("transform", "translate(" + (margin.left/2) + "," + margin.top + ")") as d3.Selection<SVGGElement, typeof data, HTMLElement, any>;

    // X axis
    const x = d3.scaleBand()
      .range([ 0, width ])
      .domain(data.map(d => d.year))
      .padding(0.2);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y));

    // Bars
    let i = 0;
    const colors = ["#69b3a2", "#5a5ac1", "#ff6161"];
    svg.selectAll("mybar")
      .data(data)
      .enter()
        .append("rect")
        .attr("x", d => x(d.year)!)
        .attr("y", d => y(d.ratio)!)
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.ratio)!)
        .attr("fill", () => colors[i++ % colors.length])
  }

  function constructStackedPublicPrivateBarPlot() {
    const margin = {top: 10, right: 30, left: 50},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top;

    const data = Object.entries(stats!.public_private).map(([key, v]) => ({
      public: (v.public / (v.public+v.private)) * 100,
      private: (v.private / (v.public+v.private)) * 100,
      year: key
    }));

    // append the svg object to the body of the page
    const svg = d3.select("#public_private_g")
      .append("svg")
        .attr("viewBox", `0 0 ${height + margin.top} ${width + margin.left + margin.right}`)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")") as d3.Selection<SVGGElement, typeof data, HTMLElement, any>;

    // Parse the Data
    // List of subgroups = header of the csv files = soil condition here
    const subgroups = ['public', 'private'];

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const groups = d3.map(data, d => d.year).keys();

    // Add X axis
    const x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding(0.2);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(['#377eb8','#4daf4a']);

    //stack the data? --> stack per subgroup
    // @ts-ignore
    const stackedData = d3.stack().keys(subgroups)(data);
    type SD = typeof stackedData;

    // Show the bars
    // @ts-ignore
    svg.append("g")
      .selectAll("g")
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .enter()
        .append("g")
        .attr("fill", (d: SD) => color(d.key) as string)
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d)
        .enter()
          .append("rect")
          .attr("x", (d: SD) => x(d.data.year)!)
          .attr("y", (d: SD) => y(d[1]))
          .attr("height", (d: SD) => y(d[0]) - y(d[1]))
          .attr("width", x.bandwidth());
    
    const labels = ["Public", "Privé"];
    const size = 20;
    svg.selectAll("mydots")
      .data(labels)
      .enter()
      .append("rect")
        .attr("x", 0)
        .attr("y", function(d,i){ return height + margin.top + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        // @ts-ignore
        .style("fill", function(d){ return color(d)});

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
      .data(labels)
      .enter()
      .append("text")
        .attr("x", size*1.2)
        .attr("y", function(d,i){ return height + margin.top + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        // @ts-ignore
        .style("fill", function(d){ return color(d)})
        // @ts-ignore
        .text(function(d){ return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
  }

  React.useEffect(() => {
    if (stats) {
      // Construct the graph
      constructTxBarPlot();
      constructStackedPublicPrivateBarPlot();
    }
    // eslint-disable-next-line
  }, [stats]);

  return (
    <DashboardContainer>
      <Typography variant="h3" className="bold" gutterBottom>
        Statistiques
      </Typography>

      {!stats && <BigPreloader style={{"marginTop": "1.5rem"}} />}
      {!!stats && <div className={classes.grid_insertion}>
        <Typography variant="h6" className={classes.tx_title}>
          Taux d'insertion après un an
        </Typography>

        <div id="tx_insertion_g" className={classes.tx_graph} />

        <Typography variant="h6" className={classes.repartition_title}>
          Répartition public/privé des emplois
        </Typography>
      
        <div id="public_private_g" className={classes.repartition_graph} />
      </div>}
    </DashboardContainer>
  );
};

export default TeacherStats;
