// based on this example: https://observablehq.com/@d3/selection-join
function randomLetters() {
    return d3.shuffle('abcdefghijklmnopqrstuvwxyz'.split(''))
        .slice(0, Math.floor(6 + Math.random() * 20))
        .sort()
}

// JOIN
let svgJoin = d3.select('#join')
            .append('svg')
            .attr('width', 500)
            .attr('height', 25)

setInterval(function () { 
    svgJoin.selectAll('text')
        .data(randomLetters(), d => d) // use the key function d => d so that elements update, instead of being regenerated, see https://bost.ocks.org/mike/constancy/
        .join(
            // what happens when new elements are appended/on initial append
            enter => enter.append('text')
                .attr('x', (d, i) => i * 16)
                .attr('fill', '#FF2A92')
                .text(d => d)
                .attr('y', -30)
            .call(enter => enter.transition().duration(750)
                .attr('y', 15)),
            //what happens when old elements are updated
            update => update
            .call(update => update.transition().duration(750) // we call transitions to avoid breaking the method chain
                .attr('fill', 'black')
                .attr('x', (d, i) => i * 16)),
            // what happens when elements are no longer needed/are removed
            exit => exit
                .attr('fill', '#74D5FF')
            .call(exit => exit.transition().duration(750)
                .attr('y', '100')
                .remove())
        )
}, 1000)

// MERGE
let svgMerge = d3.select('#merge')
            .append('svg')
            .attr('width', 500)
            .attr('height', 25)

setInterval(function () { 
    let letters = svgMerge.selectAll('text')
        .data(randomLetters(), d => d)

    letters.enter().append('text')
        .attr('fill', '#FF2A92')
        .attr('y', 15)
        .text(d => d)
        .merge(letters)
            .transition().duration(750)
            .attr('fill', 'black')
            .attr('x', (d, i) => i * 16)
    
    letters.exit()
        .attr('fill', '#74D5FF')
        .transition().duration(750)
        .attr('y', '100')
        .remove()
}, 1000)
