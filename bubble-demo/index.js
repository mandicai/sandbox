let width = 500,
  height = 400

// append the svg to a div that takes up 
let svg = d3.select('#bubble')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

let pack = d3.pack()
    .size([width, height])
    .padding(5)

// tooltip
let tooltip = d3.select('body')
  .append('div')
  .attr('class', 'tooltip invisible')

let z = d3.scaleSequential(d3.interpolatePlasma)

// need to replace this
d3.csv('https://rawgit.com/yanhann10/opendata_viz/master/lyric_repetitiveness/output.csv', function(error, data) {
  if (error) throw error

  // coerce the CSV data to the appropriate types
  data.forEach(d => {
    d.size = +d.size
    d.first_occur = +d.first_occur
  })

  // z.domain([d3.max(data, d => d.size), -20])
  z.domain([220, -20]) // using only a range on the palette
  redraw(data.filter(d => (d.song == 'Hello'))) // default

  // // radio button
  // d3.selectAll(("input[name='market']")).on('change', d => {
  //   let data_new = data.filter(d => (d.song == this.value))
  //   redraw(data_new)
  // })

  // keep track of resize for tooltip positioning
  resize()
  window.addEventListener('resize', resize)

  // http://stackoverflow.com/questions/288699/get-the-position-of-a-div-span-tag
  // tells you the x,y position of the element relative to the page
  // dirty hack/fixes for FireFox (code barfed on FF with NaN/NaN)
  function getNodePos(el) {
    let body = d3.select('body').node()

    for (var lx = 0, ly = 0; el != null && el != body; lx += (el.offsetLeft || el.clientLeft), ly += (el.offsetTop || el.clientTop), el = (el.offsetParent || el.parentNode));
    return {x: lx, y: ly}
  }

  function resize() {
     // calculate most of the coordinates for tooltipping just once:
     let scr = { x: window.scrollX, y: window.scrollY, w: window.innerWidth, h: window.innerHeight }
     // it's jolly rotten but <body> width/height can be smaller than the SVG it's carrying inside! :-((
     let body_sel = d3.select('body')
     // this is browser-dependent, but screw that for now!
     let body = { w: body_sel.node().offsetWidth, h: body_sel.node().offsetHeight }
     let doc = { w: document.width, h: document.height }
     let svgpos = getNodePos(svg.node())
     let dist = { x: d3.select('.tooltip').node().offsetWidth / 2, y: 20 }
    
    d3.selectAll('circle').on('mousemove', d => {
      tooltip
        .classed('invisible', false)
        .html('<table>'
          + '<thead>' + '<tr>' + '<th class="name">' + d.data.name + '</th>' + '</tr>' + '</thead>'
          + '<tbody>' +
          '<tr>' + '<td class="key">' + 'Number of repetitions' + '</td>' + '<td class="number">' + d.data.size + '</td>' + '</tr>' +
          '<tr>' + '<td class="key">' + 'First occurred after' + '<div>' + '(# of words)' + '</div>' + '</td>' + '<td class="number">' + (d.data.first_occur - 1) + '</td>' + '</tr>'
          + '</tbody>' +
          '</table>')

        let m = d3.mouse(svg.node()) // gets the position of the mouse as [x, y] relative to the svg
        scr.x = window.scrollX // scroll height x
        scr.y = window.scrollY // scroll height y
        m[0] += svgpos.x // takes into account the position of the svg relative to the body
        m[1] += svgpos.y

        // this needs to be here, or the tooltip size gets wonky
        tooltip.style('right', '')
        tooltip.style('left', '')
        tooltip.style('bottom', '')
        tooltip.style('top', '')

        // the right side of the chart
        if (m[0] > scr.x + scr.w / 2) {
          tooltip.style('right', `${scr.w - m[0] - 20}px`)
        }
        else { // the left side of the chart
          tooltip.style('left', `${m[0] - dist.x}px`)
        }
        // the top side of the chart
        if (m[1] > scr.y + scr.h / 2) {
          tooltip.style('bottom', `${scr.h - m[1] + dist.y}px`)
        }
        else { // the bottom side of the chart
          tooltip.style('top', `${m[1] + dist.y}px`)
        }
      })
      .on('mouseout', d => {
        tooltip.classed('invisible', true)
      })
  }

  // redraw(data)
  function redraw(classes){

    // transition
    let t = d3.transition()
      .duration(750)

    // hierarchy
    let h = d3.hierarchy({children: classes})
      .sum(d =>  { return d.size })

    // JOIN
    let circle = svg.selectAll('circle')
      .data(pack(h).leaves(), d => d.data.name)

    let text = svg.selectAll('text')
      .data(pack(h).leaves(), d => d.data.name)

    // EXIT
    circle.exit()
      .style('fill', '#b26745')
    .transition(t)
      .attr('r', 1e-6)
      .remove()

    text.exit()
      .transition(t)
      .attr('opacity', 1e-6)
      .remove()

    // UPDATE
    circle
      .transition(t)
      .style('fill', d => z(d.data.first_occur))
      .attr('r', d => { return d.r })
      .attr('cx', d => { return d.x })
      .attr('cy', d => { return d.y })

    text
      .transition(t)
      .attr('x', d => { return d.x })
      .attr('y', d => { return d.y })

    // ENTER
    circle.enter().append('circle')
      .attr('r', 1e-6)
      .attr('cx', d => { return d.x })
      .attr('cy', d => { return d.y })
      .style('fill', d => z(d.data.first_occur))
      .transition(t)
      .style('fill', d => z(d.data.first_occur))
      .attr('r', d => { return d.r })

    text.enter().append('text')
      .attr('opacity', 1e-6)
      .attr('x', d => { return d.x })
      .attr('y', d => { return d.y })
      .text(d => { return d.data.name })
      .attr('font-size','10px')
      .attr('opacity', 1)
    }
  })
