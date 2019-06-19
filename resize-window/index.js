let margin = {
    top: 55,
    right: 20,
    bottom: 30,
    left: 50
},
svgWidth = 750,
svgHeight = 350,
chartWidth = svgWidth - margin.right - margin.left,
chartHeight = svgHeight - margin.top - margin.bottom

let breakpoint = 577 // this is arbitrary

let svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)

let x = d3.scaleBand()
    .range([0, chartWidth]) // don't use rangeRound, because axes switching on resize() doesn't get tick padding right for lower bound
    .padding(0.2) // padding between bands?

let y = d3.scaleLinear()
    .range([chartHeight, 0])

let g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

let colorMap = {
    'A': '#FF2A92',
    'B': '#EFE414',
    'C': '#14E5EF'
}

d3.csv('data.csv').then(data => {
    // convert strings to numbers
    data.forEach(d => {
        d.Run = +d.Run
        d.Speed = +d.Speed
    })

    // set the domains once you have the data
    x.domain(data.map(d => d.Run))
    y.domain([0, d3.max(data, d => d.Speed)])

    // create and append the x axis
    let xAxis = g.append('g')
        .attr('class', 'x-axis')
    
    // create and append the y axis
    let yAxis = g.append('g')
        .attr('class', 'y-axis')
    
    let legend = svg.append('g')
        .attr('font-size', '10px')
        .attr('class', 'legend')
    
    legend.append('text')
        .text('Experiment')
    
    let legendGroups = legend.selectAll('.key')
        .data([
            { experiment: 'A', fill: '#FF2A92' },
            { experiment: 'B', fill: '#EFE414' },
            { experiment: 'C', fill: '#14E5EF' }
        ])
        .enter().append('g')
        .attr('class', 'key')

    legendGroups.append('rect')
        .attr('y', -9)
        .attr('x', (d,i) => 65 + (i * 40))
        .attr('fill', d => d.fill)
        .attr('width', 10)
        .attr('height', 10)
    
    legendGroups.append('text')
        .attr('x', (d,i) => 80 + (i * 40))
        .text(d => d.experiment)

    // add text to the y axis
    let yAxisText = yAxis.append('text')
        .attr('fill', '#000')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text('Speed')
    
    // add bars to bar chart
    let chartBars = g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('fill', d => colorMap[d.Expt]) // fill based on the experiment

    resize()
    window.addEventListener('resize', resize)

    function resize() {
        // switch height and width in viewbox
        svg.attr('viewBox', window.innerWidth > breakpoint ? `0 0 ${svgWidth} ${svgHeight}` : `0 0 ${svgHeight} ${svgWidth}`)
        
        // adjust transform on legend
        legend.attr('transform', window.innerWidth > breakpoint ? `translate(${chartWidth - 120},25)` : `translate(150,25)`)

        // make y range increase instead of decrease
        y.range(window.innerWidth > breakpoint ? [chartHeight, 0] : [0, chartHeight])
        
        // call x axis again
        xAxis.attr('transform', window.innerWidth > breakpoint ? `translate(0,${chartHeight})` : 'translate(0,0)')
            .call(window.innerWidth > breakpoint ? d3.axisBottom(x) : d3.axisTop(y).ticks(5))
            // alternate way: d3.axisBottom(x) : d3.axisLeft(x) <-- this produces slanted tick marks
            // d3.axisBottom and d3.axisTop set 'y2' for the line, and 'y', 'dy' for the text
            // d3.axisLeft sets 'x2' for the line, and 'x', 'dy' for the text
            // when switching between axis generators, the tick marks keep the previous attributes, instead of overriding them
            // so you get tick lines with 'x' and 'y' attributes, resulting in the slant

        // call y axis again
        yAxis.call(window.innerWidth > breakpoint ?  d3.axisLeft(y).ticks(5) : d3.axisLeft(x))
        // alternate way: d3.axisLeft(y) : d3.axisTop(y) <-- but same problem with slanted ticks as above

        // redraw bars with new orientation
        chartBars.attr('x', d => window.innerWidth > breakpoint ? x(d.Run) : 0)
            .attr('y', d => window.innerWidth > breakpoint ? y(d.Speed) : x(d.Run))
            .attr('height', d => window.innerWidth > breakpoint ? chartHeight - y(d.Speed) : x.bandwidth())
            .attr('width', d => window.innerWidth > breakpoint ? x.bandwidth() :  y(d.Speed))

        // reformat the y axis text
        yAxisText.attr('transform', window.innerWidth > breakpoint ? 'rotate(-90)' : 'rotate(0)')
            .attr('x', window.innerWidth > breakpoint ? 0 : chartHeight)
    }

    // compare function to sort the data by letter of experiment
    // 'C' > 'B' > 'A'
    function compareExperiment(a, b) {
        if (a.Expt < b.Expt) return -1
        if (a.Expt > b.Expt) return 1
        return 0
      }

    d3.select('#sort-experiment').on('click', () => {
        // sort the data
        let sortedDataByExp = data.sort(compareExperiment)

        // update the domain to be the domain of the sorted data (by experiment)
        x.domain(sortedDataByExp.map(d => d.Run))

        // recall the x axis
        xAxis.attr('transform', window.innerWidth > breakpoint ? `translate(0,${chartHeight})` : 'translate(0,0)')
            .call(window.innerWidth > breakpoint ? d3.axisBottom(x) : d3.axisTop(y).ticks(5))
        
        // recall the y axis
        yAxis.call(window.innerWidth > breakpoint ?  d3.axisLeft(y).ticks(5) : d3.axisLeft(x))

        // bind the data, and use a key function to maintain object constancy
        chartBars.data(sortedDataByExp, d => d.Run) // d => d.Run is the key function! use d.Run as the element identifier
            .transition().duration(750)
            .attr('x', d => window.innerWidth > breakpoint ? x(d.Run) : 0)
            .attr('y', d => window.innerWidth > breakpoint ? y(d.Speed) : x(d.Run))
    })

    d3.select('#sort-run').on('click', () => {
        // sort the data
        let sortedDataByRun = data.sort((a,b) => a.Run - b.Run)

        // update the domain to be the domain of the sorted data (by run)
        x.domain(sortedDataByRun.map(d => d.Run))

        // recall the x axis
        xAxis.attr('transform', window.innerWidth > breakpoint ? `translate(0,${chartHeight})` : 'translate(0,0)')
            .call(window.innerWidth > breakpoint ? d3.axisBottom(x) : d3.axisTop(y).ticks(5))
        
        // recall the y axis
        yAxis.call(window.innerWidth > breakpoint ?  d3.axisLeft(y).ticks(5) : d3.axisLeft(x))

        // bind the data, and use a key function to maintain object constancy
        chartBars.data(sortedDataByRun, d => d.Run)
            .transition().duration(750)
            .attr('x', d => window.innerWidth > breakpoint ? x(d.Run) : 0)
            .attr('y', d => window.innerWidth > breakpoint ? y(d.Speed) : x(d.Run))
    })
})
